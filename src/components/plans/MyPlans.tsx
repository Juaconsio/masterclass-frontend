import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { getMyPurchases } from '@/client/purchases';
import type { StudentPlanPurchase } from '@/client/purchases';
import { PlanCard } from './PlanCard';

export default function MyPlans() {
  const [purchases, setPurchases] = useState<StudentPlanPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPurchases()
      .then((list) => setPurchases(list ?? []))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Planes y pagos</h1>
          <p className="text-base-content/70 mt-1">
            Gestiona tus planes, revisa el estado de pagos, canjea sesiones o adquiere nuevos
            planes.
          </p>
        </div>
        <Link to="/app/cursos" className="btn btn-primary gap-2">
          <Plus className="h-5 w-5" aria-hidden />
          Comprar nuevo plan
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="border-base-content/20 bg-base-200/50 rounded-xl border-2 border-dashed p-8 text-center">
          <p className="text-base-content/70">Aún no tienes planes comprados.</p>
          <Link to="/app/cursos" className="btn btn-primary mt-4">
            Comprar nuevo plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <PlanCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
