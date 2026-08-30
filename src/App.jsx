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

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home, Calendar, Map, Compass, StickyNote, Plus, Pencil,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  MapPin, Route, BedDouble,
  ShoppingBag, Sparkles,
  CheckCircle2, ArrowRight,
  Clock, Ticket, Circle, Landmark,
} from 'lucide-react';
import { api } from './api';
import { SheetRouter } from './components/forms/SheetRouter';
import { ResponsiveAppShell } from './components/layout/ResponsiveAppShell';
import { DeleteButton } from './components/ui/DeleteButton';
import { EmptyState } from './components/ui/EmptyState';
import { ItemImage } from './components/ui/ItemImage';
import { SectionHeader } from './components/ui/SectionHeader';
import { colorVar, PLACE_CATEGORIES, STAY_TYPES, TRANSPORT_TYPES, EXPERIENCE_CATEGORIES } from './domain/tripConfig';

/* ============================================================
   ESTILOS GLOBALES (fuentes, colores, clases utilitarias)
   ============================================================ */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap');

      :root {
        /* Superficies (translúcidas = cristal sobre el fondo líquido) */
        --paper: rgba(255,255,255,0.08);
        --paper-dim: rgba(255,255,255,0.13);
        --ink: #0A0C1A;
        /* Texto */
        --text: #F4F6FF;
        --text-inverse: #FFFFFF;
        /* Acentos */
        --stamp: #FF4D9D;
        --gold: #FFC23E;
        --sky: #4DD8FF;
        --sage: #3ED598;
        /* Tintes: bordes blancos translúcidos sobre el cristal */
        --line-rgb: 255,255,255;
        --inverse-rgb: 255,255,255;
        --scrim-rgb: 6,8,20;
        --stamp-rgb: 255,77,157;
        /* Campos / chips */
        --field-bg: rgba(255,255,255,0.07);
        --field-text: #F4F6FF;
        --font-display: 'Space Grotesk', sans-serif;
        --font-body: 'Manrope', sans-serif;
      }
      * { box-sizing: border-box; }
      html, body { background: var(--ink); }

      /* Fondo líquido: malla de gradientes suaves y animados, en tonos
         profundos (violeta oscuro / índigo / azul noche) para que el cristal
         claro y el texto blanco resalten sin forzar la vista. */
      .liquid-bg {
        background-color: var(--ink);
        background-image:
          radial-gradient(at 18% 16%, rgba(76,72,220,0.36) 0%, transparent 52%),
          radial-gradient(at 84% 20%, rgba(160,40,150,0.24) 0%, transparent 55%),
          radial-gradient(at 66% 84%, rgba(26,86,150,0.3) 0%, transparent 55%),
          radial-gradient(at 12% 78%, rgba(110,70,160,0.2) 0%, transparent 48%);
        background-size: 220% 220%;
        animation: liquid-mesh 26s ease-in-out infinite alternate;
      }
      @keyframes liquid-mesh {
        0%   { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }

      /* Blobs decorativos que flotan detrás del cristal */
      .liquid-blob {
        position: absolute;
        border-radius: 9999px;
        filter: blur(80px);
        opacity: 0.42;
        pointer-events: none;
        animation: liquid-float 18s ease-in-out infinite alternate;
        will-change: transform;
      }
      @keyframes liquid-float {
        0%   { transform: translateY(0) scale(1); }
        100% { transform: translateY(-34px) scale(1.08); }
      }

      .font-display { font-family: var(--font-display); }
      .font-mono { font-family: 'IBM Plex Mono', monospace; }
      .font-body, body { font-family: 'Manrope', sans-serif; }

      /* Superficies de cristal: translúcidas con difuminado del fondo */
      .bg-paper {
        background-color: var(--paper);
        background-image: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 40%);
        -webkit-backdrop-filter: blur(22px) saturate(160%);
        backdrop-filter: blur(22px) saturate(160%);
      }
      .bg-paper-dim {
        background-color: var(--paper-dim);
        -webkit-backdrop-filter: blur(22px) saturate(160%);
        backdrop-filter: blur(22px) saturate(160%);
      }
      .bg-ink {
        background-color: var(--ink);
        -webkit-backdrop-filter: blur(28px) saturate(150%);
        backdrop-filter: blur(28px) saturate(150%);
      }
      .bg-stamp { background-color: var(--stamp); }
      .bg-gold { background-color: var(--gold); }
      .bg-sky { background-color: var(--sky); }
      .bg-sage { background-color: var(--sage); }
      .text-paper { color: var(--text-inverse); }
      .text-ink { color: var(--text); }
      .text-stamp { color: var(--stamp); }

      /* Campos de cristal */
      .field-input, .field-select, .field-textarea {
        width: 100%;
        border-radius: 1rem;
        padding: 0.65rem 0.9rem;
        font-size: 0.875rem;
        color: var(--field-text);
        background: var(--field-bg);
        -webkit-backdrop-filter: blur(14px) saturate(150%);
        backdrop-filter: blur(14px) saturate(150%);
        border: 1.5px solid rgba(var(--line-rgb),0.18);
        outline: none;
        font-family: var(--font-body);
        transition: border-color .15s, box-shadow .15s, background-color .15s;
      }
      .field-input:focus, .field-select:focus, .field-textarea:focus {
        border-color: var(--stamp);
        box-shadow: 0 0 0 3px rgba(var(--stamp-rgb),0.18);
        background: rgba(255,255,255,0.1);
      }
      .field-textarea { min-height: 4.5rem; resize: vertical; }
      input[type="date"], input[type="time"] { font-family: 'IBM Plex Mono', monospace; }

      .chip {
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        border: 1.5px solid rgba(var(--line-rgb),0.18);
        color: var(--field-text);
        white-space: nowrap;
        flex-shrink: 0;
        background: var(--field-bg);
        -webkit-backdrop-filter: blur(14px) saturate(150%);
        backdrop-filter: blur(14px) saturate(150%);
      }
      .chip.active {
        background: linear-gradient(135deg, rgba(var(--stamp-rgb),0.95), rgba(var(--stamp-rgb),0.55));
        border-color: transparent;
        color: #fff;
        box-shadow: 0 8px 20px -6px rgba(var(--stamp-rgb),0.5);
      }

      /* Brillo de superficie para botones (gloss / reflexión) */
      .btn-gloss {
        background-image: linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0) 46%);
      }

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

