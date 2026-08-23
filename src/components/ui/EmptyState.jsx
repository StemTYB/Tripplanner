function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center" style={{ borderColor: 'rgba(var(--ink-rgb),0.18)' }}>
      <Icon size={22} className="mx-auto text-ink" style={{ opacity: 0.35 }} />
      <p className="font-display font-semibold text-ink text-sm mt-2">{title}</p>
      {subtitle && <p className="text-xs text-ink mt-1" style={{ opacity: 0.5 }}>{subtitle}</p>}
    </div>
  );
}

export { EmptyState };
