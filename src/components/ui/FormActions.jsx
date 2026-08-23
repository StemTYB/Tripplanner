function FormActions({ mode, onSave, onDelete, disabled }) {
  return (
    <div className="pt-2">
      <button onClick={onSave} disabled={disabled}
        className="w-full py-3 rounded-xl font-display font-semibold bg-stamp text-paper"
        style={{ opacity: disabled ? 0.5 : 1 }}>
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
