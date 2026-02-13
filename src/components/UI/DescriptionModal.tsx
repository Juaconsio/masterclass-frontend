export interface DescriptionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | null;
  sections?: { label: string; content: string | null }[];
}

export default function DescriptionModal({
  open,
  onClose,
  title,
  description,
  sections = [],
}: DescriptionModalProps) {
  const hasDescription = description != null && description.trim() !== '';
  const hasSections = sections.some((s) => s.content != null && String(s.content).trim() !== '');

  return (
    <dialog open={open} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="mt-4 space-y-4">
          {hasDescription && (
            <div>
              <p className="text-base-content/80 whitespace-pre-wrap">{description}</p>
            </div>
          )}
          {sections.map(
            (s) =>
              s.content != null &&
              String(s.content).trim() !== '' && (
                <div key={s.label}>
                  <h4 className="mb-1 font-semibold text-sm text-base-content/70">{s.label}</h4>
                  <p className="text-base-content/80 whitespace-pre-wrap">{s.content}</p>
                </div>
              )
          )}
          {!hasDescription && !hasSections && (
            <p className="text-base-content/50 italic">Sin contenido.</p>
          )}
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={() => onClose()}>
        <button type="submit">cerrar</button>
      </form>
    </dialog>
  );
}
