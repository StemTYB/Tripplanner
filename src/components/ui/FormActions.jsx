function FormActions({ mode, onSave, onDelete, disabled }) {
  return (
    <div className="pt-2">
      <button onClick={onSave} disabled={disabled}
        className="btn-gloss w-full py-3 rounded-2xl font-display font-semibold bg-stamp text-paper border border-white/20"
        style={{ opacity: disabled ? 0.5 : 1, boxShadow: '0 14px 30px -12px rgba(var(--stamp-rgb),0.55)' }}>
        {mode === 'add' ? 'Añadir' : 'Guardar cambios'}
      </button>
      {mode === 'edit' && onDelete && (
        <button onClick={onDelete} className="w-full py-2.5 mt-2 rounded-xl font-semibold text-stamp text-sm">
          Eliminar
        </button>
      )}
    </div>
  );
}

export { FormActions };
