"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

/**
 * Universal slide-in form drawer for admin CRUD.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (formData) => void
 *  - title: string
 *  - fields: [{ key, label, type, options?, placeholder?, required? }]
 *    types: "text", "textarea", "select", "date", "number", "file", "toggle", "multi-select"
 *  - initialData: object | null (null = add mode, object = edit mode)
 */
export default function AdminFormDrawer({ isOpen, onClose, onSubmit, title, fields = [], initialData = null }) {
  const [formData, setFormData] = useState({});
  const isEditing = !!initialData;

  // Initialize form data when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Set defaults
        const defaults = {};
        fields.forEach((f) => {
          if (f.type === "toggle") defaults[f.key] = false;
          else if (f.type === "multi-select") defaults[f.key] = [];
          else defaults[f.key] = f.defaultValue ?? "";
        });
        setFormData(defaults);
      }
    }
  }, [isOpen, initialData, fields]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleChange(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  }

  function handleMultiSelectToggle(key, value) {
    setFormData((prev) => {
      const arr = prev[key] || [];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...arr, value] };
    });
  }

  function handleAddAttachment(fieldKey) {
    setFormData((prev) => {
      const arr = prev[fieldKey] || [];
      return {
        ...prev,
        [fieldKey]: [
          ...arr,
          { type: "upload", name: "", file: null, url: "" }
        ]
      };
    });
  }

  function handleUpdateAttachment(fieldKey, index, keyOrUpdates, value) {
    setFormData((prev) => {
      const arr = [...(prev[fieldKey] || [])];
      if (typeof keyOrUpdates === "object" && keyOrUpdates !== null) {
        arr[index] = { ...arr[index], ...keyOrUpdates };
      } else {
        arr[index] = { ...arr[index], [keyOrUpdates]: value };
      }
      return { ...prev, [fieldKey]: arr };
    });
  }

  function handleRemoveAttachment(fieldKey, index) {
    setFormData((prev) => {
      const arr = [...(prev[fieldKey] || [])];
      arr.splice(index, 1);
      return { ...prev, [fieldKey]: arr };
    });
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[75] w-full max-w-md flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800/60 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-200 dark:border-zinc-800/60 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {isEditing ? `Edit ${title}` : `Add ${title}`}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-150 resize-none"
                />
              ) : field.type === "select" ? (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-150"
                >
                  <option value="">Select...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "multi-select" ? (
                <div className="flex flex-wrap gap-1.5">
                  {(field.options || []).map((opt) => {
                    const selected = (formData[field.key] || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleMultiSelectToggle(field.key, opt.value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                          selected
                            ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ) : field.type === "toggle" ? (
                <button
                  type="button"
                  onClick={() => handleChange(field.key, !formData[field.key])}
                  className={`w-10 h-[22px] rounded-full flex items-center px-0.5 transition-colors duration-200 ${
                    formData[field.key] ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    formData[field.key] ? "translate-x-[18px]" : "translate-x-0"
                  }`} />
                </button>
              ) : field.type === "file" ? (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 dark:text-zinc-500 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>{formData[field.key] ? "File selected" : "Choose file"}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleChange(field.key, file);
                      }}
                    />
                  </label>
                  {formData[field.key] && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 truncate max-w-[150px]">
                      {formData[field.key]?.name || formData[field.key]}
                    </span>
                  )}
                </div>
              ) : field.type === "attachments" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Attachments List
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddAttachment(field.key)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      + Add Attachment
                    </button>
                  </div>
                  
                  {(formData[field.key] || []).length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-400 dark:text-zinc-650">
                      No attachments added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(formData[field.key] || []).map((att, index) => (
                        <div
                          key={index}
                          className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 relative group"
                        >
                          <div className="flex items-center gap-2 justify-between">
                            <select
                              value={att.type || "upload"}
                              onChange={(e) => handleUpdateAttachment(field.key, index, "type", e.target.value)}
                              className="text-[10px] font-semibold bg-transparent border-none outline-none text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            >
                              <option value="upload">File Upload</option>
                              <option value="link">Web Link</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(field.key, index)}
                              className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={att.name || ""}
                            onChange={(e) => handleUpdateAttachment(field.key, index, "name", e.target.value)}
                            placeholder="Label/Name (e.g. Lab sheet)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                          />

                          {att.type === "link" ? (
                            <input
                              type="text"
                              value={att.url || ""}
                              onChange={(e) => handleUpdateAttachment(field.key, index, "url", e.target.value)}
                              placeholder="Link URL (https://...)"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-500 dark:text-zinc-400 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-colors">
                                <Upload size={10} />
                                <span>Choose File</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const updates = { file };
                                      if (!att.name) {
                                        updates.name = file.name;
                                      }
                                      handleUpdateAttachment(field.key, index, updates);
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 truncate max-w-[150px]">
                                {att.file?.name || (att.url ? att.url.split("/").pop().split("?")[0] : "No file")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={field.type || "text"}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-150"
                />
              )}
            </div>
          ))}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-200 dark:border-zinc-800/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
          >
            {isEditing ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </>
  );
}
