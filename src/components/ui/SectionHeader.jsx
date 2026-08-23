import { Plus } from 'lucide-react';

function SectionHeader({ title, onAdd, addLabel = 'Añadir' }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-1.5 rounded-full bg-ink text-paper">
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

export { SectionHeader };
