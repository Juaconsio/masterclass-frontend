export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-base-content/60 mt-2">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <span className="text-4xl">📚</span>
            </div>
            <div className="stat-title">Cursos activos</div>
            <div className="stat-value text-primary">12</div>
            <div className="stat-desc">↗︎ 2 nuevos este mes</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <span className="text-4xl">🎓</span>
            </div>
            <div className="stat-title">Estudiantes</div>
            <div className="stat-value text-secondary">256</div>
            <div className="stat-desc">↗︎ 18 este mes</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <span className="text-4xl">📅</span>
            </div>
            <div className="stat-title">Reservas activas</div>
            <div className="stat-value text-success">48</div>
            <div className="stat-desc">↗︎ 12 pendientes</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-warning">
              <span className="text-4xl">💰</span>
            </div>
            <div className="stat-title">Ingresos (mes)</div>
            <div className="stat-value text-warning">$2.4M</div>
            <div className="stat-desc">↗︎ +15% vs mes anterior</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Últimas reservas</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-base-100 flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content w-10 rounded-full">
                        <span>JD</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">Juan Pérez</p>
                      <p className="text-base-content/60 text-sm">Cálculo II - Clase {i}</p>
                    </div>
                  </div>
                  <div className="badge badge-success">Confirmada</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pagos pendientes</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-base-100 flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-warning text-warning-content w-10 rounded-full">
                        <span>MP</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">María González</p>
                      <p className="text-base-content/60 text-sm">$25.000 - Transferencia</p>
                    </div>
                  </div>
                  <div className="badge badge-warning">Pendiente</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