// Dos temas: mismo layout y mismos componentes, solo cambian los valores de
// las variables CSS (colores + tipografías). Añadir un tercer tema = añadir
// una entrada más aquí, nada más.
const THEMES = {
  default: {
    // "Liquid Glass": base azul-violeta profunda, superficies de cristal
    // translúcidas con blur, texto claro y un acento rosa neón estilo Y2K.
    label: 'Liquid Glass',
    ink: '#0A0C1A', paper: 'rgba(255,255,255,0.08)', paperDim: 'rgba(255,255,255,0.13)',
    text: '#F4F6FF', textInverse: '#FFFFFF',
    stamp: '#FF4D9D', gold: '#FFC23E', sky: '#4DD8FF', sage: '#3ED598',
    lineRgb: '255,255,255', inverseRgb: '255,255,255', scrimRgb: '6,8,20', stampRgb: '255,77,157',
    fieldBg: 'rgba(255,255,255,0.07)', fieldText: '#F4F6FF',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontBody: "'Manrope', sans-serif",
  },
  otaku: {
    label: 'Otaku mode',
    // Tema oscuro head-unit Y2K ahora también en cristal: base casi negra,
    // superficies translúcidas, acentos neón (rosa/cian/oro/verde) reservados
    // para indicadores e iconos. Evita #0000 y #fff puros para lectura nocturna.
    ink: '#070910', paper: 'rgba(255,255,255,0.06)', paperDim: 'rgba(255,255,255,0.11)',
    text: '#E9E4F5', textInverse: '#FFFFFF',
    stamp: '#FF3E9A', gold: '#FFC23E', sky: '#35C4F5', sage: '#3ED598',
    lineRgb: '255,255,255', inverseRgb: '255,255,255', scrimRgb: '10,8,18', stampRgb: '255,62,154',
    fieldBg: 'rgba(255,255,255,0.06)', fieldText: '#E9E4F5',
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
  experience: 'experiences', museum: 'museums',
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
        <button onClick={onEdit} className="shrink-0 p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.14)' }} aria-label="Editar viaje">
          <Pencil size={14} className="text-paper" />
        </button>
      </div>
      <div className="flex items-center gap-2 my-4">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.4)' }} />
        <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--inverse-rgb),0.3)' }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.4)' }} />
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
        <div key={s.label} className="rounded-2xl bg-paper border p-2.5 text-center" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">{s.value}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function DestinationRow({ d, isFirst, isLast, onEdit, onDelete, onMove }) {
  return (
    <div className="rounded-2xl p-3.5 bg-paper border flex items-center gap-3" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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
    <div className="rounded-2xl p-3.5 bg-paper border flex items-center gap-3" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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
    <button onClick={onEdit} className="w-full flex items-center gap-3 rounded-2xl p-3 bg-paper-dim border text-left" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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
    <div className="rounded-2xl p-4 bg-paper-dim border" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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
          <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--line-rgb),0.25)' }} />
          <Icon size={12} className="mx-1 text-ink shrink-0" style={{ opacity: 0.4 }} />
          <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--line-rgb),0.25)' }} />
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
    <div className="rounded-2xl p-3.5 bg-paper border flex gap-3" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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
    <div className="rounded-2xl p-3.5 bg-paper border flex items-center gap-3" style={{ borderColor: 'rgba(var(--line-rgb),0.1)', opacity: p.visited ? 0.6 : 1 }}>
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
    <div className="rounded-2xl bg-paper border overflow-hidden" style={{ borderColor: 'rgba(var(--line-rgb),0.1)', opacity: item.acquired ? 0.65 : 1 }}>
      {item.imageUrl && <ItemImage src={item.imageUrl} alt={item.name} aspect="aspect-[4/3]" />}
      <div className="p-3.5 flex gap-3">
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
    </div>
  );
}

