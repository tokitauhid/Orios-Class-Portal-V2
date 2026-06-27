export default function StatCard({ icon: Icon, value, label, href }) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      href={href}
      className="flex flex-col items-center gap-1 px-2 py-3 md:flex-row md:items-center md:gap-3 md:px-4 md:py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
    >
      <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
        <Icon size={16} strokeWidth={1.8} className="md:hidden" />
        <Icon size={20} strokeWidth={1.8} className="hidden md:block" />
      </div>
      <div className="flex flex-col items-center md:items-start">
        <span className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">
          {value}
        </span>
        <span className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 text-center md:text-left">
          {label}
        </span>
      </div>
    </Wrapper>
  );
}
