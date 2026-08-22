/**
 * TRIP PLANNER — frontend (Vite + React), desplegado en Cloudflare
 * ---------------------------------------------------------
 * Mismo componente que el prototipo original. `data` ya no vive en
 * useState(seedData): se carga con GET /api/state al montar, y cada
 * función de mutación (add/update/remove/updateTrip/...) actualiza el
 * estado local de forma optimista y además dispara la llamada
 * correspondiente a la API (ver src/api.js), que en este deploy corre
 * como un Cloudflare Worker (worker/index.js) sobre una base de datos
 * D1 (SQLite administrado por Cloudflare).
  */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, Calendar, Map, Compass, StickyNote, Plus, X, Pencil, Trash2,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Plane, TrainFront, Bus, Car, Ship,
  MapPin, Route, BedDouble,
  Utensils, ShoppingBag, Landmark, Music, Trees, Sparkles, Gauge,
  CheckCircle2, ArrowRight,
} from 'lucide-react';
import { api } from './api';

/* ============================================================
   ESTILOS GLOBALES (fuentes, colores, clases utilitarias)
   ============================================================ */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap');

      :root {
        --paper: #FAF6EE;
        --paper-dim: #F1EAD9;
        --ink: #1C2541;
        --stamp: #E4572E;
        --gold: #D9A441;
        --sky: #3B6EA5;
        --sage: #3E7C59;
        --ink-rgb: 28,37,65;
        --paper-rgb: 250,246,238;
        --stamp-rgb: 228,87,46;
        --font-display: 'Space Grotesk', sans-serif;
        --font-body: 'Manrope', sans-serif;
      }
      * { box-sizing: border-box; }
      html, body { background: var(--ink); }

      .font-display { font-family: var(--font-display); }
      .font-mono { font-family: 'IBM Plex Mono', monospace; }
      .font-body, body { font-family: 'Manrope', sans-serif; }

      .bg-paper { background-color: var(--paper); }
      .bg-paper-dim { background-color: var(--paper-dim); }
      .bg-ink { background-color: var(--ink); }
      .bg-stamp { background-color: var(--stamp); }
      .bg-gold { background-color: var(--gold); }
      .bg-sky { background-color: var(--sky); }
      .bg-sage { background-color: var(--sage); }
      .text-paper { color: var(--paper); }
      .text-ink { color: var(--ink); }
      .text-stamp { color: var(--stamp); }

      .field-input, .field-select, .field-textarea {
        width: 100%;
        border-radius: 0.85rem;
        padding: 0.65rem 0.9rem;
        font-size: 0.875rem;
        color: var(--ink);
        background: #fff;
        border: 1.5px solid rgba(var(--ink-rgb),0.14);
        outline: none;
        font-family: var(--font-body);
        transition: border-color .15s, box-shadow .15s;
      }
      .field-input:focus, .field-select:focus, .field-textarea:focus {
        border-color: var(--stamp);
        box-shadow: 0 0 0 3px rgba(var(--stamp-rgb),0.12);
      }
      .field-textarea { min-height: 4.5rem; resize: vertical; }
      input[type="date"], input[type="time"] { font-family: 'IBM Plex Mono', monospace; }

      .chip {
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        border: 1.5px solid rgba(var(--ink-rgb),0.14);
        color: var(--ink);
        white-space: nowrap;
        flex-shrink: 0;
        background: #fff;
      }
      .chip.active { background: var(--ink); border-color: var(--ink); color: var(--paper); }

      @keyframes sheetUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .animate-sheet-up { animation: sheetUp .2s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .animate-fade-in { animation: fadeIn .15s ease-out; }

      .scrollbar-none::-webkit-scrollbar { display: none; }
      .scrollbar-none { scrollbar-width: none; }
    `}</style>
  );
}

/* ============================================================
   CONFIGURACIÓN / TAXONOMÍAS
   ============================================================ */

// colorVar returns a CSS var() reference (not a literal hex) so every dynamic
// color usage (destination badges, category icons, map pins) automatically
// re-skins when the active theme changes the underlying custom property.
const colorVar = (key) => `var(--${key})`;

// Dos temas: mismo layout y mismos componentes, solo cambian los valores de
// las variables CSS (colores + tipografías). Añadir un tercer tema = añadir
// una entrada más aquí, nada más.
const THEMES = {
  default: {
    label: 'Clásico',
    ink: '#1C2541', paper: '#FAF6EE', paperDim: '#F1EAD9',
    stamp: '#E4572E', gold: '#D9A441', sky: '#3B6EA5', sage: '#3E7C59',
    inkRgb: '28,37,65', paperRgb: '250,246,238', stampRgb: '228,87,46',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontBody: "'Manrope', sans-serif",
  },
  otaku: {
    label: 'Otaku mode',
    ink: '#241B4D', paper: '#FFF3FA', paperDim: '#F5E3FF',
    stamp: '#FF2D95', gold: '#F2A900', sky: '#0091D9', sage: '#00A06B',
    inkRgb: '36,27,77', paperRgb: '255,243,250', stampRgb: '255,45,149',
    fontDisplay: "'M PLUS Rounded 1c', sans-serif",
    fontBody: "'M PLUS Rounded 1c', sans-serif",
  },
};

const TABS = [
  { key: 'resumen', label: 'Resumen', icon: Home },
  { key: 'itinerario', label: 'Itinerario', icon: Calendar },
  { key: 'mapa', label: 'Mapa', icon: Map },
  { key: 'lugares', label: 'Lugares', icon: Compass },
  { key: 'compras', label: 'Compras', icon: ShoppingBag },
  { key: 'notas', label: 'Notas', icon: StickyNote },
];

const ENTITY_KEY = {
  destination: 'destinations', stay: 'stays', transport: 'transports',
  place: 'places', activity: 'activities', note: 'notes', shopping: 'shopping',
};

const TRANSPORT_TYPES = {
  flight: { label: 'Vuelo', icon: Plane },
  train: { label: 'Tren', icon: TrainFront },
  bus: { label: 'Autobús', icon: Bus },
  car: { label: 'Auto', icon: Car },
  ferry: { label: 'Ferry', icon: Ship },
};

const STAY_TYPES = { hotel: 'Hotel', hostel: 'Hostal', airbnb: 'Airbnb / Apto', other: 'Otro' };

const PLACE_CATEGORIES = {
  comida: { label: 'Comida', icon: Utensils, color: 'stamp' },
  compras: { label: 'Compras', icon: ShoppingBag, color: 'gold' },
  cultura: { label: 'Cultura', icon: Landmark, color: 'sky' },
  noche: { label: 'Vida nocturna', icon: Music, color: 'ink' },
  naturaleza: { label: 'Naturaleza', icon: Trees, color: 'sage' },
  entretenimiento: { label: 'Entretenimiento', icon: Sparkles, color: 'gold' },
  auto: { label: 'Motor', icon: Gauge, color: 'sky' },
  otro: { label: 'Otro', icon: MapPin, color: 'ink' },
};

/* ============================================================
   UTILIDADES
   ============================================================ */

let uidSeq = 1000;
const uid = (prefix = 'id') => `${prefix}-${uidSeq++}`;

const parseISO = (s) => new Date(s + 'T00:00:00');
const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDate = (iso, opts = { day: 'numeric', month: 'short' }) => parseISO(iso).toLocaleDateString('es-MX', opts);
const fmtDateFull = (iso) => cap(parseISO(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

function jitter(pos, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const dx = ((h % 9) - 4) * 1.3;
  const dy = (((h >> 4) % 9) - 4) * 1.3;
  return { x: Math.min(96, Math.max(4, pos.x + dx)), y: Math.min(96, Math.max(4, pos.y + dy)) };
}

// Agrupa alojamientos, transportes y actividades por día, e inserta
// "huecos" (días sin nada agendado) como conectores compactos en vez
// de secciones vacías — encaja con un ritmo de viaje flexible.
function buildTimelineEntries(data) {
  const dayMap = {};
  const ensure = (date) => {
    if (!dayMap[date]) dayMap[date] = { checkIns: [], checkOuts: [], transports: [], activities: [] };
    return dayMap[date];
  };
  data.stays.forEach((s) => { ensure(s.checkIn).checkIns.push(s); ensure(s.checkOut).checkOuts.push(s); });
  data.transports.forEach((t) => {
    ensure(t.depDate).transports.push({ ...t, role: 'dep' });
    if (t.arrDate !== t.depDate) ensure(t.arrDate).transports.push({ ...t, role: 'arr' });
  });
  data.activities.forEach((a) => { ensure(a.date).activities.push(a); });

  const activeDays = Object.keys(dayMap).sort();
  const sections = [];
  for (let i = 0; i < activeDays.length; i++) {
    const date = activeDays[i];
    sections.push({ type: 'day', date, ...dayMap[date] });
    const next = activeDays[i + 1];
    if (next) {
      const gap = diffDays(date, next) - 1;
      if (gap > 0) {
        const midDate = addDays(date, Math.ceil(gap / 2));
        const dest = data.destinations.find((d) => midDate >= d.startDate && midDate <= d.endDate);
        sections.push({ type: 'gap', from: date, to: next, nights: gap, destName: dest ? dest.name : null });
      }
    }
  }
  return sections;
}


/* ============================================================
   UI GENÉRICA REUTILIZABLE
   ============================================================ */

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink mb-1.5" style={{ opacity: 0.5 }}>{label}</p>
      {children}
    </div>
  );
}

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

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center" style={{ borderColor: 'rgba(var(--ink-rgb),0.18)' }}>
      <Icon size={22} className="mx-auto text-ink" style={{ opacity: 0.35 }} />
      <p className="font-display font-semibold text-ink text-sm mt-2">{title}</p>
      {subtitle && <p className="text-xs text-ink mt-1" style={{ opacity: 0.5 }}>{subtitle}</p>}
    </div>
  );
}

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

/* ============================================================
   FORMULARIOS (uno por tipo de entidad)
   ============================================================ */

function TripForm({ initial, onSubmit }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Nombre del viaje"><input className="field-input" value={v.name} onChange={set('name')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha de inicio"><input type="date" className="field-input" value={v.startDate} onChange={set('startDate')} /></Field>
        <Field label="Fecha de fin"><input type="date" className="field-input" value={v.endDate} onChange={set('endDate')} /></Field>
      </div>
      <FormActions mode="edit" onSave={() => onSubmit(v)} disabled={!v.name} />
    </div>
  );
}

function DestinationForm({ initial, mode, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Nombre del destino"><input className="field-input" value={v.name} onChange={set('name')} placeholder="Ej. Kioto" /></Field>
      <Field label="Región / país"><input className="field-input" value={v.region} onChange={set('region')} placeholder="Ej. Kansai, Japón" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Llegada"><input type="date" className="field-input" value={v.startDate} onChange={set('startDate')} /></Field>
        <Field label="Salida"><input type="date" className="field-input" value={v.endDate} onChange={set('endDate')} /></Field>
      </div>
      <Field label="Color">
        <div className="flex gap-2">
          {['sky', 'gold', 'sage'].map((c) => (
            <button key={c} type="button" onClick={() => setV((s) => ({ ...s, color: c }))}
              className="w-8 h-8 rounded-full" style={{ backgroundColor: colorVar(c), border: v.color === c ? '2.5px solid var(--ink)' : '2.5px solid transparent' }} />
          ))}
        </div>
      </Field>
      <Field label="Notas"><textarea className="field-textarea" value={v.note} onChange={set('note')} placeholder="Detalles, ideas, recordatorios..." /></Field>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.name} />
    </div>
  );
}

function StayForm({ initial, mode, destinations, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Destino">
        <select className="field-select" value={v.destId} onChange={set('destId')}>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Nombre del alojamiento"><input className="field-input" value={v.name} onChange={set('name')} placeholder="Ej. Namba Backpackers" /></Field>
      <Field label="Tipo">
        <select className="field-select" value={v.type} onChange={set('type')}>
          {Object.entries(STAY_TYPES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Check-in"><input type="date" className="field-input" value={v.checkIn} onChange={set('checkIn')} /></Field>
        <Field label="Check-out"><input type="date" className="field-input" value={v.checkOut} onChange={set('checkOut')} /></Field>
      </div>
      <Field label="Dirección"><input className="field-input" value={v.address} onChange={set('address')} /></Field>
      <Field label="Notas"><textarea className="field-textarea" value={v.note} onChange={set('note')} /></Field>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.name || !v.destId} />
    </div>
  );
}

function TransportForm({ initial, mode, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Tipo">
        <select className="field-select" value={v.type} onChange={set('type')}>
          {Object.entries(TRANSPORT_TYPES).map(([k, cfg]) => <option key={k} value={k}>{cfg.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Origen"><input className="field-input" value={v.from} onChange={set('from')} /></Field>
        <Field label="Destino"><input className="field-input" value={v.to} onChange={set('to')} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha salida"><input type="date" className="field-input" value={v.depDate} onChange={set('depDate')} /></Field>
        <Field label="Hora salida"><input type="time" className="field-input" value={v.depTime} onChange={set('depTime')} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha llegada"><input type="date" className="field-input" value={v.arrDate} onChange={set('arrDate')} /></Field>
        <Field label="Hora llegada"><input type="time" className="field-input" value={v.arrTime} onChange={set('arrTime')} /></Field>
      </div>
      <Field label="Aerolínea / operador"><input className="field-input" value={v.carrier} onChange={set('carrier')} /></Field>
      <Field label="Notas"><textarea className="field-textarea" value={v.note} onChange={set('note')} /></Field>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.from || !v.to} />
    </div>
  );
}

function PlaceForm({ initial, mode, destinations, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Destino">
        <select className="field-select" value={v.destId} onChange={set('destId')}>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Nombre del lugar"><input className="field-input" value={v.name} onChange={set('name')} placeholder="Ej. Akihabara" /></Field>
      <Field label="Categoría">
        <select className="field-select" value={v.category} onChange={set('category')}>
          {Object.entries(PLACE_CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Notas"><textarea className="field-textarea" value={v.note} onChange={set('note')} /></Field>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={v.visited} onChange={(e) => setV((s) => ({ ...s, visited: e.target.checked }))} />
        <span className="text-sm text-ink">Ya lo visité</span>
      </label>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.name || !v.destId} />
    </div>
  );
}

function ActivityForm({ initial, mode, destinations, places, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const destPlaces = places.filter((p) => p.destId === v.destId);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha"><input type="date" className="field-input" value={v.date} onChange={set('date')} /></Field>
        <Field label="Hora"><input type="time" className="field-input" value={v.time} onChange={set('time')} /></Field>
      </div>
      <Field label="Título"><input className="field-input" value={v.title} onChange={set('title')} placeholder="Ej. Cena en izakaya" /></Field>
      <Field label="Destino">
        <select className="field-select" value={v.destId} onChange={set('destId')}>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Categoría">
        <select className="field-select" value={v.category} onChange={set('category')}>
          {Object.entries(PLACE_CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
        </select>
      </Field>
      {destPlaces.length > 0 && (
        <Field label="Lugar relacionado (opcional)">
          <select className="field-select" value={v.placeId || ''} onChange={set('placeId')}>
            <option value="">Ninguno</option>
            {destPlaces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Notas"><textarea className="field-textarea" value={v.note} onChange={set('note')} /></Field>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.title || !v.date} />
    </div>
  );
}

function NoteForm({ initial, mode, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Título"><input className="field-input" value={v.title} onChange={set('title')} /></Field>
      <Field label="Contenido"><textarea className="field-textarea" value={v.content} onChange={set('content')} style={{ minHeight: '8rem' }} /></Field>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.title} />
    </div>
  );
}

function ShoppingForm({ initial, mode, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Artículo"><input className="field-input" value={v.name} onChange={set('name')} placeholder="Ej. Manga de Chainsaw Man" /></Field>
      <Field label="Zona / dónde conseguirlo"><input className="field-input" value={v.zone} onChange={set('zone')} placeholder="Ej. Akihabara, Book-Off, online..." /></Field>
      <Field label="Resumen"><textarea className="field-textarea" value={v.summary} onChange={set('summary')} placeholder="Detalles, edición, tallas, qué buscar..." /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio aprox. (¥)"><input type="number" inputMode="decimal" className="field-input" value={v.estPrice} onChange={set('estPrice')} placeholder="0" /></Field>
        <Field label="Precio real (¥)"><input type="number" inputMode="decimal" className="field-input" value={v.actualPrice} onChange={set('actualPrice')} placeholder="0" /></Field>
      </div>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={v.acquired} onChange={(e) => setV((s) => ({ ...s, acquired: e.target.checked }))} />
        <span className="text-sm text-ink">Ya lo conseguí</span>
      </label>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.name} />
    </div>
  );
}

const SHEET_TITLES = {
  trip: () => 'Editar viaje',
  destination: (m) => (m === 'add' ? 'Nuevo destino' : 'Editar destino'),
  stay: (m) => (m === 'add' ? 'Nuevo alojamiento' : 'Editar alojamiento'),
  transport: (m) => (m === 'add' ? 'Nuevo transporte' : 'Editar transporte'),
  place: (m) => (m === 'add' ? 'Nuevo lugar' : 'Editar lugar'),
  activity: (m) => (m === 'add' ? 'Nueva actividad' : 'Editar actividad'),
  note: (m) => (m === 'add' ? 'Nueva nota' : 'Editar nota'),
  shopping: (m) => (m === 'add' ? 'Nuevo artículo' : 'Editar artículo'),
};

function SheetRouter({ sheet, onClose, onSave, onDeleteEntity, destinations, places }) {
  if (!sheet) return null;
  const title = SHEET_TITLES[sheet.type](sheet.mode);
  const common = {
    initial: sheet.initial,
    mode: sheet.mode,
    onSubmit: onSave,
    onDelete: sheet.mode === 'edit' ? () => onDeleteEntity(sheet.type, sheet.initial.id) : undefined,
  };
  return (
    <Sheet open title={title} onClose={onClose}>
      {sheet.type === 'trip' && <TripForm {...common} />}
      {sheet.type === 'destination' && <DestinationForm {...common} />}
      {sheet.type === 'stay' && <StayForm {...common} destinations={destinations} />}
      {sheet.type === 'transport' && <TransportForm {...common} />}
      {sheet.type === 'place' && <PlaceForm {...common} destinations={destinations} />}
      {sheet.type === 'activity' && <ActivityForm {...common} destinations={destinations} places={places} />}
      {sheet.type === 'note' && <NoteForm {...common} />}
      {sheet.type === 'shopping' && <ShoppingForm {...common} />}
    </Sheet>
  );
}

/* ============================================================
   TARJETAS / FILAS
   ============================================================ */

function HeroCard({ trip, onEdit }) {
  const days = diffDays(trip.startDate, trip.endDate) + 1;
  const todayIso = toISO(new Date());
  let status;
  if (todayIso < trip.startDate) status = `Faltan ${diffDays(todayIso, trip.startDate)} días`;
  else if (todayIso > trip.endDate) status = 'Viaje finalizado';
  else status = `Día ${diffDays(trip.startDate, todayIso) + 1} de ${days}`;

  return (
    <div className="rounded-3xl bg-ink p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-paper" style={{ opacity: 0.55 }}>Trip Planner</p>
          <h1 className="font-display text-2xl font-bold leading-tight mt-1 truncate text-paper">{trip.name}</h1>
          <p className="font-mono text-xs mt-1 text-paper" style={{ opacity: 0.7 }}>{fmtDate(trip.startDate)} — {fmtDate(trip.endDate)}</p>
        </div>
        <button onClick={onEdit} className="shrink-0 p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--paper-rgb),0.14)' }} aria-label="Editar viaje">
          <Pencil size={14} className="text-paper" />
        </button>
      </div>
      <div className="flex items-center gap-2 my-4">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(var(--paper-rgb),0.4)' }} />
        <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--paper-rgb),0.3)' }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(var(--paper-rgb),0.4)' }} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-paper" style={{ opacity: 0.55 }}>Duración</p>
          <p className="font-display font-semibold text-paper">{days} días</p>
        </div>
        <ArrowRight size={16} className="text-paper" style={{ opacity: 0.4 }} />
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-wide text-paper" style={{ opacity: 0.55 }}>Estado</p>
          <p className="font-display font-semibold text-paper">{status}</p>
        </div>
      </div>
    </div>
  );
}

function StatsRow({ data }) {
  const days = diffDays(data.trip.startDate, data.trip.endDate) + 1;
  const stats = [
    { label: 'Días', value: days },
    { label: 'Destinos', value: data.destinations.length },
    { label: 'Estancias', value: data.stays.length },
    { label: 'Traslados', value: data.transports.length },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl bg-white border p-2.5 text-center" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">{s.value}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function DestinationRow({ d, isFirst, isLast, onEdit, onDelete, onMove }) {
  return (
    <div className="rounded-2xl p-3.5 bg-white border flex items-center gap-3" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: colorVar(d.color) }}>
        <MapPin size={16} className="text-paper" />
      </span>
      <button onClick={onEdit} className="flex-1 min-w-0 text-left">
        <p className="font-display font-semibold text-ink text-sm truncate">{d.name}</p>
        <p className="font-mono text-xs text-ink truncate" style={{ opacity: 0.55 }}>{fmtDate(d.startDate)} – {fmtDate(d.endDate)} · {d.region}</p>
      </button>
      <div className="flex flex-col items-center shrink-0">
        <button disabled={isFirst} onClick={() => onMove(-1)} className="p-0.5 text-ink" style={{ opacity: isFirst ? 0.2 : 0.5 }}><ChevronUp size={14} /></button>
        <button disabled={isLast} onClick={() => onMove(1)} className="p-0.5 text-ink" style={{ opacity: isLast ? 0.2 : 0.5 }}><ChevronDown size={14} /></button>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }}><Pencil size={14} /></button>
        <DeleteButton onDelete={onDelete} />
      </div>
    </div>
  );
}

function StayRow({ s, destName, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl p-3.5 bg-white border flex items-center gap-3" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gold"><BedDouble size={16} className="text-paper" /></span>
      <button onClick={onEdit} className="flex-1 min-w-0 text-left">
        <p className="font-display font-semibold text-ink text-sm truncate">{s.name}</p>
        <p className="font-mono text-xs text-ink truncate" style={{ opacity: 0.55 }}>{fmtDate(s.checkIn)} – {fmtDate(s.checkOut)} · {destName}</p>
      </button>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }}><Pencil size={14} /></button>
        <DeleteButton onDelete={onDelete} />
      </div>
    </div>
  );
}

function StayMarker({ s, role, onEdit }) {
  return (
    <button onClick={onEdit} className="w-full flex items-center gap-3 rounded-2xl p-3 bg-paper-dim border text-left" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
      <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gold"><BedDouble size={14} className="text-paper" /></span>
      <div className="min-w-0">
        <p className="font-display font-semibold text-ink text-sm truncate">{role === 'in' ? 'Check-in' : 'Check-out'} · {s.name}</p>
        <p className="font-mono text-xs text-ink truncate" style={{ opacity: 0.55 }}>{s.address}</p>
      </div>
    </button>
  );
}

function TransportTicket({ t, role, onEdit, onDelete }) {
  const cfg = TRANSPORT_TYPES[t.type];
  const Icon = cfg.icon;
  return (
    <div className="rounded-2xl p-4 bg-paper-dim border" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-full flex items-center justify-center bg-sky shrink-0"><Icon size={14} className="text-paper" /></span>
          <span className="font-mono text-xs uppercase tracking-wide text-ink truncate" style={{ opacity: 0.55 }}>{cfg.label} · {t.carrier}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {role && (
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-full bg-ink text-paper">{role === 'dep' ? 'Salida' : 'Llegada'}</span>
          )}
          <button onClick={onEdit} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }}><Pencil size={13} /></button>
          <DeleteButton onDelete={onDelete} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-semibold text-ink text-sm truncate">{t.from}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.55 }}>{t.depTime}</p>
        </div>
        <div className="flex-1 flex items-center px-1">
          <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--ink-rgb),0.25)' }} />
          <Icon size={12} className="mx-1 text-ink shrink-0" style={{ opacity: 0.4 }} />
          <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--ink-rgb),0.25)' }} />
        </div>
        <div className="text-right min-w-0">
          <p className="font-display font-semibold text-ink text-sm truncate">{t.to}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.55 }}>{t.arrTime}</p>
        </div>
      </div>
      {t.note && <p className="text-xs text-ink mt-2" style={{ opacity: 0.6 }}>{t.note}</p>}
    </div>
  );
}

function ActivityCard({ a, onEdit, onDelete, onShift }) {
  const cat = PLACE_CATEGORIES[a.category] || PLACE_CATEGORIES.otro;
  const Icon = cat.icon;
  return (
    <div className="rounded-2xl p-3.5 bg-white border flex gap-3" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: colorVar(cat.color) }}>
        <Icon size={15} className="text-paper" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onEdit} className="min-w-0 text-left">
            <p className="font-display font-semibold text-ink text-sm">{a.title}</p>
            <p className="font-mono text-xs text-ink" style={{ opacity: 0.55 }}>{a.time || 'Sin hora'}</p>
          </button>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => onShift(-1)} className="p-1 rounded text-ink" style={{ opacity: 0.4 }} aria-label="Mover un día antes"><ChevronLeft size={14} /></button>
            <button onClick={() => onShift(1)} className="p-1 rounded text-ink" style={{ opacity: 0.4 }} aria-label="Mover un día después"><ChevronRight size={14} /></button>
            <button onClick={onEdit} className="p-1 rounded text-ink" style={{ opacity: 0.5 }}><Pencil size={13} /></button>
            <DeleteButton onDelete={onDelete} />
          </div>
        </div>
        {a.note && <p className="text-xs text-ink mt-1" style={{ opacity: 0.6 }}>{a.note}</p>}
      </div>
    </div>
  );
}

function PlaceRow({ p, onEdit, onDelete, onToggle }) {
  const cat = PLACE_CATEGORIES[p.category] || PLACE_CATEGORIES.otro;
  const Icon = cat.icon;
  return (
    <div className="rounded-2xl p-3.5 bg-white border flex items-center gap-3" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)', opacity: p.visited ? 0.6 : 1 }}>
      <button onClick={onToggle} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: colorVar(cat.color) }} aria-label="Marcar como visitado">
        {p.visited ? <CheckCircle2 size={16} className="text-paper" /> : <Icon size={15} className="text-paper" />}
      </button>
      <button onClick={onEdit} className="flex-1 min-w-0 text-left">
        <p className="font-display font-semibold text-ink text-sm truncate" style={{ textDecoration: p.visited ? 'line-through' : 'none' }}>{p.name}</p>
        <p className="text-xs text-ink truncate" style={{ opacity: 0.55 }}>{cat.label}{p.note ? ` · ${p.note}` : ''}</p>
      </button>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }}><Pencil size={14} /></button>
        <DeleteButton onDelete={onDelete} />
      </div>
    </div>
  );
}

function ShoppingRow({ item, onEdit, onDelete, onToggle }) {
  const est = Number(item.estPrice) || 0;
  const hasActual = item.actualPrice !== '' && item.actualPrice != null;
  const actual = hasActual ? Number(item.actualPrice) : null;
  const diff = actual != null ? actual - est : null;
  return (
    <div className="rounded-2xl p-3.5 bg-white border flex gap-3" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)', opacity: item.acquired ? 0.65 : 1 }}>
      <button onClick={onToggle} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gold" aria-label="Marcar como conseguido">
        {item.acquired ? <CheckCircle2 size={16} className="text-paper" /> : <ShoppingBag size={15} className="text-paper" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onEdit} className="min-w-0 text-left">
            <p className="font-display font-semibold text-ink text-sm" style={{ textDecoration: item.acquired ? 'line-through' : 'none' }}>{item.name}</p>
            {item.zone && <p className="font-mono text-xs text-ink truncate" style={{ opacity: 0.55 }}>{item.zone}</p>}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-1 rounded text-ink" style={{ opacity: 0.5 }}><Pencil size={13} /></button>
            <DeleteButton onDelete={onDelete} />
          </div>
        </div>
        {item.summary && <p className="text-xs text-ink mt-1" style={{ opacity: 0.6 }}>{item.summary}</p>}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Aprox: ¥{est.toLocaleString('es-MX')}</span>
          {hasActual && <span className="font-mono text-xs text-ink" style={{ opacity: 0.75 }}>Pagué: ¥{actual.toLocaleString('es-MX')}</span>}
          {diff != null && diff !== 0 && (
            <span className="font-mono text-xs font-semibold" style={{ color: diff > 0 ? 'var(--stamp)' : 'var(--sage)' }}>
              {diff > 0 ? `+¥${diff.toLocaleString('es-MX')}` : `-¥${Math.abs(diff).toLocaleString('es-MX')}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GapFiller({ gap }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--ink-rgb),0.15)' }} />
      <p className="font-mono text-xs text-ink shrink-0" style={{ opacity: 0.5 }}>
        {gap.nights} {gap.nights === 1 ? 'noche libre' : 'noches libres'}{gap.destName ? ` en ${gap.destName}` : ''}
      </p>
      <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--ink-rgb),0.15)' }} />
    </div>
  );
}

