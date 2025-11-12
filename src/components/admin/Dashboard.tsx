import { useEffect, useMemo, useState } from 'react';
import { getAdminDashboard, type AdminDashboardStats } from '@client/admin/dashboard';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

function formatCurrencyCLP(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAdminDashboard();
        if (mounted) setData(res);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Error cargando dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const revenueText = useMemo(() => {
    if (!data) return { current: '-', change: '-' };
    return {
      current: formatCurrencyCLP(data.stats.revenue.thisMonth),
      change: `${data.stats.revenue.changePercent > 0 ? '↗︎' : '↘︎'} ${Math.abs(
        data.stats.revenue.changePercent
      )}% vs mes anterior`,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-base-content/60 mt-2">Cargando resumen...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stats shadow">
              <div className="stat">
                <div className="skeleton h-6 w-16" />
                <div className="skeleton mt-2 h-8 w-24" />
                <div className="skeleton mt-2 h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-error mt-2">{error}</p>
        </div>
        <button className="btn btn-primary" onClick={() => location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

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
            <div className="stat-value text-primary">{data?.stats.courses.total ?? '-'}</div>
            <div className="stat-desc">
              ↗︎ {data?.stats.courses.newThisMonth ?? 0} nuevos este mes
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <span className="text-4xl">🎓</span>
            </div>
            <div className="stat-title">Estudiantes</div>
            <div className="stat-value text-secondary">{data?.stats.students.total ?? '-'}</div>
            <div className="stat-desc">↗︎ {data?.stats.students.newThisMonth ?? 0} este mes</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <span className="text-4xl">📅</span>
            </div>
            <div className="stat-title">Reservas activas</div>
            <div className="stat-value text-success">{data?.stats.reservations.active ?? '-'}</div>
            <div className="stat-desc">↗︎ {data?.stats.reservations.pending ?? 0} pendientes</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-warning">
              <span className="text-4xl">💰</span>
            </div>
            <div className="stat-title">Ingresos (mes)</div>
            <div className="stat-value text-warning">{revenueText.current}</div>
            <div className="stat-desc">{revenueText.change}</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Últimas reservas</h2>
            <div className="space-y-3">
              {(data?.recentActivity.reservations ?? []).slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className="bg-base-100 flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content w-10 rounded-full">
                        <span>{getInitials(r.student.name)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{r.student.name}</p>
                      <p className="text-base-content/60 text-sm">
                        {r.class.course.title} - {r.class.title} ·{' '}
                        {formatDateTime(r.slot.startTime)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`badge ${
                      r.status === 'confirmed'
                        ? 'badge-success'
                        : r.status === 'pending'
                          ? 'badge-warning'
                          : 'badge-ghost'
                    }`}
                  >
                    {r.status === 'confirmed'
                      ? 'Confirmada'
                      : r.status === 'pending'
                        ? 'Pendiente'
                        : r.status}
                  </div>
                </div>
              ))}
              {!data?.recentActivity.reservations?.length && (
                <div className="text-base-content/60">No hay reservas recientes</div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pagos pendientes</h2>
            <div className="space-y-3">
              {(data?.recentActivity.pendingPayments ?? []).slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="bg-base-100 flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-warning text-warning-content w-10 rounded-full">
                        <span>{getInitials(p.student.name)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{p.student.name}</p>
                      <p className="text-base-content/60 text-sm">
                        {formatCurrencyCLP(p.amount)} · Ref: {p.transactionReference}
                      </p>
                      <p className="text-base-content/50 text-xs">
                        {p.courses.map((c) => `${c.acronym} - ${c.classTitle}`).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="badge badge-warning">Pendiente</div>
                </div>
              ))}
              {!data?.recentActivity.pendingPayments?.length && (
                <div className="text-base-content/60">No hay pagos pendientes</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
