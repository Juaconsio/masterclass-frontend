export interface Pilar {
  title: string;
  desc: string;
  icon: string;
  iconColor: string;
  listAccent?: 'primary' | 'secondary' | 'info' | 'success';
}

export const pilares: Pilar[] = [
  {
    title: 'Clases claras',
    desc: 'Explicamos la materia de forma simple y directa, enfocándonos en lo que realmente necesitas entender para avanzar en el ramo.',
    icon: 'mdi:school',
    iconColor: 'text-primary/10',
    listAccent: 'primary',
  },
  {
    title: 'Profesores expertos',
    desc: 'Nuestro equipo está compuesto por estudiantes avanzados, egresados o profesionales que destacan tanto por su dominio de la materia como por su capacidad de explicar.',
    icon: 'mdi:account-tie',
    iconColor: 'text-secondary/10',
    listAccent: 'secondary',
  },
  {
    title: 'Acompañamiento real',
    desc: 'Nos importa cómo te va. Buscamos generar un espacio donde puedas resolver dudas, repasar y mejorar continuamente.',
    icon: 'mdi:handshake',
    iconColor: 'text-info/20',
    listAccent: 'info',
  },
  {
    title: 'Material útil',
    desc: 'Clases grabadas, ejercicios resueltos y recursos pensados para estudiar mejor, no solo para "pasar la prueba".',
    icon: 'mdi:book-open-variant',
    iconColor: 'text-success/10',
    listAccent: 'success',
  },
];
