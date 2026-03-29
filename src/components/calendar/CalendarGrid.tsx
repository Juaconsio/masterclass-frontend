import { addDays, format, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import { SlotThumbnail } from '../slots';
import type { IEvent } from '@interfaces/events/IEvent';
import { CalendarDropPreviewGhost } from './CalendarDragVisuals';
import {
  CALENDAR_GRID_HEADER_HEIGHT_PX,
  CALENDAR_QUARTER_HEIGHT_PX,
  CALENDAR_ROW_HEIGHT_PX,
} from './calendarDragDrop.types';
import { slotHasBlockingReservations } from './calendarDragDrop.utils';
import { useCalendarSlotDrag } from './calendarDragDrop.hook';

interface CalendarGridProps {
  currentWeek: Date;
  events: IEvent[];
  onEventClick: (event: IEvent) => void;
  loading?: boolean;
  openCreateEventModal: (initialDate?: Date) => void;
  allowSlotDrag?: boolean;
  onSlotTimeChange?: (id: number, startTime: string, endTime: string) => Promise<void>;
  onSlotDuplicateAtTime?: (source: IEvent, startTime: string, endTime: string) => Promise<void>;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8);
const QUARTER_INDICES = [0, 1, 2, 3] as const;

/** Sticky day/corner headers sit above slot blocks while scrolling. */
const HEADER_Z = 'z-[20]';
const SLOT_Z = 'z-10';

/**
 * Dado un array de eventos del mismo día (ya con start/end como Date),
 * calcula col y totalCols para renderizarlos sin solapamiento visual.
 */
function positionOverlappingEvents<T extends { start: Date; end: Date }>(
  events: T[]
): (T & { col: number; totalCols: number })[] {
  const positioned: (T & { col: number; totalCols: number })[] = [];

  for (const event of events) {
    // 1. Encontrar la primera columna libre
    let col = 0;
    while (positioned.some((p) => p.col === col && overlaps(event, p))) {
      col++;
    }
    positioned.push({ ...event, col, totalCols: 1 }); // totalCols provisional
  }

  // 2. Ahora que todos tienen columna asignada, calcular totalCols real
  //    como el número de columnas del grupo de solapamiento completo
  for (const event of positioned) {
    const group = positioned.filter((p) => overlaps(event, p) || p === event);
    const maxCol = Math.max(...group.map((p) => p.col));
    event.totalCols = maxCol + 1;
  }

  return positioned;
}

function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
  return a.start < b.end && a.end > b.start;
}