function DayNav({ days }) {
  if (days.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3 sticky top-0 bg-paper z-10 border-b" style={{ borderColor: 'rgba(var(--ink-rgb),0.08)' }}>
      {days.map((date) => (
        <button key={date} onClick={() => { const el = document.getElementById('day-' + date); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
          className="flex flex-col items-center justify-center shrink-0 rounded-2xl px-3 py-1.5 bg-white" style={{ border: '1.5px solid rgba(var(--ink-rgb),0.12)' }}>
          <span className="font-mono text-xs font-semibold text-ink">{fmtDate(date, { day: 'numeric', month: 'short' })}</span>
        </button>
      ))}
    </div>
  );
}

function DaySection({ entry, data, onEdit, onDelete, onShiftDay, onAddActivity }) {
  const dest = data.destinations.find((d) => d.startDate <= entry.date && entry.date <= d.endDate);
  const dayIndex = diffDays(data.trip.startDate, entry.date) + 1;
  const sortedActivities = [...entry.activities].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  return (
    <div id={'day-' + entry.date} className="px-4 pt-5">
      <div className="mb-3">
        <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Día {dayIndex}{dest ? ` · ${dest.name}` : ''}</p>
        <h3 className="font-display text-lg font-semibold text-ink">{fmtDateFull(entry.date)}</h3>
      </div>
      <div className="space-y-3">
        {entry.transports.filter((t) => t.role === 'dep').map((t) => (
          <TransportTicket key={t.id + '-dep'} t={t} role="dep" onEdit={() => onEdit('transport', t)} onDelete={() => onDelete('transports', t.id)} />
        ))}
        {entry.transports.filter((t) => t.role === 'arr').map((t) => (
          <TransportTicket key={t.id + '-arr'} t={t} role="arr" onEdit={() => onEdit('transport', t)} onDelete={() => onDelete('transports', t.id)} />
        ))}
        {entry.checkIns.map((s) => <StayMarker key={s.id + '-in'} s={s} role="in" onEdit={() => onEdit('stay', s)} />)}
        {entry.checkOuts.map((s) => <StayMarker key={s.id + '-out'} s={s} role="out" onEdit={() => onEdit('stay', s)} />)}
        {sortedActivities.map((a) => (
          <ActivityCard key={a.id} a={a} onEdit={() => onEdit('activity', a)} onDelete={() => onDelete('activities', a.id)} onShift={(d) => onShiftDay(a.id, d)} />
        ))}
        <button onClick={() => onAddActivity(entry.date)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed text-xs font-semibold text-ink"
          style={{ borderColor: 'rgba(var(--ink-rgb),0.2)', opacity: 0.7 }}>
          <Plus size={14} /> Añadir actividad
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   VISTAS PRINCIPALES
   ============================================================ */

function ResumenView({ data, destinations, openAdd, openEdit, onDelete, onMoveDestination }) {
  const sortedTransports = [...data.transports].sort((a, b) => a.depDate.localeCompare(b.depDate));
  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
      <HeroCard trip={data.trip} onEdit={() => openEdit('trip', data.trip)} />
      <StatsRow data={data} />

      <div>
        <SectionHeader title="Destinos" onAdd={() => openAdd('destination', { name: '', region: '', startDate: data.trip.startDate, endDate: data.trip.endDate, color: 'sky', order: destinations.length + 1, mapPos: { x: 50, y: 50 }, note: '' })} />
        <div className="space-y-2.5">
          {destinations.length === 0 && <EmptyState icon={MapPin} title="Aún no hay destinos" subtitle="Añade el primero para empezar a armar tu ruta" />}
          {destinations.map((d, i) => (
            <DestinationRow key={d.id} d={d} isFirst={i === 0} isLast={i === destinations.length - 1}
              onEdit={() => openEdit('destination', d)} onDelete={() => onDelete('destinations', d.id)} onMove={(dir) => onMoveDestination(d.id, dir)} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Alojamientos" onAdd={() => openAdd('stay', { destId: destinations[0]?.id || '', name: '', type: 'hostel', checkIn: data.trip.startDate, checkOut: data.trip.endDate, address: '', note: '' })} />
        <div className="space-y-2.5">
          {data.stays.length === 0 && <EmptyState icon={BedDouble} title="Sin alojamientos" subtitle="Añade dónde te vas a quedar en cada destino" />}
          {data.stays.map((s) => (
            <StayRow key={s.id} s={s} destName={data.destinations.find((d) => d.id === s.destId)?.name}
              onEdit={() => openEdit('stay', s)} onDelete={() => onDelete('stays', s.id)} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Transportes" onAdd={() => openAdd('transport', { type: 'flight', from: '', to: '', depDate: data.trip.startDate, depTime: '', arrDate: data.trip.startDate, arrTime: '', carrier: '', note: '' })} />
        <div className="space-y-2.5">
          {data.transports.length === 0 && <EmptyState icon={Route} title="Sin traslados" subtitle="Añade vuelos, trenes u otros trayectos entre destinos" />}
          {sortedTransports.map((t) => (
            <TransportTicket key={t.id} t={t} role={null} onEdit={() => openEdit('transport', t)} onDelete={() => onDelete('transports', t.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ItinerarioView({ data, sections, openAdd, openEdit, onDelete, onShiftActivityDay }) {
  const dayDates = sections.filter((s) => s.type === 'day').map((s) => s.date);
  return (
    <div className="pb-6">
      <DayNav days={dayDates} />
      {sections.length === 0 && (
        <div className="px-4 pt-6 space-y-3">
          <EmptyState icon={Calendar} title="Sin itinerario todavía" subtitle="Añade tu primera actividad, alojamiento o transporte" />
          <button onClick={() => openAdd('activity', { date: data.trip.startDate, time: '', title: '', destId: data.destinations[0]?.id || '', category: 'otro', placeId: '', note: '' })}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed text-sm font-semibold text-ink" style={{ borderColor: 'rgba(var(--ink-rgb),0.2)', opacity: 0.7 }}>
            <Plus size={15} /> Añadir actividad
          </button>
        </div>
      )}
      {sections.map((s, i) => (
        s.type === 'day'
          ? <DaySection key={s.date} entry={s} data={data} onEdit={openEdit} onDelete={onDelete} onShiftDay={onShiftActivityDay}
              onAddActivity={(date) => openAdd('activity', { date, time: '', title: '', destId: data.destinations[0]?.id || '', category: 'otro', placeId: '', note: '' })} />
          : <GapFiller key={'gap-' + i} gap={s} />
      ))}
    </div>
  );
}

function MapaView({ data, destinations, openEdit }) {
  const [filter, setFilter] = useState('todos');

  const pins = useMemo(() => {
    let list = destinations.map((d) => ({ id: d.id, kind: 'destino', type: 'destination', name: d.name, sub: d.region, mapPos: d.mapPos, color: d.color, item: d }));
    if (filter !== 'destinos') {
      data.stays.forEach((s) => {
        const dest = data.destinations.find((x) => x.id === s.destId);
        if (dest) list.push({ id: s.id, kind: 'alojamiento', type: 'stay', name: s.name, sub: STAY_TYPES[s.type], mapPos: jitter(dest.mapPos, s.id), color: 'gold', item: s });
      });
      data.places.forEach((p) => {
        const cat = PLACE_CATEGORIES[p.category] || PLACE_CATEGORIES.otro;
        list.push({ id: p.id, kind: 'lugar', type: 'place', name: p.name, sub: cat.label, mapPos: p.mapPos, color: cat.color, item: p });
      });
    }
    return list;
  }, [data, destinations, filter]);

  return (
    <div className="pb-6">
      <div className="flex gap-2 px-4 pt-4 pb-3 overflow-x-auto scrollbar-none">
        {[['todos', 'Todo'], ['destinos', 'Destinos'], ['lugares', 'Lugares y hoteles']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      <div className="px-4">
        <div className="relative w-full rounded-3xl overflow-hidden bg-paper-dim border" style={{ paddingBottom: '120%', borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <polyline points={destinations.map((d) => `${d.mapPos.x},${d.mapPos.y}`).join(' ')} fill="none" strokeWidth="0.5" strokeDasharray="1.4 1.4" strokeOpacity="0.3" style={{ stroke: 'var(--ink)' }} />
          </svg>
          {pins.map((p) => (
            <button key={p.type + p.id} onClick={() => openEdit(p.type, p.item)} className="absolute flex flex-col items-center"
              style={{ left: p.mapPos.x + '%', top: p.mapPos.y + '%', transform: 'translate(-50%,-100%)' }}>
              <span className={'flex items-center justify-center rounded-full shadow-md ' + (p.kind === 'destino' ? 'w-7 h-7' : 'w-4 h-4')} style={{ backgroundColor: colorVar(p.color) }}>
                {p.kind === 'destino' && <MapPin size={13} style={{ color: 'var(--paper)' }} />}
              </span>
              {p.kind === 'destino' && (
                <span className="font-mono text-xs font-semibold text-ink mt-1 bg-paper px-1.5 py-0.5 rounded-full shadow-sm">{p.name}</span>
              )}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-center mt-2" style={{ opacity: 0.4, color: 'var(--ink)' }}>Vista previa · el mapa real se conectará más adelante</p>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {destinations.map((d) => {
          const items = pins.filter((p) => p.kind !== 'destino' && p.item.destId === d.id);
          return (
            <div key={d.id}>
              <h3 className="font-display font-bold text-ink text-sm flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorVar(d.color) }} />{d.name}
              </h3>
              <div className="space-y-2">
                {items.map((p) => (
                  <button key={p.type + p.id} onClick={() => openEdit(p.type, p.item)} className="w-full flex items-center gap-3 rounded-xl p-2.5 bg-white border text-left" style={{ borderColor: 'rgba(var(--ink-rgb),0.08)' }}>
                    <span className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: colorVar(p.color) }} />
                    <div className="min-w-0">
                      <p className="text-ink text-sm font-semibold truncate">{p.name}</p>
                      <p className="text-ink text-xs truncate" style={{ opacity: 0.5 }}>{p.sub}</p>
                    </div>
                  </button>
                ))}
                {items.length === 0 && <p className="text-xs text-ink" style={{ opacity: 0.4 }}>Sin lugares u hoteles guardados aún</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LugaresView({ data, destinations, openAdd, openEdit, onDelete, onToggleVisited }) {
  const [filter, setFilter] = useState('todos');
  const filtered = data.places.filter((p) => (filter === 'todos' ? true : filter === 'visitados' ? p.visited : !p.visited));

  return (
    <div className="pb-6">
      <div className="flex gap-2 px-4 pt-4 pb-1 overflow-x-auto scrollbar-none">
        {[['todos', 'Todos'], ['pendientes', 'Por visitar'], ['visitados', 'Visitados']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'active' : ''}`}>{label}</button>
        ))}
      </div>
      <div className="px-4 pt-3 space-y-6">
        {destinations.map((d) => {
          const items = filtered.filter((p) => p.destId === d.id);
          if (items.length === 0) return null;
          return (
            <div key={d.id}>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-display font-bold text-ink text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorVar(d.color) }} />{d.name}
                </h3>
                <button onClick={() => openAdd('place', { destId: d.id, name: '', category: 'otro', note: '', visited: false, mapPos: { ...d.mapPos } })} className="text-ink" style={{ opacity: 0.5 }}>
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {items.map((p) => <PlaceRow key={p.id} p={p} onEdit={() => openEdit('place', p)} onDelete={() => onDelete('places', p.id)} onToggle={() => onToggleVisited(p.id)} />)}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState icon={Compass} title="Nada por aquí" subtitle="Prueba otro filtro o añade un lugar nuevo" />}
        <button onClick={() => openAdd('place', { destId: destinations[0]?.id || '', name: '', category: 'otro', note: '', visited: false, mapPos: { x: 50, y: 50 } })}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed text-sm font-semibold text-ink" style={{ borderColor: 'rgba(var(--ink-rgb),0.2)', opacity: 0.7 }}>
          <Plus size={15} /> Añadir lugar
        </button>
      </div>
    </div>
  );
}

function ComprasView({ data, openAdd, openEdit, onDelete, onToggleAcquired }) {
  const [filter, setFilter] = useState('todos');
  const items = data.shopping.filter((i) => (filter === 'todos' ? true : filter === 'pendientes' ? !i.acquired : i.acquired));
  const acquiredCount = data.shopping.filter((i) => i.acquired).length;
  const estPending = data.shopping.filter((i) => !i.acquired).reduce((sum, i) => sum + (Number(i.estPrice) || 0), 0);
  const spent = data.shopping.filter((i) => i.acquired).reduce((sum, i) => sum + (Number(i.actualPrice) || 0), 0);

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <SectionHeader title="Lista de compras" onAdd={() => openAdd('shopping', { name: '', zone: '', summary: '', estPrice: '', actualPrice: '', acquired: false })} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white border p-2.5 text-center" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">{acquiredCount}/{data.shopping.length}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Conseguidos</p>
        </div>
        <div className="rounded-2xl bg-white border p-2.5 text-center" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">¥{estPending.toLocaleString('es-MX')}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Por gastar (aprox.)</p>
        </div>
        <div className="rounded-2xl bg-white border p-2.5 text-center" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">¥{spent.toLocaleString('es-MX')}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Gastado real</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {[['todos', 'Todos'], ['pendientes', 'Pendientes'], ['conseguidos', 'Conseguidos']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      <div className="space-y-2.5">
        {items.length === 0 && <EmptyState icon={ShoppingBag} title="Nada por aquí" subtitle="Prueba otro filtro o añade un artículo" />}
        {items.map((i) => (
          <ShoppingRow key={i.id} item={i} onEdit={() => openEdit('shopping', i)} onDelete={() => onDelete('shopping', i.id)} onToggle={() => onToggleAcquired(i.id)} />
        ))}
      </div>
    </div>
  );
}

function NotasView({ data, openAdd, openEdit, onDelete }) {
  return (
    <div className="px-4 pt-4 pb-6 space-y-3">
      <SectionHeader title="Notas" onAdd={() => openAdd('note', { title: '', content: '' })} />
      {data.notes.length === 0 && <EmptyState icon={StickyNote} title="Sin notas todavía" subtitle="Guarda ideas, recordatorios o cosas que no quieres olvidar" />}
      {data.notes.map((n) => (
        <div key={n.id} className="rounded-2xl p-4 bg-white border" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => openEdit('note', n)} className="text-left">
              <h3 className="font-display font-semibold text-ink text-sm">{n.title}</h3>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => openEdit('note', n)} className="p-1 rounded text-ink" style={{ opacity: 0.5 }}><Pencil size={13} /></button>
              <DeleteButton onDelete={() => onDelete('notes', n.id)} />
            </div>
          </div>
          <p className="text-sm text-ink mt-1.5 leading-relaxed" style={{ opacity: 0.7 }}>{n.content}</p>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   NAVEGACIÓN
   ============================================================ */

function ThemeToggle({ theme, setTheme }) {
  const isOtaku = theme === 'otaku';
  return (
    <button
      onClick={() => setTheme(isOtaku ? 'default' : 'otaku')}
      className="flex items-center gap-1.5 font-mono text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
      style={{
        backgroundColor: isOtaku ? 'var(--stamp)' : 'rgba(var(--ink-rgb),0.08)',
        color: isOtaku ? 'var(--paper)' : 'var(--ink)',
      }}
      aria-pressed={isOtaku}
      aria-label="Cambiar tema"
    >
      <Sparkles size={13} />
      Otaku mode
    </button>
  );
}

function TopBar({ tab, theme, setTheme }) {
  const current = TABS.find((t) => t.key === tab);
  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(var(--ink-rgb),0.08)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-ink shrink-0"><Compass size={16} className="text-paper" /></span>
        <div className="min-w-0">
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.45 }}>Trip Planner</p>
          <p className="font-display font-bold text-ink text-sm leading-none mt-0.5 truncate">{current.label}</p>
        </div>
      </div>
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  );
}

function BottomNav({ tab, setTab }) {
  return (
    <nav className="flex items-stretch border-t bg-paper py-1.5" style={{ borderColor: 'rgba(var(--ink-rgb),0.1)' }}>
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.key;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-0.5 py-0.5 rounded-xl">
            <Icon size={19} style={{ color: active ? 'var(--stamp)' : 'var(--ink)', opacity: active ? 1 : 0.45 }} />
            <span className="font-mono w-full text-center truncate" style={{ fontSize: '10px', color: active ? 'var(--stamp)' : 'var(--ink)', opacity: active ? 1 : 0.45 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ============================================================
   APP PRINCIPAL
   ============================================================ */

export default function TripPlannerApp() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('resumen');
  const [sheet, setSheet] = useState(null);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    api.getState().then(setData).catch((e) => console.error('No se pudo cargar el viaje desde el servidor', e));
  }, []);

  // --- Acciones genéricas (punto de extensión: persistencia / agente IA) ---
  // Cada función actualiza el estado local al toque (para que la UI se
  // sienta instantánea) y en paralelo persiste el cambio vía la API,
  // que en este deploy corre en un Worker de Cloudflare sobre D1.
  const add = (key, values) => {
    const item = { ...values, id: uid(key) };
    setData((d) => ({ ...d, [key]: [...d[key], item] }));
    api.create(key, item).catch((e) => console.error(`No se pudo guardar en ${key}`, e));
  };
  const update = (key, id, values) => {
    setData((d) => ({ ...d, [key]: d[key].map((it) => (it.id === id ? { ...it, ...values } : it)) }));
    api.update(key, id, values).catch((e) => console.error(`No se pudo actualizar ${key}/${id}`, e));
  };
  const remove = (key, id) => {
    setData((d) => ({ ...d, [key]: d[key].filter((it) => it.id !== id) }));
    api.remove(key, id).catch((e) => console.error(`No se pudo eliminar ${key}/${id}`, e));
  };
  const updateTrip = (values) => {
    setData((d) => ({ ...d, trip: { ...d.trip, ...values } }));
    api.updateTrip(values).catch((e) => console.error('No se pudo actualizar el viaje', e));
  };

  const moveDestination = (id, dir) => {
    const list = [...data.destinations].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((x) => x.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx], b = list[swapIdx];
    setData((d) => ({
      ...d,
      destinations: d.destinations.map((x) => (x.id === a.id ? { ...x, order: b.order } : x.id === b.id ? { ...x, order: a.order } : x)),
    }));
    api.update('destinations', a.id, { order: b.order }).catch((e) => console.error(e));
    api.update('destinations', b.id, { order: a.order }).catch((e) => console.error(e));
  };

  const shiftActivityDay = (id, delta) => {
    const current = data.activities.find((a) => a.id === id);
    if (!current) return;
    const date = addDays(current.date, delta);
    setData((d) => ({ ...d, activities: d.activities.map((a) => (a.id === id ? { ...a, date } : a)) }));
    api.update('activities', id, { date }).catch((e) => console.error(e));
  };
  const toggleVisited = (id) => {
    const current = data.places.find((p) => p.id === id);
    if (!current) return;
    const visited = !current.visited;
    setData((d) => ({ ...d, places: d.places.map((p) => (p.id === id ? { ...p, visited } : p)) }));
    api.update('places', id, { visited }).catch((e) => console.error(e));
  };
  const toggleAcquired = (id) => {
    const current = data.shopping.find((i) => i.id === id);
    if (!current) return;
    const acquired = !current.acquired;
    setData((d) => ({ ...d, shopping: d.shopping.map((i) => (i.id === id ? { ...i, acquired } : i)) }));
    api.update('shopping', id, { acquired }).catch((e) => console.error(e));
  };

  const closeSheet = () => setSheet(null);
  const openAdd = (type, defaults) => setSheet({ type, mode: 'add', initial: defaults });
  const openEdit = (type, item) => setSheet({ type, mode: 'edit', initial: item });

  const handleSave = (values) => {
    if (sheet.type === 'trip') updateTrip(values);
    else if (sheet.mode === 'add') add(ENTITY_KEY[sheet.type], values);
    else update(ENTITY_KEY[sheet.type], sheet.initial.id, values);
    closeSheet();
  };
  const handleDeleteEntity = (type, id) => { remove(ENTITY_KEY[type], id); closeSheet(); };

  const destinationsSorted = useMemo(() => (data ? [...data.destinations].sort((a, b) => a.order - b.order) : []), [data]);
  const timelineSections = useMemo(() => (data ? buildTimelineEntries(data) : []), [data]);

  // Todo el theming pasa por variables CSS: cambiar de tema no toca ningún
  // componente, solo redefine estos valores en el elemento raíz y el resto
  // se resuelve por herencia (colorVar(), las clases .bg-ink/.text-stamp/etc,
  // y font-family: var(--font-display) ya definidos en GlobalStyle).
  const t = THEMES[theme];
  const themeVars = {
    '--ink': t.ink, '--paper': t.paper, '--paper-dim': t.paperDim,
    '--stamp': t.stamp, '--gold': t.gold, '--sky': t.sky, '--sage': t.sage,
    '--ink-rgb': t.inkRgb, '--paper-rgb': t.paperRgb, '--stamp-rgb': t.stampRgb,
    '--font-display': t.fontDisplay, '--font-body': t.fontBody,
  };
  const isOtaku = theme === 'otaku';

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ ...themeVars, backgroundColor: 'var(--ink)' }}>
        <GlobalStyle />
        <p className="font-mono text-sm" style={{ color: 'var(--paper)', opacity: 0.7 }}>Cargando viaje…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center sm:py-10 sm:px-4" style={{ ...themeVars, backgroundColor: 'var(--ink)' }}>
      <GlobalStyle />
      <div
        className="w-full sm:max-w-md bg-paper min-h-screen sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col"
        style={{
          fontFamily: 'var(--font-body)',
          backgroundImage: isOtaku ? 'radial-gradient(rgba(var(--ink-rgb),0.07) 1px, transparent 1.6px)' : 'none',
          backgroundSize: '16px 16px',
        }}
      >
        <TopBar tab={tab} theme={theme} setTheme={setTheme} />
        <main className="flex-1 overflow-y-auto">
          {tab === 'resumen' && (
            <ResumenView data={data} destinations={destinationsSorted} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onMoveDestination={moveDestination} />
          )}
          {tab === 'itinerario' && (
            <ItinerarioView data={data} sections={timelineSections} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onShiftActivityDay={shiftActivityDay} />
          )}
          {tab === 'mapa' && (
            <MapaView data={data} destinations={destinationsSorted} openEdit={openEdit} />
          )}
          {tab === 'lugares' && (
            <LugaresView data={data} destinations={destinationsSorted} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onToggleVisited={toggleVisited} />
          )}
          {tab === 'compras' && (
            <ComprasView data={data} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onToggleAcquired={toggleAcquired} />
          )}
          {tab === 'notas' && (
            <NotasView data={data} openAdd={openAdd} openEdit={openEdit} onDelete={remove} />
          )}
        </main>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
      <SheetRouter sheet={sheet} onClose={closeSheet} onSave={handleSave} onDeleteEntity={handleDeleteEntity} destinations={destinationsSorted} places={data.places} />
    </div>
  );
}
