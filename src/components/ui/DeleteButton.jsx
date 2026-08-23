import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

function DeleteButton({ onDelete }) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);
  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={onDelete} className="font-mono text-xs px-2 py-1 rounded-lg bg-stamp text-paper font-semibold">Sí</button>
        <button onClick={() => setConfirming(false)} className="font-mono text-xs px-2 py-1 rounded-lg text-ink" style={{ backgroundColor: 'rgba(var(--ink-rgb),0.08)' }}>No</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }} aria-label="Eliminar">
      <Trash2 size={14} />
    </button>
  );
}

export { DeleteButton };
