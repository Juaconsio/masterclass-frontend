export interface Pilar {
  title: string;
  desc: string;
  icon: string;
  iconColor: string;
  listAccent?: 'primary' | 'secondary' | 'info' | 'success';
}

export const pilares: Pilar[] = [
  {
    title: 'Excelencia',
    desc: 'Profesores que realmente conocen los cursos. Ingenieros, ex ayudantes y estudiantes destacados con amplia experiencia docente y pasión por enseñar. Personas que ya pasaron por lo mismo que tú y saben exactamente dónde se complican los alumnos.',
    icon: 'mdi:medal-outline',
    iconColor: 'text-primary/10',
    listAccent: 'primary',
  },
  {
    title: 'Metodología',
    desc: 'Aterrizamos los contenidos del ramo y los resumimos en lo que realmente importa para la prueba. Preparamos material específico estructurado y estandarizado enfocado en lo que te evalúan. Combinamos clases en vivo con material digital y recursos en la plataforma para que cada estudiante pueda avanzar a su propio ritmo.',
    icon: 'mdi:chart-timeline-variant',
    iconColor: 'text-secondary/10',
    listAccent: 'secondary',
  },
  {
    title: 'Herramientas digitales',
    desc: 'Todo en una sola plataforma. Puedes reservar clases, acceder a material, ver sesiones grabadas, realizar controles y recibir avisos importantes. Un sistema pensado para organizar tu estudio y tener todo lo que necesitas en un solo lugar.',
    icon: 'mdi:monitor-dashboard',
    iconColor: 'text-info/20',
    listAccent: 'info',
  },
  {
    title: 'Comunidad',
    desc: 'Más que clases, construimos una red de estudiantes. Workshops con alumnos de cursos superiores, grupos donde compartir dudas y material, y actividades de comunidad para que no tengas que enfrentar el ramo solo.',
    icon: 'mdi:account-group-outline',
    iconColor: 'text-success/10',
    listAccent: 'success',
  },
];
