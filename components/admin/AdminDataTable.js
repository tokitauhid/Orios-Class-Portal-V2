"use client";

import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Universal data table for admin CRUD pages.
 *
 * Props:
 *  - columns: [{ key, label, render?, sortable? }]
 *  - data: array of objects
 *  - searchKeys: array of keys to search across
 *  - onEdit: (item) => void
 *  - onDelete: (item) => void
 */
export default function AdminDataTable({ columns, data, searchKeys = [], onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (typeof val === "string") return val.toLowerCase().includes(q);
        if (typeof val === "number") return String(val).includes(q);
        return false;
      })
    );
  }, [data, search, searchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const comp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? comp : -comp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleDeleteClick(item) {
    if (deleteConfirm === item.id) {
      onDelete?.(item);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(item.id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm((prev) => (prev === item.id ? null : prev)), 3000);
    }
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-150"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tabular-nums">
          {sorted.length}
        </span>
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block rounded-xl border border-zinc-200 dark:border-zinc-800/60 overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  className={`px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 ${
                    col.sortable !== false ? "cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-400 select-none" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === "asc"
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12 text-sm text-zinc-400 dark:text-zinc-600">
                  No items found
                </td>
              </tr>
            ) : (
              sorted.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/30 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors duration-100 cursor-pointer"
                  onClick={() => onEdit?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {col.render ? col.render(item) : (item[col.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit?.(item)}
                        className="p-1.5 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className={`p-1.5 rounded-md transition-colors ${
                          deleteConfirm === item.id
                            ? "text-white bg-red-500 hover:bg-red-600"
                            : "text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        }`}
                        title={deleteConfirm === item.id ? "Click again to confirm" : "Delete"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-400 dark:text-zinc-600">
            No items found
          </div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.id}
              onClick={() => onEdit?.(item)}
              className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 p-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-150 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  {columns.slice(0, 3).map((col) => (
                    <div key={col.key}>
                      {col === columns[0] ? (
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {col.render ? col.render(item) : (item[col.key] ?? "—")}
                        </h4>
                      ) : (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                          <span className="text-zinc-400 dark:text-zinc-600">{col.label}: </span>
                          {col.render ? col.render(item) : (item[col.key] ?? "—")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit?.(item)}
                    className="p-1.5 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className={`p-1.5 rounded-md transition-colors ${
                      deleteConfirm === item.id
                        ? "text-white bg-red-500"
                        : "text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
