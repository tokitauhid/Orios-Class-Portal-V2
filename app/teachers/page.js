"use client";

import { mockTeachers } from "@/lib/mock-data";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

const accentColors = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
];

export default function TeachersPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-rose-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-rose-950/20" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-6 pt-5 md:pt-10 pb-4 md:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Teachers
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {mockTeachers.length} teachers this semester
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <GraduationCap size={20} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Cards */}
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-24 md:pb-10 mt-4 md:mt-6">
        <div className="space-y-3">
          {mockTeachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 overflow-hidden"
            >
              {/* Top: name + subject */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Avatar */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shrink-0 ${accentColors[index % accentColors.length]}`}>
                  {teacher.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {teacher.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {teacher.subject} · {teacher.role}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <a
                  href={`mailto:${teacher.email}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  <Mail size={13} className="text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{teacher.email}</span>
                </a>
                <a
                  href={`tel:${teacher.phone}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  <Phone size={13} className="text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{teacher.phone}</span>
                </a>
                <div className="flex items-center gap-2 px-2.5 py-1.5">
                  <MapPin size={13} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{teacher.room}</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5">
                  <Clock size={13} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{teacher.officeHours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
