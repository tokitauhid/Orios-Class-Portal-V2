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
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-500/25 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold",
  },
  lab: {
    label: "Lab Report",
    icon: FlaskConical,
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-bold",
  },
  exam: {
    label: "Exam",
    icon: BookOpen,
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-500/25 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold",
  },
  note: {
    label: "Note",
    icon: FileText,
    badge: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/25 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 font-bold",
  },
  file: {
    label: "File",
    icon: FolderOpen,
    badge: "bg-violet-100 text-violet-900 dark:bg-violet-500/25 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40 font-bold",
  },
  resource: {
    label: "Resource",
    icon: FileText,
    badge: "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-bold",
  },
};

const statusBadgeConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-500/25 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-500/25 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-bold",
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
 * Renders text with clickable, high-visibility styled URLs.
 */
function renderFormattedDescription(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2 hover:text-indigo-500 dark:hover:text-indigo-300 break-all transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

/**
 * Universal ResourceDetailModal
 *
 * Provides a high-contrast, crystal-clear detail view for any assignment, lab report, note, exam, or file.
 * Features maximum readability in both light and dark themes with zero truncated text.
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
        className="fixed inset-0 bg-zinc-950/70 dark:bg-zinc-950/85 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cat.badge}`}
            >
              <CategoryIcon size={14} strokeWidth={2.2} />
              {normalized.category === "lab" && normalized.labNumber
                ? `Lab ${normalized.labNumber}`
                : cat.label}
            </span>

            {/* Subject Badge */}
            {subject && subjectColors && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${subjectColors.border} ${subjectColors.bg} ${subjectColors.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${subjectColors.dot}`} />
                {subject.code}
              </span>
            )}

            {/* Status Badge */}
            {statusConfig && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusConfig.badge}`}
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
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Full Title (Never truncated) */}
          <div>
            <h2
              id="resource-detail-title"
              className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug break-words"
            >
              {normalized.title}
            </h2>
            {subject && (
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mt-1">
                {subject.name}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          {(formattedDate || normalized.size || normalized.uploadedBy) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-zinc-100/90 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs">
              {formattedDate && (
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <Calendar size={15} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formattedDate}</span>
                    {relativeDate && (
                      <span className="ml-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                        ({relativeDate})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {normalized.size && (
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <HardDrive size={15} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span className="font-medium">Size: <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{normalized.size}</strong></span>
                </div>
              )}

              {normalized.uploadedBy && (
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <User size={15} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span className="font-medium truncate">By <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{normalized.uploadedBy}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Full Description (Never truncated) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-2">
              Description & Details
            </h4>
            {normalized.description ? (
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap break-words bg-zinc-100/90 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-4 rounded-xl shadow-xs">
                {renderFormattedDescription(normalized.description)}
              </div>
            ) : (
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 italic p-3.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/50 border border-dashed border-zinc-300 dark:border-zinc-700">
                No description provided.
              </p>
            )}
          </div>

          {/* Attachments & Explicit Download Action */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-2">
              Files & Attachments
            </h4>

            {normalized.attachments.length > 0 ? (
              <div className="space-y-2">
                {normalized.attachments.map((att) => {
                  const isDownloading = downloadingUrl === att.url;
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
                          {att.isLink ? (
                            <ExternalLink size={17} strokeWidth={2} />
                          ) : (
                            <FileText size={17} strokeWidth={2} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words leading-tight">
                            {att.name}
                          </p>
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {att.isLink ? "External web resource" : "Downloadable file"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownload(att)}
                        disabled={isDownloading}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer ${
                          att.isLink
                            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95"
                        }`}
                      >
                        {att.isLink ? (
                          <>
                            <ExternalLink size={14} />
                            <span>Open</span>
                          </>
                        ) : (
                          <>
                            <Download size={14} />
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
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300">
                  <Paperclip size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    No file attached
                  </p>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                    This item has no attached documents or external download links.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-300 dark:border-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
