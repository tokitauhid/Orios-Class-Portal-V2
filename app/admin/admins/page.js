"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
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
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/accounts");
      const list = await res.json();
      if (!res.ok) throw new Error(list.error || "Failed to load admin accounts");
      setData(list);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (user && user.role === "super_admin") {
      fetchAdmins();
    }
  }, [user]);

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

  const handleAdd = async (item) => {
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to add admin account");
      setData((prev) => [resData, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (item) => {
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, role: item.role }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update admin account");
      setData((prev) => prev.map((a) => (a.id === item.id ? resData : a)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (item) => {
    // Prevent self-deletion
    if (item.email.toLowerCase() === user.email.toLowerCase()) {
      alert("You cannot delete your own admin account while logged in.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/accounts?id=${item.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to delete admin account");
      setData((prev) => prev.filter((a) => a.id !== item.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {errorMsg && (
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
            {errorMsg}
          </div>
        </div>
      )}
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
    </div>
  );
}