function GapFiller({ gap }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--line-rgb),0.15)' }} />
      <p className="font-mono text-xs text-ink shrink-0" style={{ opacity: 0.5 }}>
        {gap.nights} {gap.nights === 1 ? 'noche libre' : 'noches libres'}{gap.destName ? ` en ${gap.destName}` : ''}
      </p>
      <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(var(--line-rgb),0.15)' }} />
    </div>
  );
}

function DayNav({ days }) {
  if (days.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3 sticky top-0 bg-paper z-10 border-b" style={{ borderColor: 'rgba(var(--line-rgb),0.08)' }}>
      {days.map((date) => (
        <button key={date} onClick={() => { const el = document.getElementById('day-' + date); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
          className="flex flex-col items-center justify-center shrink-0 rounded-2xl px-3 py-1.5 bg-paper" style={{ border: '1.5px solid rgba(var(--line-rgb),0.12)' }}>
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
          style={{ borderColor: 'rgba(var(--line-rgb),0.2)', opacity: 0.7 }}>
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
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed text-sm font-semibold text-ink" style={{ borderColor: 'rgba(var(--line-rgb),0.2)', opacity: 0.7 }}>
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
        <div className="relative w-full rounded-3xl overflow-hidden bg-paper-dim border" style={{ paddingBottom: '120%', borderColor: 'rgba(var(--line-rgb),0.1)' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <polyline points={destinations.map((d) => `${d.mapPos.x},${d.mapPos.y}`).join(' ')} fill="none" strokeWidth="0.5" strokeDasharray="1.4 1.4" strokeOpacity="0.3" style={{ stroke: 'var(--text)' }} />
          </svg>
          {pins.map((p) => (
            <button key={p.type + p.id} onClick={() => openEdit(p.type, p.item)} className="absolute flex flex-col items-center"
              style={{ left: p.mapPos.x + '%', top: p.mapPos.y + '%', transform: 'translate(-50%,-100%)' }}>
              <span className={'flex items-center justify-center rounded-full shadow-md ' + (p.kind === 'destino' ? 'w-7 h-7' : 'w-4 h-4')} style={{ backgroundColor: colorVar(p.color) }}>
                {p.kind === 'destino' && <MapPin size={13} style={{ color: 'var(--text-inverse)' }} />}
              </span>
              {p.kind === 'destino' && (
                <span className="font-mono text-xs font-semibold text-ink mt-1 bg-ink px-1.5 py-0.5 rounded-full shadow-sm">{p.name}</span>
              )}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-center mt-2" style={{ opacity: 0.4, color: 'var(--text)' }}>Vista previa · el mapa real se conectará más adelante</p>
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
                  <button key={p.type + p.id} onClick={() => openEdit(p.type, p.item)} className="w-full flex items-center gap-3 rounded-xl p-2.5 bg-paper border text-left" style={{ borderColor: 'rgba(var(--line-rgb),0.08)' }}>
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

function MuseumCard({ m, onEdit, onToggle, onDelete }) {
  return (
    <div className="rounded-2xl bg-paper border overflow-hidden" style={{ borderColor: 'rgba(var(--line-rgb),0.1)', opacity: m.visited ? 0.72 : 1 }}>
      {m.imageUrl && <ItemImage src={m.imageUrl} alt={m.name} aspect="aspect-[4/3]" />}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display font-semibold text-ink text-sm truncate" style={{ textDecoration: m.visited ? 'line-through' : 'none' }}>{m.name}</p>
            {m.city && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-paper-dim text-ink font-mono text-[11px] font-semibold">
                <MapPin size={10} /> {m.city}
              </span>
            )}
          </div>
          <button onClick={onToggle} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" aria-label="Marcar como visitado"
            style={m.visited
              /* El sage (#3ED598) es igual en ambos temas, así que el rgba va fijo. */
              ? { color: 'var(--sage)', backgroundColor: 'rgba(62,213,152,0.12)', boxShadow: '0 0 14px rgba(62,213,152,0.45)' }
              : { color: 'var(--text)', opacity: 0.35 }}>
            {m.visited ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
        </div>
        <div className="mt-2.5 space-y-1">
          {m.hours && <p className="text-xs text-ink flex items-center gap-1.5" style={{ opacity: 0.6 }}><Clock size={11} /> {m.hours}</p>}
          {m.admissionPrice && <p className="text-xs text-ink flex items-center gap-1.5" style={{ opacity: 0.6 }}><Ticket size={11} /> {m.admissionPrice}</p>}
        </div>
        {m.notes && <p className="text-xs text-ink mt-2 leading-relaxed" style={{ opacity: 0.7 }}>{m.notes}</p>}
        <div className="flex items-center justify-end mt-3 pt-2.5 border-t" style={{ borderColor: 'rgba(var(--line-rgb),0.08)' }}>
          <button onClick={onEdit} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }}><Pencil size={14} /></button>
          <DeleteButton onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

function LugaresView({ data, destinations, openAdd, openEdit, onDelete, onToggleVisited, onToggleMuseumVisited }) {
  const [section, setSection] = useState('lugares');
  const [filter, setFilter] = useState('todos');
  const [museumFilter, setMuseumFilter] = useState('todos');
  const filtered = data.places.filter((p) => (filter === 'todos' ? true : filter === 'visitados' ? p.visited : !p.visited));
  const museums = data.museums || [];
  const filteredMuseums = museums.filter((m) => (museumFilter === 'todos' ? true : museumFilter === 'visitados' ? m.visited : !m.visited));

  return (
    <div className="pb-6">
      <div className="flex gap-2 px-4 pt-4 pb-1 overflow-x-auto scrollbar-none">
        {[['lugares', 'Lugares'], ['museos', 'Museos']].map(([k, label]) => (
          <button key={k} onClick={() => setSection(k)} className={`chip ${section === k ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {section === 'lugares' ? (
        <>
          <div className="flex gap-2 px-4 pt-1 pb-1 overflow-x-auto scrollbar-none">
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
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed text-sm font-semibold text-ink" style={{ borderColor: 'rgba(var(--line-rgb),0.2)', opacity: 0.7 }}>
              <Plus size={15} /> Añadir lugar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 px-4 pt-1 pb-1 overflow-x-auto scrollbar-none">
            {[['todos', 'Todos'], ['pendientes', 'Por visitar'], ['visitados', 'Visitados']].map(([k, label]) => (
              <button key={k} onClick={() => setMuseumFilter(k)} className={`chip ${museumFilter === k ? 'active' : ''}`}>{label}</button>
            ))}
          </div>
          <div className="px-4 pt-3 space-y-3">
            {filteredMuseums.map((m) => (
              <MuseumCard key={m.id} m={m} onEdit={() => openEdit('museum', m)} onDelete={() => onDelete('museums', m.id)} onToggle={() => onToggleMuseumVisited(m.id)} />
            ))}
            {filteredMuseums.length === 0 && <EmptyState icon={Landmark} title="Sin museos todavía" subtitle="Añade el primero y planifica la visita" />}
            <button onClick={() => openAdd('museum', { name: '', city: '', imageUrl: '', admissionPrice: '', hours: '', notes: '', visited: false })}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed text-sm font-semibold text-ink" style={{ borderColor: 'rgba(var(--line-rgb),0.2)', opacity: 0.7 }}>
              <Plus size={15} /> Añadir museo
            </button>
          </div>
        </>
      )}
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
      <SectionHeader title="Lista de compras" onAdd={() => openAdd('shopping', { name: '', zone: '', summary: '', estPrice: '', actualPrice: '', acquired: false, imageUrl: '' })} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-paper border p-2.5 text-center" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">{acquiredCount}/{data.shopping.length}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Conseguidos</p>
        </div>
        <div className="rounded-2xl bg-paper border p-2.5 text-center" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
          <p className="font-display text-lg font-bold text-ink">¥{estPending.toLocaleString('es-MX')}</p>
          <p className="font-mono text-xs text-ink" style={{ opacity: 0.5 }}>Por gastar (aprox.)</p>
        </div>
        <div className="rounded-2xl bg-paper border p-2.5 text-center" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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

function NotasView({ data, openAdd, openEdit, onDelete, onHeaderClick }) {
  return (
    <div className="px-4 pt-4 pb-6 space-y-3">
      <SectionHeader title="Notas" onAdd={() => openAdd('note', { title: '', content: '' })} onTitleClick={onHeaderClick} />
      {data.notes.length === 0 && <EmptyState icon={StickyNote} title="Sin notas todavía" subtitle="Guarda ideas, recordatorios o cosas que no quieres olvidar" />}
      {data.notes.map((n) => (
        <div key={n.id} className="rounded-2xl p-4 bg-paper border" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
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

function ExperienceRow({ x, onEdit, onToggle, onDelete }) {
  const cat = EXPERIENCE_CATEGORIES[x.category] || EXPERIENCE_CATEGORIES.otro;
  return (
    <div className="rounded-2xl bg-paper border overflow-hidden" style={{ borderColor: 'rgba(var(--line-rgb),0.1)', opacity: x.visited ? 0.72 : 1 }}>
      {x.imageUrl && <ItemImage src={x.imageUrl} alt={x.name} aspect="aspect-video" />}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onEdit} className="text-left min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-ink text-sm" style={{ textDecoration: x.visited ? 'line-through' : 'none' }}>{x.name}</h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full font-mono text-[10px] font-semibold shrink-0" style={{ color: 'var(--text-inverse)', backgroundColor: colorVar(cat.color) }}>
                {cat.label}
              </span>
            </div>
            {(x.location || x.price) && (
              <p className="font-mono text-xs text-ink truncate mt-0.5" style={{ opacity: 0.55 }}>
                {[x.location, x.price].filter(Boolean).join(' · ')}
              </p>
            )}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onToggle} className="w-8 h-8 rounded-full flex items-center justify-center" aria-label="Marcar como visitada"
              style={x.visited
                /* El sage (#3ED598) es igual en ambos temas, así que el rgba va fijo. */
                ? { color: 'var(--sage)', backgroundColor: 'rgba(62,213,152,0.12)', boxShadow: '0 0 14px rgba(62,213,152,0.45)' }
                : { color: 'var(--text)', opacity: 0.35 }}>
              {x.visited ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
            <button onClick={onEdit} className="p-1 rounded text-ink" style={{ opacity: 0.5 }}><Pencil size={13} /></button>
            <DeleteButton onDelete={onDelete} />
          </div>
        </div>
        {x.description && <p className="text-sm text-ink mt-1.5 leading-relaxed" style={{ opacity: 0.7 }}>{x.description}</p>}
      </div>
    </div>
  );
}

// Easter Egg: pestaña oculta, se desbloquea con 3 toques rápidos en Notas
// estando en Otaku Mode. CRUD idéntico al resto de entidades (experiences),
// aislado por completo de la lógica de Notas.
function EasterEggView({ data, openAdd, openEdit, onDelete, onToggleVisited }) {
  const [catFilter, setCatFilter] = useState('todas');
  const experiences = data.experiences || [];
  const filtered = experiences.filter((x) => {
    const cat = x.category || 'otro';
    return catFilter === 'todas' || cat === catFilter;
  });
  return (
    <div className="px-4 pt-4 pb-6 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-stamp" />
        <span className="font-display text-lg font-bold text-ink">Experiencias secretas</span>
      </div>
      <SectionHeader title="Easter Egg" onAdd={() => openAdd('experience', { name: '', location: '', price: '', description: '', imageUrl: '', category: 'otro', visited: false })} addLabel="Añadir experiencia" />
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {[['todas', 'Todas'], ...Object.entries(EXPERIENCE_CATEGORIES).map(([k, c]) => [k, c.label])].map(([k, label]) => (
          <button key={k} onClick={() => setCatFilter(k)} className={`chip ${catFilter === k ? 'active' : ''}`}>{label}</button>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={Sparkles} title="Sin experiencias todavía" subtitle="Guarda aquí esos momentos únicos del viaje" />}
      {filtered.map((x) => (
        <ExperienceRow key={x.id} x={x} onEdit={() => openEdit('experience', x)} onDelete={() => onDelete('experiences', x.id)} onToggle={() => onToggleVisited(x.id)} />
      ))}
    </div>
  );
}

/* ============================================================
   APP PRINCIPAL
   ============================================================ */

export default function TripPlannerApp() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('resumen');
  const [sheet, setSheet] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tripPlannerTheme');
    return saved === 'otaku' ? 'otaku' : 'default';
  });
  const [eggUnlocked, setEggUnlocked] = useState(false);
  const notesTap = useRef({ count: 0, last: 0 });
  const notesTimeoutRef = useRef(null);

  // Persiste la elección de tema para que sobreviva a refrescos.
  useEffect(() => {
    localStorage.setItem('tripPlannerTheme', theme);
  }, [theme]);

  // Al salir de Otaku Mode se resetea el Easter Egg: vuelve la pestaña Notas
  // y se limpia el contador de toques (previene reactivaciones accidentales).
  useEffect(() => {
    if (theme !== 'otaku') {
      notesTap.current = { count: 0, last: 0 };
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
        notesTimeoutRef.current = null;
      }
      setEggUnlocked(false);
      setTab((t) => (t === 'easteregg' ? 'notas' : t));
    }
  }, [theme]);

  // Gesto de desbloqueo del Easter Egg: 3 toques rápidos (≤ 1.5s entre el
  // primero y el tercero) sobre el título de "Notas" estando en Otaku Mode.
  const handleNotesHeaderClick = () => {
    if (theme !== 'otaku') return;

    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
      notesTimeoutRef.current = null;
    }

    notesTap.current.count += 1;

    if (notesTap.current.count >= 3) {
      notesTap.current.count = 0;
      setEggUnlocked(true);
      alert('¡Experiencias desbloqueadas! Se revela la pestaña secreta.');
    } else {
      notesTimeoutRef.current = setTimeout(() => {
        notesTap.current.count = 0;
        notesTimeoutRef.current = null;
      }, 1500);
    }
  };

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
  const toggleMuseumVisited = (id) => {
    const current = (data.museums || []).find((m) => m.id === id);
    if (!current) return;
    const visited = !current.visited;
    setData((d) => ({ ...d, museums: d.museums.map((m) => (m.id === id ? { ...m, visited } : m)) }));
    api.update('museums', id, { visited }).catch((e) => console.error(e));
  };
  const toggleExperienceVisited = (id) => {
    const current = (data.experiences || []).find((x) => x.id === id);
    if (!current) return;
    const visited = !current.visited;
    setData((d) => ({ ...d, experiences: d.experiences.map((x) => (x.id === id ? { ...x, visited } : x)) }));
    api.update('experiences', id, { visited }).catch((e) => console.error(e));
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
  const activeTabs = useMemo(() => (eggUnlocked ? [...TABS, { key: 'easteregg', label: 'Experiencias', icon: Sparkles }] : TABS), [eggUnlocked]);

  // Todo el theming pasa por variables CSS: cambiar de tema no toca ningún
  // componente, solo redefine estos valores en el elemento raíz y el resto
  // se resuelve por herencia (colorVar(), las clases .bg-ink/.text-stamp/etc,
  // y font-family: var(--font-display) ya definidos en GlobalStyle).
  const t = THEMES[theme];
  const themeVars = {
    '--ink': t.ink, '--paper': t.paper, '--paper-dim': t.paperDim,
    '--text': t.text, '--text-inverse': t.textInverse,
    '--stamp': t.stamp, '--gold': t.gold, '--sky': t.sky, '--sage': t.sage,
    '--line-rgb': t.lineRgb, '--inverse-rgb': t.inverseRgb, '--scrim-rgb': t.scrimRgb, '--stamp-rgb': t.stampRgb,
    '--field-bg': t.fieldBg, '--field-text': t.fieldText,
    '--font-display': t.fontDisplay, '--font-body': t.fontBody,
  };
  const isOtaku = theme === 'otaku';

  if (!data) {
    return (
      <div className="liquid-bg min-h-screen w-full flex items-center justify-center" style={{ ...themeVars, backgroundColor: 'var(--ink)' }}>
        <GlobalStyle />
        <p className="font-mono text-sm" style={{ color: 'var(--text-inverse)', opacity: 0.7 }}>Cargando viaje…</p>
      </div>
    );
  }

  const activeView = (
    <>
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
        <LugaresView data={data} destinations={destinationsSorted} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onToggleVisited={toggleVisited} onToggleMuseumVisited={toggleMuseumVisited} />
      )}
      {tab === 'compras' && (
        <ComprasView data={data} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onToggleAcquired={toggleAcquired} />
      )}
      {tab === 'notas' && (
        <NotasView data={data} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onHeaderClick={handleNotesHeaderClick} />
      )}
      {tab === 'easteregg' && (
        <EasterEggView data={data} openAdd={openAdd} openEdit={openEdit} onDelete={remove} onToggleVisited={toggleExperienceVisited} />
      )}
    </>
  );

  return (
    <div className="liquid-bg relative min-h-screen w-full flex justify-center overflow-hidden sm:px-4 sm:py-10" style={{ ...themeVars, backgroundColor: 'var(--ink)' }}>
      <GlobalStyle />
      <div className="liquid-blob" style={{ width: 380, height: 380, top: '-10%', left: '-8%', background: 'radial-gradient(circle, rgba(70,64,190,0.8), transparent 70%)' }} />
      <div className="liquid-blob" style={{ width: 440, height: 440, top: '38%', right: '-12%', background: 'radial-gradient(circle, rgba(150,36,140,0.6), transparent 70%)' }} />
      <div className="liquid-blob" style={{ width: 320, height: 320, bottom: '-12%', left: '26%', background: 'radial-gradient(circle, rgba(24,96,170,0.6), transparent 70%)' }} />
      <ResponsiveAppShell tabs={activeTabs} tab={tab} setTab={setTab} theme={theme} setTheme={setTheme} isOtaku={isOtaku} onNotesTap={handleNotesHeaderClick}>
        {activeView}
      </ResponsiveAppShell>
      <SheetRouter sheet={sheet} onClose={closeSheet} onSave={handleSave} onDeleteEntity={handleDeleteEntity} destinations={destinationsSorted} places={data.places} />
    </div>
  );
}
