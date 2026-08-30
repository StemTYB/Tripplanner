import { Compass, Sparkles } from 'lucide-react';

function ThemeToggle({ theme, setTheme }) {
  const isOtaku = theme === 'otaku';
  return (
    <button
      onClick={() => setTheme(isOtaku ? 'default' : 'otaku')}
      className="btn-gloss flex items-center gap-1.5 font-mono text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 border border-white/25"
      style={{
        backgroundColor: isOtaku ? 'var(--stamp)' : 'rgba(var(--line-rgb),0.08)',
        color: isOtaku ? 'var(--text-inverse)' : 'var(--text)',
      }}
      aria-pressed={isOtaku}
      aria-label="Cambiar tema"
    >
      <Sparkles size={13} />
      Otaku mode
    </button>
  );
}

function TopBar({ tabs, tab, theme, setTheme, onNotesTap }) {
  const current = tabs.find((t) => t.key === tab);
  const isNotas = current.key === 'notas';
  return (
    <header className="bg-paper flex items-center justify-between gap-2 px-4 py-3.5 border-b lg:hidden" style={{ borderColor: 'rgba(var(--line-rgb),0.12)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-ink shrink-0"><Compass size={16} className="text-paper" /></span>
        <div className="min-w-0">
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.45 }}>Trip Planner</p>
          <p className={'font-display font-bold text-ink text-sm leading-none mt-0.5 truncate' + (isNotas ? ' cursor-pointer select-none' : '')}
             onClick={isNotas ? onNotesTap : undefined}>{current.label}</p>
        </div>
      </div>
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  );
}

function DesktopSidebar({ tabs, tab, setTab, theme, setTheme, onNotesTap }) {
  return (
    <aside className="hidden lg:flex min-h-0 flex-col bg-ink text-paper p-5 lg:border-r lg:border-white/10">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.12)' }}>
          <Compass size={21} className="text-paper" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-paper" style={{ opacity: 0.55 }}>Trip Planner</p>
          <h1 className="font-display text-lg font-bold text-paper leading-tight">Plan de viaje</h1>
        </div>
      </div>

      <nav className="space-y-1.5" aria-label="Secciones principales">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key === 'notas') onNotesTap?.(); }}
              className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors"
              style={{
                backgroundColor: active ? 'var(--paper)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-inverse)',
                opacity: active ? 1 : 0.68,
              }}
            >
              <Icon size={18} />
              <span className="font-display text-sm font-semibold">{t.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.08)' }}>
          <p className="font-mono text-xs text-paper mb-2" style={{ opacity: 0.55 }}>Tema</p>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ tabs, tab, setTab, onNotesTap }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t bg-paper py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] lg:hidden" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = tab === t.key;
        return (
          <button key={t.key} onClick={() => { setTab(t.key); if (t.key === 'notas') onNotesTap?.(); }} className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-0.5 py-0.5 rounded-xl">
            <Icon size={19} style={{ color: active ? 'var(--stamp)' : 'var(--text)', opacity: active ? 1 : 0.45 }} />
            <span className="font-mono w-full text-center truncate" style={{ fontSize: '10px', color: active ? 'var(--stamp)' : 'var(--text)', opacity: active ? 1 : 0.45 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ResponsiveAppShell({ tabs, tab, setTab, theme, setTheme, isOtaku, onNotesTap, children }) {
  // BottomNav va FUERA de la cáscara: `.bg-paper` usa `backdrop-filter`, y un
  // `backdrop-filter` sobre un ancestro lo convierte en el containing block de
  // los `position: fixed`, anclando la barra al fondo del documento en vez del
  // viewport. Al ser hermana de la cáscara, `fixed bottom-0` vuelve a funcionar.
  return (
    <>
      <div
        className="w-full sm:max-w-md lg:max-w-6xl bg-paper min-h-screen sm:rounded-[2.5rem_2rem_3rem_2.25rem] sm:border sm:border-white/15 sm:shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"
        style={{
          fontFamily: 'var(--font-body)',
          backgroundImage: isOtaku ? 'radial-gradient(rgba(var(--line-rgb),0.07) 1px, transparent 1.6px)' : 'none',
          backgroundSize: '16px 16px',
        }}
      >
        <TopBar tabs={tabs} tab={tab} theme={theme} setTheme={setTheme} onNotesTap={onNotesTap} />
        <DesktopSidebar tabs={tabs} tab={tab} setTab={setTab} theme={theme} setTheme={setTheme} onNotesTap={onNotesTap} />
        <main className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:min-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-5rem)] lg:px-5 lg:py-6 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNav tabs={tabs} tab={tab} setTab={setTab} onNotesTap={onNotesTap} />
    </>
  );
}

export { ResponsiveAppShell };
