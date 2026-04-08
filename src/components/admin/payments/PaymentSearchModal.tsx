import { useAdminPaymentsTab } from './AdminPaymentsContext';

export function PaymentSearchModal() {
  const {
    paymentSearchOpen,
    paymentSearchDraft,
    setPaymentSearchDraft,
    planOptions,
    setPaymentSearchOpen,
    applyPaymentSearchFromModal,
  } = useAdminPaymentsTab();

  if (!paymentSearchOpen) return null;

  const draft = paymentSearchDraft;
  const setDraft = setPaymentSearchDraft;
  const onClose = () => setPaymentSearchOpen(false);

  return (
    <dialog open className="modal modal-open modal-bottom sm:modal-middle z-30">
      <div className="modal-box max-h-[85dvh] w-full max-w-lg overflow-y-auto">
        <h3 className="mb-4 text-lg font-bold">Buscar pagos</h3>
        <div className="flex flex-col gap-3">
          <label className="form-control w-full">
            <span className="label-text text-xs">ID pago</span>
            <input
              type="number"
              className="input input-bordered input-sm w-full"
              placeholder="Ej. 42"
              value={draft.id}
              onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text text-xs">Referencia</span>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="Referencia de transacción"
              value={draft.transactionReference}
              onChange={(e) =>
                setDraft((d) => ({ ...d, transactionReference: e.target.value }))
              }
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text text-xs">RUT estudiante</span>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="Ej. 12.345.678-9"
              value={draft.studentRut}
              onChange={(e) => setDraft((d) => ({ ...d, studentRut: e.target.value }))}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text text-xs">Plan de precios</span>
            <select
              className="select select-bordered select-sm w-full"
              value={draft.pricingPlanId}
              onChange={(e) => setDraft((d) => ({ ...d, pricingPlanId: e.target.value }))}
            >
              <option value="">Cualquiera</option>
              {planOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.courseId != null ? ` · curso #${p.courseId}` : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="form-control w-full">
              <span className="label-text text-xs">Fecha desde</span>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={draft.paymentDateFrom}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, paymentDateFrom: e.target.value }))
                }
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-xs">Fecha hasta</span>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={draft.paymentDateTo}
                onChange={(e) => setDraft((d) => ({ ...d, paymentDateTo: e.target.value }))}
              />
            </label>
          </div>
        </div>
        <div className="modal-action flex-wrap gap-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={applyPaymentSearchFromModal}>
            Aplicar
          </button>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <button type="submit" className="cursor-default opacity-0">
          Cerrar
        </button>
      </form>
    </dialog>
  );
}
