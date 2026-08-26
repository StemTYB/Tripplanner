import { Plus } from 'lucide-react';

function SectionHeader({ title, onAdd, addLabel = 'Añadir', onTitleClick }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2
        className={'font-display text-base font-bold text-ink' + (onTitleClick ? ' cursor-pointer select-none' : '')}
        onClick={onTitleClick}
      >{title}</h2>
      {onAdd && (
        <button onClick={onAdd} className="btn-gloss flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-1.5 rounded-full bg-ink text-paper border border-white/20">
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

export { SectionHeader };
