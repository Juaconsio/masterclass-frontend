import { Icon } from '@/lib/icons';
import { Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Inicio', icon: 'mdi:home' },
  { href: '/about', label: 'Nosotros', icon: 'mdi:information' },
  { href: '/courses', label: 'Cursos', icon: 'mdi:book' },
  { href: '/#contact', label: 'Contacto', icon: 'mdi:contact-mail' },
];

export default function Navbar() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    const currentPath = location.pathname + location.hash;
    return href === currentPath;
  };

  useEffect(() => {
    // Close drawer when location changes
    setDrawerOpen(false);
  }, [location]);

  return (
    <>
      {/* Navbar principal */}
      <nav className="navbar h-navbar px-3 sm:px-4 md:px-8 lg:px-12 fixed top-0 bg-primary/80 backdrop-blur border-b border-base-300 z-50 flex justify-between">
        {/* Mobile: Botón menú principal (izquierda) */}
        <div className="flex-none lg:hidden">
          <label
            htmlFor="main-drawer"
            aria-label="open main menu"
            className="btn btn-navbar btn-square btn-sm sm:btn-md"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="mdi:menu" size={28} className="sm:w-8 sm:h-8" />
          </label>
        </div>

        {/* Logo/título */}
        <div className="flex-1 lg:flex-none">
          <Link
            to="/"
            className="flex justify-center items-center normal-case text-lg sm:text-xl font-bold tracking-wide gap-1 sm:gap-2 hover:bg-transparent hover:border-0 px-1 sm:px-2"
          >
            <div className="avatar">
              <div className="w-10 h-20 sm:w-12 sm:h-24 rounded-full">
                <img src="/images/logo.png" alt="Salva Ramos Logo" />
              </div>
            </div>
            <span className="hidden sm:inline">Salva Ramos</span>
          </Link>
        </div>

        {/* Desktop: Menú de navegación (centro) */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
          <ul className="menu menu-horizontal">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`text-lg font-medium ${isActive(link.href) ? 'active' : ''}`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón Iniciar Sesión */}
        <div className="flex-none">
          <Link
            to="/ingresar"
            aria-label="Iniciar Sesión"
            className="btn btn-navbar btn-square btn-sm sm:btn-md lg:btn-ghost lg:btn-wide lg:px-2"
          >
            <Icon name="mdi:login" size={20} className="sm:w-6 sm:h-6 lg:hidden" />
            <span className="hidden lg:inline text-lg font-medium">Iniciar Sesión</span>
          </Link>
        </div>
      </nav>

      {/* Drawer: Menú principal */}
      <div className="drawer z-60">
        <input
          id="main-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={(e) => setDrawerOpen(e.target.checked)}
        />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label
            htmlFor="main-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          ></label>
          <ul className="menu bg-base-200 min-h-full w-72 sm:w-80 p-4 sm:p-6">
            <li className="menu-title mb-2">
              <span className="text-base sm:text-lg">Navegación</span>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`text-base sm:text-lg font-medium flex justify-between py-3 sm:py-4 ${
                    isActive(link.href) ? 'active' : ''
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  <Icon name={link.icon} size={24} className="sm:w-6 sm:h-6" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
