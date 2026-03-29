import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { IEvent } from '@interfaces/events/IEvent';
import { CalendarSlotDragHint } from './CalendarDragVisuals';
import type { CalendarSlotDragPayload, UseCalendarSlotDragParams } from './calendarDragDrop.types';
import {
  computeDropPreviewSpan,
  computeSlotDropTimes,
  formatDropPreviewRange,
  makeDropCellKey,
  quarterIndexFromClientY,
  resolveDropMode,
  slotHasBlockingReservations,
} from './calendarDragDrop.utils';

export type { UseCalendarSlotDragParams } from './calendarDragDrop.types';

export function useCalendarSlotDrag({
  events,
  allowSlotDrag,
  onSlotTimeChange,
  onSlotDuplicateAtTime,
}: UseCalendarSlotDragParams) {
  const dragEnabled =
    allowSlotDrag && (Boolean(onSlotDuplicateAtTime) || Boolean(onSlotTimeChange));

  const [hoveredSlotId, setHoveredSlotId] = useState<number | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [altKeyHeld, setAltKeyHeld] = useState(false);
  const [dropPreview, setDropPreview] = useState<{
    cellKey: string;
    quarterIndex: number;
    label: string;
    dayColumnIndex: number;
    previewStart: Date;
    previewEnd: Date;
  } | null>(null);
  /**
   * Id del slot en arrastre. El origen no lleva pointer-events-none (si no, el drag se cancela al re-renderizar).
   * El resto de thumbnails sí, para que el drop llegue a las celdas bajo otros slots.
   */
  const [draggingSlotId, setDraggingSlotId] = useState<number | null>(null);
  const dragImageElRef = useRef<HTMLDivElement | null>(null);
  const activeDragSlotIdRef = useRef<number | null>(null);
  /** En `drop`, `getData('text/plain')` suele ir vacío en Chrome; el ref conserva el payload del dragstart. */
  const activeDragPayloadRef = useRef<CalendarSlotDragPayload | null>(null);

  function getDragPayload(ev: React.DragEvent): CalendarSlotDragPayload | null {
    const fromRef = activeDragPayloadRef.current;
    if (fromRef) return fromRef;
    try {
      return JSON.parse(ev.dataTransfer.getData('text/plain'));
    } catch {
      return null;
    }
  }

  const hoveredSlotIdRef = useRef<number | null>(null);
  hoveredSlotIdRef.current = hoveredSlotId;
  const altKeyHeldRef = useRef(false);
  altKeyHeldRef.current = altKeyHeld;

  useEffect(() => {
    const isAltKeyEvent = (e: KeyboardEvent) =>
      e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight';

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        dragEnabled &&
        (hoveredSlotIdRef.current != null || activeDragSlotIdRef.current != null) &&
        isAltKeyEvent(e)
      ) {
        e.preventDefault();
      }
      setAltKeyHeld(e.altKey);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      setAltKeyHeld(e.altKey);
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [dragEnabled]);

  const clearHover = useCallback(() => {
    setHoveredSlotId(null);
  }, []);

  const removeDragImage = useCallback(() => {
    const el = dragImageElRef.current;
    if (el?.parentNode) {
      el.parentNode.removeChild(el);
    }
    dragImageElRef.current = null;
  }, []);

  const clearDragState = useCallback(() => {
    clearHover();
    setDropPreview(null);
    activeDragSlotIdRef.current = null;
    activeDragPayloadRef.current = null;
    setDraggingSlotId(null);
    removeDragImage();
  }, [clearHover, removeDragImage]);

  const handleSlotMouseEnter = useCallback((slotId: number, ev: React.MouseEvent) => {
    setHoveredSlotId(slotId);
    setPointer({ x: ev.clientX, y: ev.clientY });
  }, []);

  const handleSlotMouseLeave = useCallback(
    (ev: React.MouseEvent) => {
      if (ev.buttons !== 0) return;
      clearHover();
    },
    [clearHover]
  );

  const trackPointer = useCallback((ev: MouseEvent) => {
    setPointer({ x: ev.clientX, y: ev.clientY });
  }, []);

  useEffect(() => {
    if (hoveredSlotId == null) return;
    window.addEventListener('mousemove', trackPointer);
    return () => window.removeEventListener('mousemove', trackPointer);
  }, [hoveredSlotId, trackPointer]);

  const handleCellDrop = useCallback(
    async (ev: React.DragEvent, day: Date, hourRow: number) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!dragEnabled) return;

      const payload = getDragPayload(ev);
      if (!payload) return;

      const slot = events.find((x) => x.id === payload.slotId);
      if (!slot) return;

      const blocked = slotHasBlockingReservations(slot);
      const canMove = Boolean(onSlotTimeChange) && !blocked;
      const canDuplicate = Boolean(onSlotDuplicateAtTime);
      const altKey = altKeyHeldRef.current;
      const mode = resolveDropMode(slot, payload.mode, { canMove, canDuplicate, altKey });
      if (mode == null) return;

      const cell = ev.currentTarget as HTMLElement;
      const { startTime, endTime } = computeSlotDropTimes(slot, day, hourRow, ev.clientY, cell);
      const oldStart = new Date(slot.startTime).getTime();
      const oldEnd = new Date(slot.endTime).getTime();
      const sameAsSource =
        new Date(startTime).getTime() === oldStart && new Date(endTime).getTime() === oldEnd;
      if (mode === 'move' && sameAsSource) {
        return;
      }

      try {
        if (mode === 'move' && onSlotTimeChange) {
          await onSlotTimeChange(payload.slotId, startTime, endTime);
        } else if (mode === 'duplicate' && onSlotDuplicateAtTime) {
          await onSlotDuplicateAtTime(slot, startTime, endTime);
        }
      } catch {
        /* toast en el padre */
      } finally {
        setDropPreview(null);
      }
    },
    [dragEnabled, events, onSlotDuplicateAtTime, onSlotTimeChange]
  );

  const getCellDropProps = useCallback(
    (day: Date, hourRow: number, dayColumnIndex: number) => {
      const key = makeDropCellKey(dayColumnIndex, hourRow);
      const isOver = dropPreview?.cellKey === key;

      return {
        'data-drop-cell': key,
        dropHighlightClass: clsx(isOver && 'ring-primary/40 ring-2 ring-inset'),
        onDragOver: dragEnabled
          ? (e: React.DragEvent) => {
              e.preventDefault();
              const p = activeDragPayloadRef.current;
              e.dataTransfer.dropEffect = p?.mode === 'duplicate' ? 'copy' : 'move';
              const el = e.currentTarget as HTMLElement;
              const q = quarterIndexFromClientY(e.clientY, el);
              const slotId = activeDragSlotIdRef.current;
              const slot = slotId != null ? events.find((x) => x.id === slotId) : undefined;
              if (slot == null) {
                setDropPreview(null);
                return;
              }
              const { start, end } = computeDropPreviewSpan(slot, day, hourRow, q);
              const label = formatDropPreviewRange(day, hourRow, q, slot);
              setDropPreview({
                cellKey: key,
                quarterIndex: q,
                label,
                dayColumnIndex,
                previewStart: start,
                previewEnd: end,
              });
            }
          : undefined,
        onDrop: dragEnabled
          ? (e: React.DragEvent) => void handleCellDrop(e, day, hourRow)
          : undefined,
      };
    },
    [dragEnabled, dropPreview, events, handleCellDrop]
  );

  const getSlotDragProps = useCallback(
    (event: IEvent, opts: { canMove: boolean; canDuplicate: boolean; canDrag: boolean }) => {
      const { canMove, canDuplicate, canDrag } = opts;
      if (!canDrag) {
        return {
          draggable: false as const,
          title: undefined as string | undefined,
          onMouseEnter: undefined,
          onMouseLeave: undefined,
          onDragStart: undefined,
          onDragEnd: undefined,
        };
      }

      return {
        draggable: true as const,
        onMouseEnter: (ev: React.MouseEvent) => handleSlotMouseEnter(event.id, ev),
        onMouseLeave: handleSlotMouseLeave,
        onDragStart: (ev: React.DragEvent) => {
          const altKey = altKeyHeldRef.current;
          const payload: CalendarSlotDragPayload = {
            slotId: event.id,
            mode: altKey ? 'duplicate' : 'move',
          };
          const mode = resolveDropMode(event, payload.mode, { canMove, canDuplicate, altKey });
          if (!mode) {
            ev.preventDefault();
            return;
          }

          activeDragPayloadRef.current = { ...payload, mode };
          ev.dataTransfer.setData('text/plain', JSON.stringify(activeDragPayloadRef.current));
          ev.dataTransfer.effectAllowed = mode === 'move' ? 'move' : 'copy';
          activeDragSlotIdRef.current = event.id;
          queueMicrotask(() => setDraggingSlotId(event.id));

          const ghost = document.createElement('div');
          ghost.className =
            'rounded-md border border-base-300 bg-base-100 px-2 py-1 text-xs font-medium shadow-lg';
          ghost.textContent = mode === 'duplicate' ? 'Duplicar' : 'Mover';
          ghost.style.position = 'fixed';
          ghost.style.left = '-9999px';
          ghost.style.top = '0';
          document.body.appendChild(ghost);
          dragImageElRef.current = ghost;
          try {
            ev.dataTransfer.setDragImage(ghost, 24, 16);
          } catch {
            removeDragImage();
          }
        },
        onDragEnd: () => {
          clearDragState();
        },
      };
    },
    [clearDragState, handleSlotMouseEnter, handleSlotMouseLeave, removeDragImage]
  );

  const hoveredEvent =
    hoveredSlotId != null ? events.find((e) => e.id === hoveredSlotId) : undefined;
  const blocked = hoveredEvent ? slotHasBlockingReservations(hoveredEvent) : false;
  const hintDuplicate = Boolean(hoveredEvent && (blocked || altKeyHeld));
  const hintOpen = dragEnabled && hoveredSlotId != null;

  const dragHint = (
    <CalendarSlotDragHint
      open={hintOpen}
      duplicate={hintDuplicate}
      moveDisabledByReservations={blocked}
      altKeyHeld={altKeyHeld}
      x={pointer.x}
      y={pointer.y}
    />
  );

  return {
    dragEnabled,
    dropPreview,
    draggingSlotId,
    getCellDropProps,
    getSlotDragProps,
    dragHint,
  };
}
