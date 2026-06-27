"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Notes", href: "/notes" },
  { label: "Assignments", href: "/assignments" },
  { label: "Lab Reports", href: "/lab-reports" },
  { label: "Calendar", href: "/calendar" },
  { label: "Teachers", href: "/teachers" },
  { label: "Files", href: "/files" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="hidden md:block sticky top-0 z-50">
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/orio.png"
            alt="Orios Class"
            className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-200"
          />
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Orios Class
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
          ) : (
            <div className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
    </nav>
  );
}
