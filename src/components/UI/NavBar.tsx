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
} from 'lucide-react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router';
import { useSessionContext } from '@/context/SessionContext';
import { clearAuthStorage } from '@client/authStorage';

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
        { label: 'Pagos', href: '/admin/pagos', icon: <CreditCard className="h-5 w-5" /> },
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
        { label: 'Cursos', href: '/app/cursos', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Reservas', href: '/app/reservas', icon: <Calendar className="h-5 w-5" /> },
      ];
    }
  }, [isAdmin, isProfessor]);

  const isActive = (href: string) => {
    const path = location.pathname;
    if (!path) return false;
    // Exact match para home, starts with para otros
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

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo/Header */}
      <div>
        <a href="/" className="flex items-center gap-2 px-4 py-6">
          <div className="avatar">
            <div className="h-16 rounded-lg">
              <img
                src="/images/LOGO_FONDO_AZUL.png"
                alt="Logo de Salva Ramos"
                className="size-full rounded-lg object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Salva Ramos</h2>
            <p className="text-base-content/60 text-xs">
              {isAdmin ? 'Panel de administración' : 'Plataforma de estudio'}
            </p>
          </div>
        </a>
        <div className="divider"></div>
      </div>

      <div className="p-2">
        <div className="bg-base-300 mb-4 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold">{user?.email || 'Usuario'}</p>
          <div className="badge badge-primary badge-sm mt-2">
            {USER_ROLE_LABEL[user?.role as keyof typeof USER_ROLE_LABEL] || ''}
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav aria-label="Menu de navegación" className="flex-1 space-y-1">
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

      <div className="divider"></div>

      {/* Opciones adicionales */}
      <ul className="menu">
        <li>
          <Link to="/app/perfil" onClick={closeDrawer} className="text-sm">
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="text-error text-sm">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="navbar bg-base-200 border-base-300 sticky top-0 z-50 border-b lg:hidden">
        <div className="flex-none">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn btn-ghost btn-square"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold">Salva Ramos</h2>
            <p className="text-base-content/60 text-xs">
              {isAdmin && !isStudentView ? 'Panel de administración' : 'Plataforma de estudio'}
            </p>
          </div>
        </div>
        <Link to={isAdmin ? '/admin' : '/app'} className="flex-none">
          <div className="avatar">
            <div className="h-16 rounded-lg">
              <img
                src="/images/logo.png"
                alt="Logo de Salva Ramos"
                className="size-full rounded-lg object-cover"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Desktop Sidebar */}
      <aside className="bg-base-200 text-base-content border-base-300 sticky top-0 hidden h-screen w-fit shrink-0 flex-col overflow-y-auto border-r px-4 pb-4 lg:flex">
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
          className={`bg-base-200 text-base-content fixed top-0 left-0 z-50 flex h-screen w-80 flex-col overflow-y-auto p-4 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
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
