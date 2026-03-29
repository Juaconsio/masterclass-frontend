import { useCallback, useMemo, useState } from 'react';
import {
  initialUtcYearMonth,
  periodLabelFromUtc,
} from '@/components/admin/reservations-payments/dateUtils';

/**
 * Mes calendario UTC para filtros admin (sin acoplar tablas ni API).
 */
export function useUtcMonthPeriod() {
  const ip = initialUtcYearMonth();
  const [periodYear, setPeriodYear] = useState(ip.year);
  const [periodMonth, setPeriodMonth] = useState(ip.month);

  const periodLabel = useMemo(
    () => periodLabelFromUtc(periodYear, periodMonth),
    [periodYear, periodMonth]
  );

  const setYearMonth = useCallback((year: number, month: number) => {
    setPeriodYear(year);
    setPeriodMonth(month);
  }, []);

  return { periodYear, periodMonth, periodLabel, setYearMonth };
}
