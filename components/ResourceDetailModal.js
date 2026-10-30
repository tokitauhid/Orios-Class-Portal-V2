"use client";

import { useEffect, useState } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { triggerDownload } from "@/lib/download";
import {
  X,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  FileText,
  FlaskConical,
  ClipboardList,
  BookOpen,
  FolderOpen,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  User,
  HardDrive,
  Info,
} from "lucide-react";

/**
 * Normalizes item properties across Assignments, Lab Reports, Notes, Exams, and Files.
 */
function normalizeItem(item) {
  if (!item) return null;

  const rawType = (item.type || item.itemType || item._type || "").toLowerCase();

  let category = "resource";
  if (rawType.includes("assign")) category = "assignment";
  else if (rawType.includes("lab")) category = "lab";
  else if (rawType.includes("exam")) category = "exam";
  else if (rawType.includes("note")) category = "note";
  else if (rawType.includes("file")) category = "file";
  else if (["pdf", "doc", "pptx", "link", "image", "code", "zip"].includes(rawType)) {
    category = item.uploadedBy || item.uploaded_by || item.size ? "file" : "note";
  }

  const title = item.title || item.name || item.resourceTitle || "Untitled";
  const description = item.description || "";
  const subjectId = item.subjectId || item.subject_id || null;
  const dueDate = item.dueDate || item.due_date || item.examDate || item.exam_date || item.date || null;
  const labNumber = item.labNumber ?? item.lab_number ?? null;
  const status = item.status || null;
  const size = item.size || null;
  const uploadedBy = item.uploadedBy || item.uploaded_by || null;

  // Extract downloadable attachments
  const attachments = [];

  if (Array.isArray(item.attachments) && item.attachments.length > 0) {
    item.attachments.forEach((att, idx) => {
      if (att && att.url) {
        const isWebLink =
          att.type === "link" ||
          (!att.url.includes("/storage/v1/object/public/") &&
            att.url.startsWith("http") &&
            !att.url.match(/\.(pdf|docx?|pptx?|xlsx?|zip|png|jpe?g)$/i));
        attachments.push({
          id: `att-${idx}`,
          name: att.name || `Attachment ${idx + 1}`,
          url: att.url,
          isLink: isWebLink,
        });
      }
    });
  }

  const directUrl = item.file || item.file_url || item.fileUrl || item.url;
  if (directUrl && typeof directUrl === "string") {
    const exists = attachments.some((a) => a.url === directUrl);
    if (!exists) {
      const isWebLink =
        rawType === "link" ||
        (!directUrl.includes("/storage/v1/object/public/") &&
          directUrl.startsWith("http") &&
          !directUrl.match(/\.(pdf|docx?|pptx?|xlsx?|zip|png|jpe?g)$/i));
      attachments.push({
        id: "direct-url",
        name: item.resourceTitle || title || "File Attachment",
        url: directUrl,
        isLink: isWebLink,
      });
    }
  }

  return {
    raw: item,
    category,
    title,
    description,
    subjectId,
    dueDate,
    labNumber,
    status,
    size,
    uploadedBy,
    attachments,
  };
}

const categoryConfig = {
  assignment: {
    label: "Assignment",
    icon: ClipboardList,
    badge: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20",
  },
  lab: {
    label: "Lab Report",
    icon: FlaskConical,
    badge: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20",
  },
  exam: {
    label: "Exam",
    icon: BookOpen,
    badge: "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20",
  },
  note: {
    label: "Note",
    icon: FileText,
    badge: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20",
  },
  file: {
    label: "File",
    icon: FolderOpen,
    badge: "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-200/60 dark:border-violet-500/20",
  },
  resource: {
    label: "Resource",
    icon: FileText,
    badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700",
  },
};

const statusBadgeConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    badge: "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    badge: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeDateLabel(dateStr, isExam = false) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const daysAgo = Math.abs(diffDays);
    if (daysAgo === 0) return "Due today";
    return isExam ? "Event passed" : `${daysAgo}d overdue`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `${diffDays} days left`;
}

