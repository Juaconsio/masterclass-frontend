import { FilePenLine, BookOpenText, FileVideoCamera, RectangleEllipsis } from 'lucide-react';
import type React from 'react';

export const MATERIAL_LABELS: Record<string, string> = {
  contenido: 'Contenidos',
  guia: 'Guía de Ejercicios',
  soluciones: 'Soluciones',
  videos: 'Videos',
  grabacion_clase: 'Grabación clase',
  extras: 'Material Extra',
};

export interface MaterialByType {
  type: string;
  url: string;
  mimeType: string;
  filename: string;
}
type MaterialIconMap = Record<string, React.ReactElement>;
export const MATERIAL_ICONS: MaterialIconMap = {
  contenido: <BookOpenText />,
  guia: <FilePenLine />,
  soluciones: <BookOpenText />,
  videos: <FileVideoCamera />,
  grabacion_clase: <FileVideoCamera />,
  extras: <RectangleEllipsis />,
};
