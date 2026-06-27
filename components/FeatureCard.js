import Link from "next/link";
import {
  FileText,
  ClipboardList,
  FlaskConical,
  Calendar,
  GraduationCap,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

const iconMap = {
  FileText,
  ClipboardList,
  FlaskConical,
  Calendar,
  GraduationCap,
  FolderOpen,
};

export default function FeatureCard({ title, description, href, icon }) {
  const Icon = iconMap[icon] || FileText;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:shadow-sm dark:hover:shadow-none"
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 shrink-0">
        <Icon size={22} strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
          {description}
        </p>
      </div>
      <ChevronRight
        size={16}
        className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
      />
    </Link>
  );
}
