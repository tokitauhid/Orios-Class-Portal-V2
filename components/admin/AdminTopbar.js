"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Menu, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminTopbar({ title, onMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/60">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3.5">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800/60 pr-3.5 h-6">
            <span className="hidden sm:inline text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {user.email}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              {user.role === "super_admin" ? "Super" : "Admin"}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