/**
 * Universal ResourceDetailModal
 *
 * Provides a rich, non-truncated detail view for any assignment, lab report, note, exam, or file.
 * Includes clear metadata, full title & description, and an explicit download action when files exist.
 */
export default function ResourceDetailModal({ isOpen, onClose, item }) {
  const { getSubject, getColor } = useSubjectColors();
  const [downloadingUrl, setDownloadingUrl] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const normalized = normalizeItem(item);
  const cat = categoryConfig[normalized.category] || categoryConfig.resource;
  const CategoryIcon = cat.icon;

  const subject = normalized.subjectId ? getSubject(normalized.subjectId) : null;
  const subjectColors = normalized.subjectId ? getColor(normalized.subjectId) : null;

  // Calculate dynamic status if pending/overdue
  let dynamicStatus = normalized.status;
  if (dynamicStatus === "pending" && normalized.dueDate && new Date(normalized.dueDate) < new Date()) {
    dynamicStatus = "overdue";
  }
  const statusConfig = dynamicStatus ? statusBadgeConfig[dynamicStatus] : null;

  const formattedDate = formatDate(normalized.dueDate);
  const relativeDate = getRelativeDateLabel(normalized.dueDate, normalized.category === "exam");

  const handleDownload = async (resource) => {
    if (resource.isLink) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }
    setDownloadingUrl(resource.url);
    try {
      await triggerDownload(resource.url, resource.name);
    } finally {
      setTimeout(() => setDownloadingUrl(null), 1000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-detail-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.badge}`}
            >
              <CategoryIcon size={13} strokeWidth={2} />
              {normalized.category === "lab" && normalized.labNumber
                ? `Lab ${normalized.labNumber}`
                : cat.label}
            </span>

            {/* Subject Badge */}
            {subject && subjectColors && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${subjectColors.border} ${subjectColors.bg} ${subjectColors.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${subjectColors.dot}`} />
                {subject.code}
              </span>
            )}

            {/* Status Badge */}
            {statusConfig && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${statusConfig.badge}`}
              >
                {statusConfig.label}
              </span>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Full Title (Never truncated) */}
          <div>
            <h2
              id="resource-detail-title"
              className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug break-words"
            >
              {normalized.title}
            </h2>
            {subject && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {subject.name}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          {(formattedDate || normalized.size || normalized.uploadedBy) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
              {formattedDate && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <Calendar size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium">{formattedDate}</span>
                    {relativeDate && (
                      <span className="ml-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                        ({relativeDate})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {normalized.size && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <HardDrive size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span>Size: {normalized.size}</span>
                </div>
              )}

              {normalized.uploadedBy && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <User size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">By {normalized.uploadedBy}</span>
                </div>
              )}
            </div>
          )}

          {/* Full Description (Never truncated) */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Description & Details
            </h4>
            {normalized.description ? (
              <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words bg-zinc-50/70 dark:bg-zinc-850/50 p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/60">
                {normalized.description}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 italic p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-850/30 border border-dashed border-zinc-200 dark:border-zinc-800">
                No description provided.
              </p>
            )}
          </div>

          {/* Attachments & Explicit Download Action */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Files & Attachments
            </h4>

            {normalized.attachments.length > 0 ? (
              <div className="space-y-2">
                {normalized.attachments.map((att) => {
                  const isDownloading = downloadingUrl === att.url;
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          {att.isLink ? (
                            <ExternalLink size={16} strokeWidth={2} />
                          ) : (
                            <FileText size={16} strokeWidth={2} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words leading-tight">
                            {att.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {att.isLink ? "External web resource" : "Downloadable file"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownload(att)}
                        disabled={isDownloading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all duration-150 ${
                          att.isLink
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-xs active:scale-95"
                        }`}
                      >
                        {att.isLink ? (
                          <>
                            <ExternalLink size={13} />
                            <span>Open</span>
                          </>
                        ) : (
                          <>
                            <Download size={13} />
                            <span>{isDownloading ? "Starting..." : "Download"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Clear indication when no file exists - does not make tap appear broken */
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 dark:text-zinc-500">
                  <Paperclip size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    No file attached
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    This item has no attached documents or external download links.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

