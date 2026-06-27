"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import {
  FileText,
  ClipboardList,
  FlaskConical,
  CalendarDays,
  GraduationCap,
  FolderOpen,
  Sun,
  Moon,
  Settings,
  Info,
} from "lucide-react";

const menuItems = [
  { label: "Notes", description: "Subject-wise notes and resources", href: "/notes", icon: FileText },
  { label: "Assignments", description: "Track assignments and due dates", href: "/assignments", icon: ClipboardList },
  { label: "Lab Reports", description: "Lab reports organized by subject", href: "/lab-reports", icon: FlaskConical },
  { label: "Calendar", description: "Events, routine, and important dates", href: "/calendar", icon: CalendarDays },
  { label: "Teachers", description: "Contact info for all teachers", href: "/teachers", icon: GraduationCap },
  { label: "Files", description: "Share and download class materials", href: "/files", icon: FolderOpen },
];

export default function MorePage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-6 pt-6 md:pt-10 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            More
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
            All pages and settings
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                    {item.label}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    {item.description}
                  </span>
                </div>
                <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/40">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-3">
            Preferences
          </h2>
          <div className="space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                {mounted ? (
                  theme === "dark" ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                  {mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  Switch appearance
                </span>
              </div>
            </button>

            {/* About */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Info size={20} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Orios Class v2
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  Built with ♥
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
