import { X } from 'lucide-react';

function Sheet({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(var(--ink-rgb),0.55)' }} onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl overflow-y-auto animate-sheet-up" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-paper" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--ink-rgb),0.06)' }}>
            <X size={17} className="text-ink" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export { Sheet };