export default function CalendarWeeklyGrid({
  currentWeek,
  events,
  loading,
  onEventClick,
  openCreateEventModal,
  allowSlotDrag = false,
  onSlotTimeChange,
  onSlotDuplicateAtTime,
}: CalendarGridProps) {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  const minHour = HOURS[0];

  const { dragEnabled, dropPreview, draggingSlotId, getCellDropProps, getSlotDragProps, dragHint } =
    useCalendarSlotDrag({
      events,
      allowSlotDrag: Boolean(allowSlotDrag),
      onSlotTimeChange,
      onSlotDuplicateAtTime,
    });

  return (
    <>
      <div className="bg-base-200 grid h-[75vh] max-h-9/10 grid-cols-8 overflow-y-scroll rounded-lg border shadow-lg">
        <div className="border-r border-black">
          <div
            className={clsx(
              HEADER_Z,
              'bg-base-200 sticky top-0 flex h-10 items-center justify-center border-b border-black font-medium'
            )}
          >
            Hora / Día
          </div>
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-center justify-center border-b border-black pt-1 pr-1"
              style={{ height: CALENDAR_ROW_HEIGHT_PX }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {days.map((day, i) => {
          const highlight = !loading && isToday(day);

          const eventsOfDay = events
            .filter((e) => isSameDay(new Date(e.startTime), day))
            .map((e) => ({ ...e, start: new Date(e.startTime), end: new Date(e.endTime) }))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

          const positioned = positionOverlappingEvents(eventsOfDay);

          return (
            <div
              key={i}
              className={clsx(
                'relative border-r border-black/20',
                highlight ? 'bg-base-300' : 'bg-base-100'
              )}
            >
              <div
                className={clsx(
                  HEADER_Z,
                  'sticky top-0 flex h-10 items-center justify-center border-b border-black/20 font-medium',
                  highlight ? 'bg-primary text-white' : 'bg-base-200'
                )}
              >
                {format(day, 'EEE d', { locale: es })}
              </div>

              {HOURS.map((h) => {
                if (loading) {
                  return (
                    <div
                      key={`skeleton-${h}`}
                      className="skeleton m-2"
                      style={{ height: CALENDAR_ROW_HEIGHT_PX }}
                    />
                  );
                }

                const blockDate = new Date(day);
                blockDate.setHours(h, 0, 0, 0);
                const {
                  dropHighlightClass,
                  onDragOver,
                  onDrop,
                  'data-drop-cell': dataDropCell,
                } = getCellDropProps(day, h, i);

                return (
                  <div
                    key={h}
                    role="presentation"
                    data-drop-cell={dataDropCell}
                    className={clsx(
                      'hover:bg-base-300 relative cursor-pointer border-b border-black/20 hover:border-2 hover:border-black/60 hover:shadow-lg hover:shadow-black/10',
                      dragEnabled && 'transition-colors',
                      dropHighlightClass
                    )}
                    style={{ height: CALENDAR_ROW_HEIGHT_PX }}
                    onClick={() => openCreateEventModal(blockDate)}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                  >
                    {dragEnabled && (
                      <>
                        <div
                          className="pointer-events-none absolute inset-0 flex flex-col"
                          aria-hidden
                        >
                          {QUARTER_INDICES.map((q) => (
                            <div
                              key={q}
                              style={{
                                height: CALENDAR_QUARTER_HEIGHT_PX,
                                minHeight: CALENDAR_QUARTER_HEIGHT_PX,
                              }}
                              className="border-b border-black/15 last:border-b-0"
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {dragEnabled && !loading && dropPreview && dropPreview.dayColumnIndex === i && (
                <CalendarDropPreviewGhost
                  previewStart={dropPreview.previewStart}
                  previewEnd={dropPreview.previewEnd}
                  label={dropPreview.label}
                  minHour={minHour}
                />
              )}

              {positioned.map((e) => {
                const startHour = e.start.getHours() + e.start.getMinutes() / 60;
                const endHour = e.end.getHours() + e.end.getMinutes() / 60;

                const top =
                  CALENDAR_GRID_HEADER_HEIGHT_PX + (startHour - minHour) * CALENDAR_ROW_HEIGHT_PX;
                const height = (endHour - startHour) * CALENDAR_ROW_HEIGHT_PX;
                const width = 100 / e.totalCols;
                const left = e.col * width;

                const blocked = slotHasBlockingReservations(e);
                const canMove = Boolean(onSlotTimeChange) && !blocked;
                const canDuplicate = Boolean(onSlotDuplicateAtTime);
                const canDrag = dragEnabled && (canMove || canDuplicate);
                const dragProps = getSlotDragProps(e, { canMove, canDuplicate, canDrag });

                return (
                  <div
                    key={e.id}
                    draggable={dragProps.draggable}
                    title={dragProps.title}
                    className={clsx(
                      SLOT_Z,
                      'absolute transition-all duration-150 hover:brightness-110',
                      canDrag && 'cursor-grab active:cursor-grabbing',
                      draggingSlotId != null && e.id !== draggingSlotId && 'pointer-events-none'
                    )}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `${left}%`,
                      width: `${width}%`,
                      padding: '2px',
                    }}
                    onMouseEnter={dragProps.onMouseEnter}
                    onMouseLeave={dragProps.onMouseLeave}
                    onDragStart={dragProps.onDragStart}
                    onDragEnd={dragProps.onDragEnd}
                  >
                    <SlotThumbnail event={e} onClick={() => onEventClick(e)} className="h-full" />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {dragHint}
    </>
  );
}
