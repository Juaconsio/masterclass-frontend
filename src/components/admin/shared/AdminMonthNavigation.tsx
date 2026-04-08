type AdminMonthNavigationProps = {
  periodLabel: string;
  goPrevMonth: () => void;
  goNextMonth: () => void;
};

export function AdminMonthNavigation({
  periodLabel,
  goPrevMonth,
  goNextMonth,
}: AdminMonthNavigationProps) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        onClick={goPrevMonth}
        aria-label="Mes anterior"
      >
        ‹
      </button>
      <span className="min-w-[9rem] text-center text-sm font-semibold capitalize sm:min-w-[11rem]">
        {periodLabel}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        onClick={goNextMonth}
        aria-label="Mes siguiente"
      >
        ›
      </button>
    </div>
  );
}
