import { format } from 'date-fns';
import type { IEvent } from '@interfaces/events/IEvent';
import { CALENDAR_QUARTERS_PER_HOUR, CALENDAR_SNAP_MINUTES } from './calendarDragDrop.types';

export function slotHasBlockingReservations(event: IEvent): boolean {
  return (event.reservations ?? []).some((r) => r.status !== 'cancelled');
}

/**
 * Índice de franja 0–3 (15 min) dentro de la celda según Y del puntero.
 */
export function quarterIndexFromClientY(clientY: number, cellElement: HTMLElement): number {
  const rect = cellElement.getBoundingClientRect();
  const relY = Math.min(Math.max(clientY - rect.top, 0), Math.max(rect.height - 1e-6, 0));
  const fraction = rect.height > 0 ? relY / rect.height : 0;
  return Math.min(
    CALENDAR_QUARTERS_PER_HOUR - 1,
    Math.floor(fraction * CALENDAR_QUARTERS_PER_HOUR)
  );
}

/**
 * Calcula inicio/fin alineados a franjas de {@link CALENDAR_SNAP_MINUTES} (misma lógica que la rejilla).
 */
export function computeSlotDropTimes(
  slot: IEvent,
  day: Date,
  hourRow: number,
  clientY: number,
  cellElement: HTMLElement
): { startTime: string; endTime: string } {
  const oldStart = new Date(slot.startTime);
  const oldEnd = new Date(slot.endTime);
  const duration = oldEnd.getTime() - oldStart.getTime();

  const quarterIndex = quarterIndexFromClientY(clientY, cellElement);
  const minutesFromHourStart = quarterIndex * CALENDAR_SNAP_MINUTES;

  const base = new Date(day);
  base.setHours(hourRow, 0, 0, 0);
  const newStart = new Date(base.getTime() + minutesFromHourStart * 60 * 1000);
  const newEnd = new Date(newStart.getTime() + duration);
  return { startTime: newStart.toISOString(), endTime: newEnd.toISOString() };
}

/**
 * Rango de tiempo del preview (misma lógica que {@link computeSlotDropTimes} sin `clientY`).
 */
export function computeDropPreviewSpan(
  slot: IEvent,
  day: Date,
  hourRow: number,
  quarterIndex: number
): { start: Date; end: Date } {
  const base = new Date(day);
  base.setHours(hourRow, quarterIndex * CALENDAR_SNAP_MINUTES, 0, 0);
  const dur = new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime();
  return { start: base, end: new Date(base.getTime() + dur) };
}

export function formatDropPreviewRange(
  day: Date,
  hourRow: number,
  quarterIndex: number,
  slot: IEvent
): string {
  const { start, end } = computeDropPreviewSpan(slot, day, hourRow, quarterIndex);
  return `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`;
}

export function makeDropCellKey(dayColumnIndex: number, hour: number): string {
  return `${dayColumnIndex}-${hour}`;
}

/**
 * Determina el modo final de la operación de drop.
 * Retorna null si la operación no está permitida.
 */
export function resolveDropMode(
  slot: IEvent,
  intentedMode: 'move' | 'duplicate',
  opts: { canMove: boolean; canDuplicate: boolean; altKey: boolean }
): 'move' | 'duplicate' | null {
  if (slotHasBlockingReservations(slot)) {
    return opts.canDuplicate && opts.altKey ? 'duplicate' : null;
  }
  if (intentedMode === 'move' && !opts.canMove) return null;
  if (intentedMode === 'duplicate' && !opts.canDuplicate) return null;

  return intentedMode;
}
