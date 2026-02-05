import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useMemo } from 'react';
import NavButton from './NavButton';

interface BreadCrumbItem {
  label: string;
  path?: string;
}

interface BreadCrumbProps {
  homePath?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  // App routes
  app: 'Inicio',
  cursos: 'Mis Cursos',
  perfil: 'Mi Perfil',
  reservas: 'Gestión de Horarios',

  // Admin routes
  admin: 'Dashboard Admin',
  profesores: 'Gestión de Profesores',
  estudiantes: 'Gestión de Estudiantes',
  pagos: 'Gestión de Pagos',

  // Professor routes
  profesor: 'Dashboard Profesor',
  'confirmacion-pago': 'Confirmación de Pago',
};

const DETAIL_LABELS: Record<string, string> = {
  cursos: 'Detalles del Curso',
  profesores: 'Detalles del Profesor',
  estudiantes: 'Detalles del Estudiante',
  pagos: 'Detalles del Pago',
  reservas: 'Detalles de la Reserva',
};

export function BreadCrumb({ homePath = '/app' }: BreadCrumbProps) {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const items: BreadCrumbItem[] = [];

    const startIndex =
      segments[0] === 'admin' || segments[0] === 'app' || segments[0] === 'profesor' ? 1 : 0;

    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      const label = ROUTE_LABELS[segment] || segment;

      if (i < segments.length - 1) {
        const pathSegments = segments.slice(0, i + 1);
        items.push({
          label,
          path: '/' + pathSegments.join('/'),
        });
      } else {
        if (/^\d+$/.test(segment)) {
          const parentSegment = segments[i - 1];
          const detailLabel = DETAIL_LABELS[parentSegment] || 'Detalles';
          items.push({ label: detailLabel });
        } else {
          items.push({ label });
        }
      }
    }

    return items;
  }, [location.pathname]);

  if (breadcrumbItems.length === 0) {
    return <div className="p-4" />;
  }

  return (
    <div className="bg-base-100 flex items-center justify-between gap-4 p-4">
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

          return (
            <div key={index} className="flex items-center space-x-1">
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="hover:bg-base-200 text-base-content/80 rounded-md px-3 py-1.5 text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    isLast ? 'bg-primary/10 text-primary font-medium' : 'text-base-content/60'
                  }`}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="text-base-content/40 h-4 w-4" />}
            </div>
          );
        })}
      </nav>
      <NavButton />
    </div>
  );
}
