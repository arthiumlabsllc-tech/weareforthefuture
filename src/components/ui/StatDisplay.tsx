interface StatDisplayProps {
  value: number | string;
  label: string;
  suffix?: string;
  prefix?: string;
}

/**
 * Static statistic display — no count-up animation.
 *
 * Replaces `AnimatedCounter` (Phase 3b.1). The brief prefers stable, instantly
 * readable numbers over count-up motion (which also caused layout shift and
 * rendered 0 in non-hydrated/preview captures). Kept as a plain, hook-free
 * component so it can be used from either server or client components.
 *
 * Formatting matches the old counter so existing stat grids keep their rhythm.
 */
function formatNumber(value: number | string): string {
  if (typeof value === "string") return value;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return value.toLocaleString();
}

export default function StatDisplay({
  value,
  label,
  suffix = "",
  prefix = "",
}: StatDisplayProps) {
  return (
    <div className="text-center">
      <div className="font-[family-name:var(--font-display)] text-4xl font-bold text-text-primary tabular-nums md:text-5xl lg:text-6xl">
        {prefix}
        {formatNumber(value)}
        {suffix}
      </div>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.15em] text-text-muted">
        {label}
      </p>
    </div>
  );
}
