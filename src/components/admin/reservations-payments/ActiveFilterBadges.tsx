import type { FilterBadgeItem } from './types';

export function ActiveFilterBadges({
  items,
  className = '',
}: {
  items: FilterBadgeItem[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <div
      className={['flex flex-wrap items-center gap-1.5', className].filter(Boolean).join(' ')}
      aria-label="Filtros activos"
    >
      {items.map((b) => (
        <span
          key={b.key}
          className="badge badge-outline badge-sm max-w-[min(100%,24rem)] gap-1 py-1.5 text-left align-top font-normal whitespace-normal"
        >
          <span className="text-base-content/55 shrink-0">{b.label}</span>
          <span className="font-medium break-all">{b.value}</span>
        </span>
      ))}
    </div>
  );
}
