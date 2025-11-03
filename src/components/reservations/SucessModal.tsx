type SuccessModalProps = {
  reservationId: string;
  paymentReference?: string;
  setShowModal: (show: boolean) => void;
};

export default function SuccessModal(props: SuccessModalProps) {
  const bankData = {
    accountHolder: 'Salvador Ramos SpA',
    accountNumber: '1234567890',
    bankName: 'Banco de Chile',
    accountType: 'Cuenta Corriente',
    rut: '76.XXX.XXX-X',
    email: 'pagos@salvaramos.cl',
    amount: 14990,
    currency: 'CLP',
    referenceId: `REF-${Date.now()}`,
  };

  const copyBankDetails = () => {
    if (!bankData) return;

    const text = `
${bankData.accountHolder}
${bankData.rut}
${bankData.accountType}
${bankData.accountNumber}
${bankData.bankName}
${bankData.email}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert('¡Datos copiados al portapapeles!');
    });
  };

  const { reservationId, paymentReference, setShowModal } = props;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="mb-4 text-2xl font-bold">¡Reserva Confirmada!</h3>

        <div className="alert alert-success mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="font-bold">Reserva #{reservationId}</div>
            <div className="text-sm">
              Tu reserva se activará una vez que realices el pago y sea validado por nuestro equipo.
            </div>
          </div>
        </div>

        <div className="divider">Datos para Transferencia</div>

        <div className="bg-base-200 space-y-3 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-base-content/60 text-sm">Titular</div>
              <div className="font-semibold">{bankData.accountHolder}</div>
            </div>
            <div>
              <div className="text-base-content/60 text-sm">RUT</div>
              <div className="font-semibold">{bankData.rut}</div>
            </div>
            <div>
              <div className="text-base-content/60 text-sm">Banco</div>
              <div className="font-semibold">{bankData.bankName}</div>
            </div>
            <div>
              <div className="text-base-content/60 text-sm">Tipo de cuenta</div>
              <div className="font-semibold">{bankData.accountType}</div>
            </div>
            <div>
              <div className="text-base-content/60 text-sm">N° de cuenta</div>
              <div className="font-mono font-semibold">{bankData.accountNumber}</div>
            </div>
            <div>
              <div className="text-base-content/60 text-sm">Monto</div>
              <div className="text-primary text-xl font-semibold">
                {new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: bankData.currency,
                }).format(bankData.amount)}
              </div>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div>
            <div className="text-base-content/60 text-sm">Referencia</div>
            <div className="font-mono text-lg font-semibold">{paymentReference}</div>
          </div>

          <div>
            <div className="text-base-content/60 text-sm">Email de confirmación</div>
            <div className="font-semibold">{bankData.email}</div>
          </div>
        </div>

        <div className="alert alert-warning mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm">
            <strong>Importante:</strong> Asegúrate de incluir la referencia{' '}
            <code className="font-bold">{paymentReference}</code> en tu transferencia para que
            podamos identificarla correctamente.
          </span>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={copyBankDetails}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copiar Datos
          </button>
          <button className="btn" onClick={() => setShowModal(false)}>
            Cerrar
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShowModal(false)}>close</button>
      </form>
    </dialog>
  );
}
