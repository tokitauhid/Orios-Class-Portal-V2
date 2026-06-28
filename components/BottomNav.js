"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import {
  Home,
  FileText,
  CalendarDays,
  Search,
  Menu,
  X,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  FolderOpen,
  Sun,
  Moon,
  Info,
  Shield,
} from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Search", href: null, icon: Search, isCenter: true },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "More", href: null, icon: Menu, isMore: true },
];

const moreMenuItems = [
  { label: "Assignments", description: "Track assignments and due dates", href: "/assignments", icon: ClipboardList },
  { label: "Lab Reports", description: "Lab reports by subject", href: "/lab-reports", icon: FlaskConical },
  { label: "Teachers", description: "Contact info for teachers", href: "/teachers", icon: GraduationCap },
  { label: "Files", description: "Share and download materials", href: "/files", icon: FolderOpen },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Bottom Sheet Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-45 md:hidden transition-transform duration-300 ease-out ${menuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        style={{ zIndex: 45 }}
      >
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg backdrop-saturate-150 rounded-t-2xl border-t border-zinc-200/50 dark:border-zinc-700/30 pb-20 max-h-[70vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              More
            </h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="px-4 space-y-1">
            {moreMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150 group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      {item.description}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>

          {/* Divider + Preferences */}
          <div className="mx-5 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/40">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
              Preferences
            </span>
            <div className="mt-2 space-y-1">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {mounted ? (
                    theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />
                  ) : (
                    <div className="w-[18px] h-[18px]" />
                  )}
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
                </span>
              </button>

              {/* Admin Panel */}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  <Shield size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
                    Admin Panel
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                    Manage portal content
                  </span>
                </div>
                <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* About */}
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <Info size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
                    Orios Class v2
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                    Built with ♥
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glassmorphism backdrop */}
        <div className="absolute inset-0 bg-zinc-950/80 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50" />

        <div className="relative flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-16">
          {tabs.map((tab) => {
            if (tab.isCenter) {
              return (
                <button
                  key="search"
                  className="flex flex-col items-center justify-center gap-0.5 -mt-5"
                  onClick={() => {
                    // TODO: Open search overlay
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform duration-150">
                    <Search size={22} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-indigo-400 mt-0.5">
                    Search
                  </span>
                </button>
              );
            }

            if (tab.isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className={`
                    flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl
                    transition-all duration-200 min-w-[56px]
                    ${menuOpen ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"}
                  `}
                >
                  <div className="relative">
                    {menuOpen ? (
                      <X size={22} strokeWidth={2.5} />
                    ) : (
                      <Menu size={22} strokeWidth={1.8} />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${menuOpen ? "text-indigo-400" : ""}`}>
                    More
                  </span>
                </button>
              );
            }

            const isActive = tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl
                  transition-all duration-200 min-w-[56px]
                  ${isActive
                    ? "text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-300"
                  }
                `}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-indigo-400" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
