import React, { useMemo, useState } from 'react';
import {
  Home,
  BookOpen,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  CreditCard,
  Menu,
  X,
  Package,
} from 'lucide-react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router';
import { useSessionContext } from '@/context/SessionContext';
import { clearAuthStorage } from '@client/authStorage';
import imagotipoUrl from '@/assets/imagotipo.svg?url';

type NavLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const USER_ROLE_LABEL = {
  admin: 'Administrador',
  user: 'Estudiante',
  professor: 'Profesor',
};

const NavBar: React.FC = () => {
  const location = useLocation();
  const { user } = useSessionContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Determinar si el usuario es admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  const isProfessor = user?.role === 'professor';
  const isStudentView = location.pathname.startsWith('/app');
  // Links según el rol
  const links: NavLink[] = useMemo(() => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Cursos', href: '/admin/cursos', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Profesores', href: '/admin/profesores', icon: <User className="h-5 w-5" /> },
        {
          label: 'Estudiantes',
          href: '/admin/estudiantes',
          icon: <GraduationCap className="h-5 w-5" />,
        },
        { label: 'Reservas', href: '/admin/reservas', icon: <Calendar className="h-5 w-5" /> },
        {
          label: 'Pagos y reservas',
          href: '/admin/pagos',
          icon: <CreditCard className="h-5 w-5" />,
        },
      ];
    } else if (isProfessor) {
      return [
        { label: 'Dashboard', href: '/profesor', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Mis Cursos', href: '/profesor/cursos', icon: <BookOpen className="h-5 w-5" /> },
        {
          label: 'Mis Horarios',
          href: '/profesor/horarios',
          icon: <Calendar className="h-5 w-5" />,
        },
      ];
    } else {
      return [
        { label: 'Inicio', href: '/app', icon: <Home className="h-5 w-5" /> },
        { label: 'Planes y pagos', href: '/app/planes', icon: <Package className="h-5 w-5" /> },
        { label: 'Cursos', href: '/app/cursos', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Reservas', href: '/app/reservas', icon: <Calendar className="h-5 w-5" /> },
      ];
    }
  }, [isAdmin, isProfessor]);

  const isActive = (href: string) => {
    const path = location.pathname;
    if (!path) return false;
    if (href === '/app' || href === '/admin' || href === '/profesor') {
      return path === href;
    }
    return path.startsWith(href);
  };

  const handleLogout = () => {
    clearAuthStorage();
    window.location.href = '/';
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  console.log(user ? user : 'Nada');
  const displayName = user?.name || user?.email || 'Usuario';
  const profilePath = isAdmin ? '/admin/perfil' : isProfessor ? '/profesor/perfil' : '/app/perfil';

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="w-full px-3 py-5">
        <a href="/" className="block w-full" aria-label="Salva Ramos - Inicio">
          <img
            src={imagotipoUrl}
            alt="Salva Ramos"
            className="h-auto w-full min-w-0 object-contain object-center"
          />
        </a>
      </div>

      <div className="divider my-0" />

      {/* Navegación */}
      <nav aria-label="Menu de navegación" className="flex-1 space-y-1 px-2 py-4">
        <ul className="menu menu-lg gap-1">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={closeDrawer}
                  className={clsx(
                    'flex items-center gap-3',
                    active && 'bg-primary/10 text-primary font-semibold'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="divider my-0" />

      {/* Usuario: nombre, rol, perfil y cerrar sesión */}
      <div className="p-3">
        <div className="border-base-300 bg-base-200 rounded-lg border p-3 shadow-sm">
          <p className="truncate text-sm font-semibold">
            {displayName} - {user?.email}
          </p>
          <div className="bg-primary/10 text-primary mt-1.5 rounded-md px-2 py-1.5 text-sm font-medium">
            {USER_ROLE_LABEL[user?.role as keyof typeof USER_ROLE_LABEL] || ''}
          </div>
          <div className="border-base-300 mt-3 flex flex-col gap-1 border-t pt-3">
            <Link
              to={profilePath}
              onClick={closeDrawer}
              className="hover:bg-base-200 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <User className="h-4 w-4" />
              Mi Perfil
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-error hover:bg-error/10 flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="navbar bg-base-100 border-base-300 sticky top-0 z-50 border-b lg:hidden">
        <div className="flex-none">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn btn-ghost btn-square"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <Link
          to={isAdmin ? '/admin' : isProfessor ? '/profesor' : '/app'}
          className="flex flex-1 justify-center px-2"
        >
          <img src={imagotipoUrl} alt="Salva Ramos" className="h-8 max-w-[180px] object-contain" />
        </Link>
        <div className="w-10 flex-none" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="bg-base-100 text-base-content border-base-300 sticky top-0 hidden h-screen w-64 min-w-64 shrink-0 flex-col overflow-y-auto border-r px-3 pb-4 lg:flex">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
            isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={closeDrawer}
          aria-hidden="true"
        />

        {/* Drawer */}
        <aside
          className={`bg-base-100 text-base-content fixed top-0 left-0 z-50 flex h-screen w-80 flex-col overflow-y-auto p-4 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <button
            onClick={closeDrawer}
            className="btn btn-ghost btn-sm btn-circle absolute top-4 right-4"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>

          <NavContent />
        </aside>
      </>
    </>
  );
};

export default NavBar;
