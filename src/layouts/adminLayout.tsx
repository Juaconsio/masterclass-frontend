import { Outlet, Link } from 'react-router';
import { useSessionContext } from '@/context/SessionContext';

export default function AdminLayout() {
  const { user } = useSessionContext();

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/courses', label: 'Cursos', icon: '📚' },
    { path: '/admin/professors', label: 'Profesores', icon: '👨‍🏫' },
    { path: '/admin/students', label: 'Estudiantes', icon: '🎓' },
    { path: '/admin/reservations', label: 'Reservas', icon: '📅' },
    { path: '/admin/payments', label: 'Pagos', icon: '💳' },
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar móvil */}
        <div className="navbar bg-base-300 lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="admin-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">
            <span className="text-lg font-bold">Panel Admin</span>
          </div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar placeholder"
              >
                <div className="bg-neutral text-neutral-content w-10 rounded-full">
                  <span className="text-xl">{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/app">Ver como estudiante</Link>
                </li>
                <li>
                  <a>Cerrar sesión</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <aside className="bg-base-200 text-base-content min-h-full w-80 p-4">
          {/* Logo/Header */}
          <div className="flex items-center gap-2 px-4 py-6">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content w-10 rounded-lg">
                <span className="text-xl">⚡</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Salva Ramos</h2>
              <p className="text-base-content/60 text-xs">Panel Admin</p>
            </div>
          </div>

          <div className="divider"></div>

          {/* Info del admin */}
          <div className="bg-base-300 mb-4 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold">{user?.name || 'Administrador'}</p>
            <p className="text-base-content/60 text-xs">{user?.email || 'admin@example.com'}</p>
            <div className="badge badge-primary badge-sm mt-2">Admin</div>
          </div>

          {/* Navegación */}
          <ul className="menu menu-lg gap-1">
            {adminNavItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="divider"></div>

          {/* Opciones adicionales */}
          <ul className="menu">
            <li>
              <Link to="/app" className="text-sm">
                <span>👤</span>
                Ver como estudiante
              </Link>
            </li>
            <li>
              <a className="text-error text-sm">
                <span>🚪</span>
                Cerrar sesión
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
