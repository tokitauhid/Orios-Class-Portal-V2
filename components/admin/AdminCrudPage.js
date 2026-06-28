"use client";

import { useState } from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminFormDrawer from "@/components/admin/AdminFormDrawer";
import { Plus } from "lucide-react";

/**
 * Universal CRUD page composer.
 * Each admin data section is just a config passed to this component.
 *
 * Props:
 *  - title: string (singular, e.g. "Note")
 *  - icon: Lucide icon component
 *  - iconColor: tailwind color classes for the header icon
 *  - columns: array for AdminDataTable
 *  - fields: array for AdminFormDrawer
 *  - data: array of items
 *  - searchKeys: array of keys to search
 *  - onAdd: (item) => void
 *  - onUpdate: (item) => void
 *  - onDelete: (item) => void
 */
export default function AdminCrudPage({
  title,
  icon: Icon,
  iconColor = "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  columns,
  fields,
  data,
  searchKeys,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  function handleEdit(item) {
    setEditingItem(item);
    setDrawerOpen(true);
  }

  function handleAdd() {
    setEditingItem(null);
    setDrawerOpen(true);
  }

  function handleSubmit(formData) {
    if (editingItem) {
      onUpdate?.({ ...editingItem, ...formData });
    } else {
      onAdd?.({ ...formData, id: Date.now() });
    }
    setDrawerOpen(false);
    setEditingItem(null);
  }

  function handleDelete(item) {
    onDelete?.(item);
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconColor}`}>
              <Icon size={18} strokeWidth={1.8} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {title}s
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {data.length} total
            </p>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2} />
          Add {title}
        </button>
      </div>

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={data}
        searchKeys={searchKeys}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Drawer */}
      <AdminFormDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        title={title}
        fields={fields}
        initialData={editingItem}
      />
    </div>
  );
}
