export { default as SlotThumbnail } from './SlotThumbnail';
export { default as SlotInfo } from './SlotInfo';

// Mapeo de colores por estado - exportado para uso externo
export const STATUS_STYLES: Record<string, string> = {
  CANDIDATE: 'bg-yellow-500 border-yellow-700',
  candidate: 'bg-yellow-500 border-yellow-700',
  CONFIRMED: 'bg-green-500 border-green-700',
  confirmed: 'bg-green-500 border-green-700',
  CANCELLED: 'bg-red-500 border-red-700',
  cancelled: 'bg-red-500 border-red-700',
  COMPLETED: 'bg-gray-500 border-gray-700',
  completed: 'bg-gray-500 border-gray-700',
};
