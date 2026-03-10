import { useState } from 'react';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  role: 'student' | 'professor';
  createdAt: string;
}

const CURRENT_USER_ID = 1;

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 1,
    content: '¿Alguien puede explicarme la diferencia entre useMemo y useCallback? Me confundo con los casos de uso de cada uno.',
    authorName: 'Ana García',
    role: 'student',
    createdAt: '2026-03-10T09:15:00Z',
  },
  {
    id: 2,
    content: 'Gran pregunta, Ana. useMemo memoriza el resultado de un cálculo costoso, mientras que useCallback memoriza la referencia de una función. Úsalos cuando quieras evitar re-renders innecesarios en componentes hijos que dependen de esas referencias.',
    authorName: 'Prof. Santiago Ramos',
    role: 'professor',
    createdAt: '2026-03-10T10:30:00Z',
  },
  {
    id: 3,
    content: 'Gracias profesor, ahora tiene mucho más sentido. Entonces, useCallback es especialmente útil cuando paso funciones como props a componentes envueltos en React.memo, ¿correcto?',
    authorName: 'Carlos Mendoza',
    role: 'student',
    createdAt: '2026-03-10T11:05:00Z',
  },
];

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ClassForum() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');

  function handleEditStart(comment: Comment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  function handleEditSave(id: number) {
    if (!editContent.trim()) return;
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: editContent.trim() } : c))
    );
    setEditingId(null);
    setEditContent('');
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditContent('');
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const next: Comment = {
      id: Date.now(),
      content: newComment.trim(),
      authorName: 'Ana García',
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, next]);
    setNewComment('');
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Foro de la Clase</h2>

      <div className="flex flex-col gap-1">
        {comments.map((comment) => {
          const isProfessor = comment.role === 'professor';
          const isCurrentUser = comment.id === CURRENT_USER_ID;

          return (
            <div
              key={comment.id}
              className={`chat ${isProfessor ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-header mb-1 flex items-baseline gap-2">
                <span className="font-semibold">{comment.authorName}</span>
                {isProfessor && (
                  <span className="badge badge-primary badge-xs">Profesor</span>
                )}
                <time className="text-base-content/50 text-xs">{formatDate(comment.createdAt)}</time>
              </div>

              {isCurrentUser && editingId === comment.id ? (
                <div className="chat-bubble chat-bubble-neutral flex w-full max-w-sm flex-col gap-2 bg-transparent p-0">
                  <textarea
                    className="textarea textarea-bordered w-full resize-none text-sm"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => handleEditSave(comment.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={handleEditCancel}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`chat-bubble ${isProfessor ? 'chat-bubble-primary' : 'chat-bubble-neutral'} relative`}
                >
                  <p className="text-sm">{comment.content}</p>
                  {isCurrentUser && (
                    <button
                      className="btn btn-ghost btn-xs mt-2 self-end text-xs opacity-70 hover:opacity-100"
                      onClick={() => handleEditStart(comment)}
                    >
                      Editar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="divider my-0" />

      <form onSubmit={handleAddComment} className="flex items-end gap-2">
        <div className="form-control flex-1">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
