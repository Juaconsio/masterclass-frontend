import { createPortal } from 'react-dom';
import clsx from 'clsx';
import {
  CALENDAR_GRID_HEADER_HEIGHT_PX,
  CALENDAR_ROW_HEIGHT_PX,
} from './calendarDragDrop.types';

const DROP_PREVIEW_Z = 'z-[5]';

type CalendarSlotDragHintProps = {
  open: boolean;
  duplicate: boolean;
  /** Reservas activas: mover está deshabilitado; solo aplica duplicar si existe esa acción. */
  moveDisabledByReservations: boolean;
  /** Alt pulsado: modo duplicar activo antes de arrastrar. */
  altKeyHeld: boolean;
  x: number;
  y: number;
};

type DragHintVariant = 'blockedAlt' | 'blockedNoMove' | 'duplicate' | 'move';

const DRAG_HINT_PRESENTATION: Record<
  DragHintVariant,
  { cardClass: string; subtitle: string; statusClass: string; title: string }
> = {
  blockedAlt: {
    cardClass: 'border-info/30 bg-base-100/95 text-base-content',
    subtitle: 'Mantén Alt, arrastra y suelta para duplicar en otro hueco.',
    statusClass: 'status-info',
    title: 'Duplicar',
  },
  blockedNoMove: {
    cardClass: 'border-warning/35 bg-base-100/95 text-base-content',
    subtitle:
      'Tiene reservas activas: no puedes mover este horario. Pulsa Alt y arrastra para duplicar.',
    statusClass: 'status-warning',
    title: 'No se puede mover',
  },
  duplicate: {
    cardClass: 'border-info/30 bg-base-100/95 text-base-content',
    subtitle: 'Suelta en el calendario para crear una copia en ese horario.',
    statusClass: 'status-info',
    title: 'Duplicar',
  },
  move: {
    cardClass: 'border-success/30 bg-base-100/95 text-base-content',
    subtitle: 'Alt + arrastrar para duplicar',
    statusClass: 'status-success',
    title: 'Mover',
  },
};

function resolveDragHintVariant(params: {
  moveDisabledByReservations: boolean;
  altKeyHeld: boolean;
  duplicate: boolean;
}): DragHintVariant {
  const { moveDisabledByReservations, altKeyHeld, duplicate } = params;
  if (moveDisabledByReservations) {
    return altKeyHeld ? 'blockedAlt' : 'blockedNoMove';
  }
  return duplicate ? 'duplicate' : 'move';
}

export function CalendarSlotDragHint({
  open,
  duplicate,
  moveDisabledByReservations,
  altKeyHeld,
  x,
  y,
}: CalendarSlotDragHintProps) {
  if (!open || typeof document === 'undefined') return null;

  const variant = resolveDragHintVariant({
    moveDisabledByReservations,
    altKeyHeld,
    duplicate,
  });
  const { cardClass, subtitle, statusClass, title } = DRAG_HINT_PRESENTATION[variant];

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ left: x + 12, top: y + 18 }}
      aria-live="polite"
      role="status"
    >
      <div
        className={clsx(
          'flex max-w-[16rem] flex-col gap-0.5 rounded-md border px-2 py-1 text-xs font-medium shadow-md backdrop-blur-sm',
          cardClass
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className={clsx('status shrink-0', statusClass)} aria-hidden />
          {title}
        </div>
        <span className="text-base-content/60 text-[10px] leading-tight font-normal">
          {subtitle}
        </span>
      </div>
    </div>,
    document.body
  );
}

export type CalendarDropPreviewGhostProps = {
  previewStart: Date;
  previewEnd: Date;
  label: string;
  minHour: number;
  /** Debe coincidir con el header sticky de la columna en la rejilla. */
  headerHeightPx?: number;
};

/**
 * Silueta del slot al soltar: misma duración que el evento arrastrado, detrás de los thumbnails.
 */
export function CalendarDropPreviewGhost({
  previewStart,
  previewEnd,
  label,
  minHour,
  headerHeightPx = CALENDAR_GRID_HEADER_HEIGHT_PX,
}: CalendarDropPreviewGhostProps) {
  const startHour =
    previewStart.getHours() + previewStart.getMinutes() / 60 + previewStart.getSeconds() / 3600;
  const durationH = (previewEnd.getTime() - previewStart.getTime()) / 3600000;
  const top = headerHeightPx + (startHour - minHour) * CALENDAR_ROW_HEIGHT_PX;
  const heightPx = Math.max(durationH * CALENDAR_ROW_HEIGHT_PX, 8);

  return (
    <div
      aria-hidden
      className={clsx(
        DROP_PREVIEW_Z,
        'border-primary bg-primary/15 pointer-events-none absolute inset-x-0 rounded-md border-2 border-dashed px-1 pt-0.5'
      )}
      style={{ top: `${top}px`, height: `${heightPx}px` }}
    >
      <span className="bg-base-100/90 text-primary inline-block rounded px-0.5 font-mono text-[10px] tabular-nums shadow-sm">
        {label}
      </span>
    </div>
  );
}
