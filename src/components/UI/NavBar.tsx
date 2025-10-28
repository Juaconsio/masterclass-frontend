import React, { useMemo } from 'react';
import { Home, BookOpen, Info, LayoutDashboard, User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router';

type NavLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const NavBar: React.FC = () => {
  const location = useLocation();

  const links: NavLink[] = useMemo(
    () => [
      { label: 'Inicio', href: '/app', icon: <Home className="h-4 w-4" /> },
      { label: 'Cursos', href: '/app/cursos', icon: <BookOpen className="h-4 w-4" /> },
      { label: 'Dashboard', href: '/app/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      {
        label: 'Reservas',
        href: '/app/reservas',
        icon: <Info className="h-4 w-4" />,
      },
    ],
    []
  );

  const isActive = (href: string) => {
    const path = location.pathname + location.hash;
    if (!path) return false;
    if (href.includes('#')) return path.endsWith(href.replace('/', '')) || path === href;
    return path === href;
  };

  // Inicial simple para avatar si no hay imagen
  const userInitial = 'P'; // P de Perfil
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (e) {
      // noop
    }
    window.location.href = '/';
  };

  return (
    <aside className="bg-base-200 sticky top-0 flex max-h-screen w-64 flex-col justify-between border-r border-black">
      {/* Top: Logo + Nav */}
      <div>
        <Link to="/" className="mb-6 inline-flex items-center gap-3 p-4">
          <img
            src="/images/logo.svg"
            alt="SalvaRamos"
            className="h-10 w-auto"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span className="text-2xl font-bold">Salva Ramos</span>
        </Link>

        <nav aria-label="Menu de navegación" className="space-y-1">
          {links.map((l) => {
            const active = isActive(l.href);

            return (
              <Link
                key={l.href}
                to={l.href}
                className={clsx(
                  'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  active ? 'bg-primary/10 font-semibold' : 'hover:bg-base-content/5'
                )}
                aria-current={active ? 'page' : undefined}
                title={l.label}
              >
                {active && (
                  <span className="bg-primary absolute top-0 left-0 h-full w-1 rounded-l" />
                )}
                <span className={active ? 'text-primary' : ''}>{l.icon}</span>
                <span className="text-sm font-medium">{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Profile */}
      <div className="p-4">
        <div className="dropdown dropdown-top w-full">
          <button
            tabIndex={0}
            className="hover:bg-base-content/5 flex w-full items-center gap-3 rounded-lg px-3 py-2"
            aria-haspopup="menu"
          >
            <div className="avatar placeholder">
              <div className="bg-secondary text-secondary-content w-9 rounded-full">
                <span className="text-sm font-semibold">{userInitial}</span>
              </div>
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-sm font-medium">Perfil</span>
              <span className="text-base-content/70 text-xs">Ver detalles</span>
            </div>
          </button>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] w-56 p-2 shadow"
            role="menu"
          >
            <li>
              <Link to="/profile" role="menuitem" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Ver perfil
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} role="menuitem" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default NavBar;
