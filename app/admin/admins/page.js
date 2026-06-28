"use client";

import { useState, useEffect } from "react";
import { getAdminsDb, saveAdminsDb, useAdminAuth } from "@/lib/admin-auth";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { ShieldAlert, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const columns = [
  { key: "email", label: "Email Address" },
  {
    key: "role",
    label: "Role",
    render: (item) => (
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
          item.role === "super_admin"
            ? "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
        }`}
      >
        {item.role === "super_admin" ? "Super Admin" : "Admin"}
      </span>
    ),
  },
];

const fields = [
  { key: "email", label: "Email Address", type: "text", required: true, placeholder: "admin@orios.edu" },
  { key: "password", label: "Password", type: "text", required: true, placeholder: "Enter password" },
  { key: "role", label: "Role", type: "select", required: true, options: roleOptions },
];

export default function AdminManagementPage() {
  const { user, isLoading } = useAdminAuth();
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setData(getAdminsDb());
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Double check authorization on client side
  if (!user || user.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Access Denied</h2>
        <p className="text-sm text-zinc-500 mt-1 max-w-xs">
          Only Super Admins can manage administrator accounts.
        </p>
      </div>
    );
  }

  const handleAdd = (item) => {
    const updated = [item, ...data];
    setData(updated);
    saveAdminsDb(updated);
  };

  const handleUpdate = (item) => {
    const updated = data.map((a) => (a.id === item.id ? item : a));
    setData(updated);
    saveAdminsDb(updated);
  };

  const handleDelete = (item) => {
    // Prevent self-deletion
    if (item.email.toLowerCase() === user.email.toLowerCase()) {
      alert("You cannot delete your own admin account while logged in.");
      return;
    }
    const updated = data.filter((a) => a.id !== item.id);
    setData(updated);
    saveAdminsDb(updated);
  };

  return (
    <AdminCrudPage
      title="Admin Account"
      icon={Users}
      iconColor="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["email"]}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
