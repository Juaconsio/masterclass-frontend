export function formatSlotDateParts(
  startISO?: string,
  endISO?: string
): { date: string; time: string } {
  if (!startISO || !endISO) return { date: 'N/A', time: 'N/A' };
  const start = new Date(startISO);
  const end = new Date(endISO);
  const date = start.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const startTime = start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const time = `${startTime} – ${endTime}`;
  return { date, time };
}

export function utcMonthInclusiveISO(
  year: number,
  month: number
): { createdFrom: string; createdTo: string } {
  const createdFrom = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString();
  const createdTo = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
  return { createdFrom, createdTo };
}

export function initialUtcYearMonth() {
  const d = new Date();
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

export function utcDayRangeInclusiveISO(
  fromYmd: string,
  toYmd: string
): { createdFrom: string; createdTo: string } {
  const [fy, fm, fd] = fromYmd.split('-').map(Number);
  const [ty, tm, td] = toYmd.split('-').map(Number);
  const createdFrom = new Date(Date.UTC(fy, fm - 1, fd, 0, 0, 0, 0)).toISOString();
  const createdTo = new Date(Date.UTC(ty, tm - 1, td, 23, 59, 59, 999)).toISOString();
  return { createdFrom, createdTo };
}

export function periodLabelFromUtc(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
