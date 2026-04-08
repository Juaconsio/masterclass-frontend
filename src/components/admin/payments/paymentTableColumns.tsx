import type { TableColumn } from '@components/UI';
import type { AdminPayment } from '@/client/admin/payments';
import { PaymentStatusBadge } from '../shared/StatusBadges';

export function createPaymentTableColumns(
  formatCurrency: (n: number) => string,
  formatDate: (s?: string) => string
): TableColumn<AdminPayment>[] {
  return [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      formatter: (value) => <span className="font-mono text-sm">#{value}</span>,
    },
    {
      key: 'student',
      label: 'Estudiante',
      className: 'min-w-[12rem]',
      render: (p) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="truncate font-semibold">{p.student?.name ?? 'N/A'}</div>
          <div className="text-base-content/60 truncate text-xs">{p.student?.email ?? ''}</div>
          {p.student?.rut ? (
            <div
              className="text-base-content/55 truncate font-mono text-[11px]"
              title={p.student.rut}
            >
              {p.student.rut}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      className: 'min-w-[12rem] max-w-[14rem]',
      render: (p) => {
        const plan = p.studentPlanPurchase?.pricingPlan;
        const course = plan?.course;
        const ref = p.transactionReference?.trim() ?? '';
        if (!plan) {
          return (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base-content/50 text-sm">—</span>
              {ref ? (
                <span
                  className="text-base-content/35 truncate font-mono text-[10px] leading-tight"
                  title={ref}
                >
                  Ref. {ref}
                </span>
              ) : null}
            </div>
          );
        }
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium">{plan.name}</span>
            {course && (
              <span className="text-base-content/60 text-xs leading-snug">
                {course.acronym} · {course.title}
              </span>
            )}
            {ref ? (
              <span
                className="text-base-content/35 truncate font-mono text-[10px] leading-tight"
                title={ref}
              >
                Ref. {ref}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (p) => <span className="font-semibold">{formatCurrency(p.amount)}</span>,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
    {
      key: 'createdAt',
      label: 'Fecha pago',
      sortable: true,
      className: 'min-w-[9rem]',
      render: (p) => <span className="text-sm">{formatDate(p.createdAt)}</span>,
    },
  ];
}
