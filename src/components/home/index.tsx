import { useSessionContext } from '../../context/SessionContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
const Home = () => {
  const navigate = useNavigate();
  const { user } = useSessionContext();

  if (!user) {
    navigate('/ingresar');
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar/Navbar */}
      <aside className="bg-accent-content hidden w-48 p-4 shadow-lg md:flex md:flex-col">
        <div className="mb-4 text-lg font-bold">MasterClass</div>
        <nav className="flex flex-col space-y-2">
          <a href="#" className="hover:text-primary">
            Inicio
          </a>
          <a href="#" className="hover:text-primary">
            Perfil
          </a>
          <a href="#" className="hover:text-primary">
            Configuración
          </a>
        </nav>
        <div className="mt-auto pt-4 text-sm">
          {user ? `Conectado como: ${user.name || user.email}` : 'No autenticado'}
        </div>
      </aside>
      {/* Mobile Navbar Button */}
      <button
        className="btn btn-square btn-primary fixed top-4 left-4 z-50 md:hidden"
        data-mobile-sidebar
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <aside
        id="mobile-sidebar"
        className="bg-base-100 fixed top-0 left-0 z-40 hidden h-full w-64 p-4 shadow-lg md:hidden"
      ></aside>
      {/* Main Content */}
      <main className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Bienvenido a MasterClass</h1>
          <p className="text-lg">Tu plataforma de gestión de reservas y clases.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Reservas</h2>
              <p>Gestiona todas tus reservas desde un solo lugar.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => navigate('reservas')}>
                  Ver Reservas
                </button>
              </div>
            </div>
          </div>
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Clases</h2>
              <p>Administra y programa tus clases fácilmente.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Ver Clases</button>
              </div>
            </div>
          </div>
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Usuarios</h2>
              <p>Controla el acceso y los permisos de los usuarios.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Ver Usuarios</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Estadísticas</h2>
              <p>Visualiza el rendimiento y las métricas clave.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Ver Estadísticas</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
