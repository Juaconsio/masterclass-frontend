import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router';
import { useMemo } from 'react';
import NavButton from './NavButton';
import { useBreadCrumbRoute } from '@/context/BreadCrumbRouteContext';

interface BreadCrumbItem {
  label: string;
  path?: string;
  title?: string;
  truncate?: boolean;
}

interface BreadCrumbProps {
  homePath?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  app: 'Inicio',
  planes: 'Planes y pagos',
  'elegir-horario': 'Elegir horario',
  reservas: 'Reservas',
  'confirmacion-pago': 'Confirmación de pago',
  cursos: 'Cursos',
  clases: 'Clase',
  perfil: 'Mi perfil',
  admin: 'Dashboard',
  estudiantes: 'Estudiantes',
  profesores: 'Profesores',
  calendario: 'Calendario',
  pagos: 'Pagos',
  'registro-reservas': 'Registro de reservas',
  profesor: 'Dashboard',
  horarios: 'Mis horarios',
  reagendar: 'Reagendar reserva',
};

const DETAIL_LABELS: Record<string, string> = {
  cursos: 'Curso',
  profesores: 'Profesor',
  estudiantes: 'Estudiante',
  clases: 'Material',
  reservas: 'Reserva',
};

const MAX_CRUMB_CHARS = 28;

export function BreadCrumb({ homePath = '/app' }: BreadCrumbProps) {
  const location = useLocation();
  const params = useParams<{ courseId?: string; classId?: string }>();
  const routeContext = useBreadCrumbRoute();

  const breadcrumbItems = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const items: BreadCrumbItem[] = [];

    const startIndex =
      segments[0] === 'admin' || segments[0] === 'app' || segments[0] === 'profesor' ? 1 : 0;

    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      const isNumeric = /^\d+$/.test(segment);
      const parentSegment = i > startIndex ? segments[i - 1] : null;

      let label: string;
      let truncate = false;
      let fullTitle: string | undefined;

      if (isNumeric && parentSegment === 'cursos' && routeContext?.course?.id === Number(segment)) {
        label = routeContext.course.acronym;
      } else if (
        isNumeric &&
        parentSegment === 'clases' &&
        routeContext?.class?.id === Number(segment)
      ) {
        label = routeContext.class.title;
        fullTitle = routeContext.class.title;
        truncate = label.length > MAX_CRUMB_CHARS;
        if (truncate) label = label.slice(0, MAX_CRUMB_CHARS).trim() + '…';
      } else if (isNumeric && parentSegment) {
        label = DETAIL_LABELS[parentSegment] || segment;
      } else {
        label = ROUTE_LABELS[segment] || segment;
      }

      const item: BreadCrumbItem = { label, truncate: truncate || undefined, title: fullTitle };
      if (i < segments.length - 1) {
        const prefix = segments[0];
        if (segment === 'clases' && parentSegment && /^\d+$/.test(parentSegment)) {
          item.path = `/${prefix}/cursos/${parentSegment}?tab=classes`;
        } else {
          item.path = '/' + segments.slice(0, i + 1).join('/');
        }
      }
      items.push(item);
    }

    return items;
  }, [location.pathname, params.courseId, params.classId, routeContext?.course, routeContext?.class]);

  const isAtHome = location.pathname === homePath || location.pathname === homePath + '/';

  if (breadcrumbItems.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-2">
        <nav className="flex flex-1 items-center space-x-1">
          {isAtHome ? (
            <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5">
              <Home className="text-base-content/60 h-4 w-4" />
              <span className="text-primary rounded-md px-3 py-1.5 text-sm font-medium">
                Inicio
              </span>
            </div>
          ) : (
            <Link
              to={homePath}
              className="hover:bg-base-200 flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors"
            >
              <Home className="text-base-content/60 h-4 w-4" />
              <span className="text-base-content/80 text-sm">Inicio</span>
            </Link>
          )}
        </nav>
        <NavButton />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <nav className="flex flex-1 items-center space-x-1">
        <Link
          to={homePath}
          className="hover:bg-base-200 flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors"
        >
          <Home className="text-base-content/60 h-4 w-4" />
          <span className="text-base-content/80 text-sm">Inicio</span>
        </Link>
        {breadcrumbItems.length > 0 && <ChevronRight className="text-base-content/40 h-4 w-4" />}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const labelEl = (
            <span
              className={item.truncate ? 'max-w-[10rem] truncate inline-block' : undefined}
              title={item.title}
            >
              {item.label}
            </span>
          );

          return (
            <div key={index} className="flex min-w-0 shrink items-center space-x-1">
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="hover:bg-base-200 text-base-content/80 rounded-md px-3 py-1.5 text-sm transition-colors"
                  title={item.title}
                >
                  {labelEl}
                </Link>
              ) : (
                <span
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    isLast ? 'bg-primary/10 text-primary font-medium' : 'text-base-content/60'
                  } ${item.truncate ? 'min-w-0' : ''}`}
                >
                  {labelEl}
                </span>
              )}
              {!isLast && <ChevronRight className="text-base-content/40 h-4 shrink-0" />}
            </div>
          );
        })}
      </nav>
      <NavButton />
    </div>
  );
}
