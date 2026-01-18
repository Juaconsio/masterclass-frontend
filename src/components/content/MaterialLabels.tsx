import { FilePenLine, BookOpenText, FileVideoCamera, RectangleEllipsis } from 'lucide-react';
import type React from 'react';

export const MATERIAL_LABELS: Record<string, string> = {
  contenido: 'Contenidos',
  guia: 'Guía de Ejercicios',
  soluciones: 'Soluciones',
  videos: 'Videos',
  extras: 'Material Extra',
};

export interface MaterialByType {
  type: string;
  pdfUrl: string;
  filename: string;
}
type MaterialIconMap = Record<string, React.ReactElement>;
export const MATERIAL_ICONS: MaterialIconMap = {
  contenido: <BookOpenText className="mr-2" />,
  guia: <FilePenLine className="mr-2" />,
  soluciones: <BookOpenText className="mr-2" />,
  videos: <FileVideoCamera className="mr-2" />,
  extras: <RectangleEllipsis className="mr-2" />,
};
