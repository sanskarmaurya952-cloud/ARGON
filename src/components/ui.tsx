import { cn } from "../lib/cn";
export function Pill({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "tap focus-ring inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "border-pine-800 bg-pine-800 text-cream-50 shadow-[0_2px_0_0_#071f16]"
          : "border-pine-200 bg-cream-50 text-pine-800 hover:border-pine-400 hover:bg-pine-50",
        className
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function StatChip({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-pine-100 bg-cream-50 px-3 py-2">
      {icon && <span className="text-marigold-600">{icon}</span>}
      <div className="leading-tight">
        <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-pine-500">{label}</div>
        <div className="text-sm font-bold text-pine-900">{value}</div>
      </div>
    </div>
  );
}
