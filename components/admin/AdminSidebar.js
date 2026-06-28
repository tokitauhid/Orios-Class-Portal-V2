"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  FolderOpen,
  CalendarDays,
  BookOpen,
  X,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Notes", href: "/admin/notes", icon: FileText },
  { label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
  { label: "Lab Reports", href: "/admin/lab-reports", icon: FlaskConical },
  { label: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { label: "Files", href: "/admin/files", icon: FolderOpen },
  { label: "Routine", href: "/admin/routine", icon: CalendarDays, children: [
    { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  ]},
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  function renderNavItem(item) {
    const Icon = item.icon;
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);
    const hasActiveChild = item.children?.some((c) => pathname.startsWith(c.href));

    return (
      <div key={item.href}>
        <Link
          href={item.href}
          onClick={onClose}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-150
            ${isActive || hasActiveChild
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
            }
          `}
        >
          <Icon size={16} strokeWidth={isActive || hasActiveChild ? 2 : 1.8} />
          {item.label}
        </Link>
        {item.children && (
          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800/40 pl-2">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium
                    transition-all duration-150
                    ${isChildActive
                      ? "text-indigo-700 dark:text-indigo-400"
                      : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }
                  `}
                >
                  <ChildIcon size={13} strokeWidth={isChildActive ? 2 : 1.8} />
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col
          bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/60
          transition-transform duration-300 ease-out
          md:translate-x-0 md:static md:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">O</span>
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Orios Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/60 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/5 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={16} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
