"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  CalendarDays,
  FolderOpen,
  Menu,
} from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Schedule", href: "/calendar", icon: CalendarDays },
  { label: "Files", href: "/files", icon: FolderOpen },
  { label: "More", href: "/more", icon: Menu },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-zinc-950/80 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50" />

      <div className="relative flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-16">
        {tabs.map((tab) => {
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
  );
}
