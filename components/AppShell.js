"use client";

import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import SearchOverlay from "@/components/SearchOverlay";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <TopNav />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
      <SearchOverlay />
    </div>
  );
}
