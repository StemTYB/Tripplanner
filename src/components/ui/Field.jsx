function Field({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink mb-1.5" style={{ opacity: 0.5 }}>{label}</p>
      {children}
    </div>
  );
}

export { Field };
