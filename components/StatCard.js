export default function StatCard({ icon: Icon, value, label, href }) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 min-w-[150px] snap-start"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">
          {value}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
          {label}
        </span>
      </div>
    </Wrapper>
  );
}
