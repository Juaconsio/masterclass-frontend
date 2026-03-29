import type { IEvent } from '@interfaces/events/IEvent';

/** Altura de cada fila de hora (px); usar en style, no en template strings de Tailwind. */
export const CALENDAR_ROW_HEIGHT_PX = 60;

/** Snap y rejilla visual: 4 franjas de 15 min por hora. */
export const CALENDAR_SNAP_MINUTES = 15;
export const CALENDAR_QUARTERS_PER_HOUR = 60 / CALENDAR_SNAP_MINUTES;
export const CALENDAR_QUARTER_HEIGHT_PX = CALENDAR_ROW_HEIGHT_PX / CALENDAR_QUARTERS_PER_HOUR;

/** Altura del encabezado sticky de cada columna día (px); debe coincidir con la rejilla. */
export const CALENDAR_GRID_HEADER_HEIGHT_PX = 40;

export type CalendarSlotDragPayload = { slotId: number; mode: 'move' | 'duplicate' };

export type UseCalendarSlotDragParams = {
  events: IEvent[];
  allowSlotDrag: boolean;
  onSlotTimeChange?: (id: number, startTime: string, endTime: string) => Promise<void>;
  onSlotDuplicateAtTime?: (source: IEvent, startTime: string, endTime: string) => Promise<void>;
};
