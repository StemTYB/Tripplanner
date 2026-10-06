import { useState } from 'react';
import { X } from 'lucide-react';

import { ItemImage } from '../ui/ItemImage';
import {
  colorVar, PLACE_CATEGORIES, STAY_TYPES, TRANSPORT_TYPES, EXPERIENCE_CATEGORIES,
  EXPENSE_CATEGORIES, CURRENCIES, DEFAULT_CURRENCY,
} from '../../domain/tripConfig';
import { currenciesUsed, readBudget } from '../../domain/budget';

// --- bloques de UI propios de los formularios ------------------------------
// Antes vivían en src/components/ui/ con este archivo como único consumidor;
// se quedan aquí para no mantener tres módulos de una sola función.

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

// El Sheet solo se monta cuando SheetRouter tiene un `sheet` activo, así que
// no necesita prop `open`: existir = estar abierto.
function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(var(--scrim-rgb),0.55)' }} onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-paper rounded-t-[2rem] sm:rounded-[2.5rem] overflow-y-auto animate-sheet-up sm:border sm:border-white/15" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-paper" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--line-rgb),0.06)' }}>
            <X size={17} className="text-ink" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

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
              className="w-8 h-8 rounded-full" style={{ backgroundColor: colorVar(c), border: v.color === c ? '2.5px solid var(--text)' : '2.5px solid transparent' }} />
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
      <Field label="URL de imagen"><input className="field-input" value={v.imageUrl || ''} onChange={set('imageUrl')} placeholder="https://..." /></Field>
      {v.imageUrl && <ItemImage src={v.imageUrl} alt={v.name} aspect="aspect-video" className="mb-4" />}
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

function ExperienceForm({ initial, mode, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Nombre de la experiencia"><input className="field-input" value={v.name} onChange={set('name')} placeholder="Ej. Torneo arcade en Akihabara" /></Field>
      <Field label="Categoría">
        <select className="field-select" value={v.category || 'otro'} onChange={set('category')}>
          {Object.entries(EXPERIENCE_CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Lugar / zona"><input className="field-input" value={v.location || ''} onChange={set('location')} placeholder="Ej. Yoshiwara, Susukino, Ogoto" /></Field>
      <Field label="URL de imagen"><input className="field-input" value={v.imageUrl || ''} onChange={set('imageUrl')} placeholder="https://..." /></Field>
      {v.imageUrl && <ItemImage src={v.imageUrl} alt={v.name} aspect="aspect-video" className="mb-4" />}
      <Field label="Coste estimado (¥)"><input className="field-input" value={v.price || ''} onChange={set('price')} placeholder="Ej. ¥800 · gratis" /></Field>
      <Field label="Notas / normas de entrada"><textarea className="field-textarea" value={v.description || ''} onChange={set('description')} style={{ minHeight: '8rem' }} /></Field>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={Boolean(v.visited)} onChange={(e) => setV((s) => ({ ...s, visited: e.target.checked }))} />
        <span className="text-sm text-ink">Ya lo visité</span>
      </label>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.name} />
    </div>
  );
}

function MuseumForm({ initial, mode, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <div>
      <Field label="Nombre del museo"><input className="field-input" value={v.name} onChange={set('name')} placeholder="Ej. Museo Nacional de Tokio" /></Field>
      <Field label="Ciudad / zona"><input className="field-input" value={v.city || ''} onChange={set('city')} placeholder="Ej. Ueno, Tokio" /></Field>
      <Field label="URL de imagen"><input className="field-input" value={v.imageUrl || ''} onChange={set('imageUrl')} placeholder="https://..." /></Field>
      {v.imageUrl && <ItemImage src={v.imageUrl} alt={v.name} aspect="aspect-video" className="mb-4" />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio de entrada"><input className="field-input" value={v.admissionPrice || ''} onChange={set('admissionPrice')} placeholder="Ej. ¥1000 · gratis" /></Field>
        <Field label="Horario"><input className="field-input" value={v.hours || ''} onChange={set('hours')} placeholder="Ej. 09:00 - 17:00" /></Field>
      </div>
      <Field label="Notas / exposiciones"><textarea className="field-textarea" value={v.notes || ''} onChange={set('notes')} placeholder="Qué ver, días de cierre, audioguías..." /></Field>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={v.visited} onChange={(e) => setV((s) => ({ ...s, visited: e.target.checked }))} />
        <span className="text-sm text-ink">Ya lo visité</span>
      </label>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!v.name} />
    </div>
  );
}

function ExpenseForm({ initial, mode, destinations, onSubmit, onDelete }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  // Si un gasto antiguo trae una moneda fuera de la lista, se añade al vuelo
  // para que el <select> no muestre un valor vacío.
  const currencyOptions = CURRENCIES.includes(v.currency) ? CURRENCIES : [...CURRENCIES, v.currency].filter(Boolean);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Importe">
          <input type="number" inputMode="decimal" className="field-input" value={v.amount ?? ''} onChange={set('amount')} placeholder="0" />
        </Field>
        <Field label="Moneda">
          <select className="field-select" value={v.currency || DEFAULT_CURRENCY} onChange={set('currency')}>
            {currencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Categoría">
        <select className="field-select" value={v.category || 'otro'} onChange={set('category')}>
          {Object.entries(EXPENSE_CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha"><input type="date" className="field-input" value={v.date || ''} onChange={set('date')} /></Field>
        <Field label="Destino">
          <select className="field-select" value={v.destId || ''} onChange={set('destId')}>
            <option value="">Sin destino</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Nota"><input className="field-input" value={v.note || ''} onChange={set('note')} placeholder="Ej. Cena en izakaya" /></Field>
      <FormActions mode={mode} onSave={() => onSubmit(v)} onDelete={onDelete} disabled={!(Number(v.amount) > 0) || !v.date} />
    </div>
  );
}

// Los campos de presupuesto viven dentro de trip.payload y se guardan con el
// mismo endpoint que el resto del viaje (PUT /api/trip), que hace merge — así
// que este formulario solo envía sus propias claves y nunca toca nombre ni
// fechas del viaje.
function BudgetForm({ initial, expenses, onSubmit }) {
  const current = readBudget(initial);
  const [v, setV] = useState({
    budgetTotal: current.budgetTotal || '',
    budgetDaily: current.budgetDaily || '',
    baseCurrency: current.baseCurrency,
    fxRates: current.fxRates,
  });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const setRate = (code) => (e) => setV((s) => ({ ...s, fxRates: { ...s.fxRates, [code]: e.target.value } }));
  // Cambiar la moneda base invalida los tipos de cambio guardados (estaban
  // expresados en la base anterior), así que se vacían en vez de arrastrar
  // números que ya no significan lo mismo.
  const setBase = (e) => setV((s) => ({ ...s, baseCurrency: e.target.value, fxRates: {} }));

  const foreign = currenciesUsed(expenses).filter((c) => c !== v.baseCurrency);

  const submit = () => {
    const rates = {};
    for (const c of foreign) {
      const r = Number(v.fxRates[c]);
      if (Number.isFinite(r) && r > 0) rates[c] = r;
    }
    onSubmit({
      budgetTotal: Number(v.budgetTotal) || 0,
      budgetDaily: Number(v.budgetDaily) || 0,
      baseCurrency: v.baseCurrency,
      fxRates: rates,
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Presupuesto total"><input type="number" inputMode="decimal" className="field-input" value={v.budgetTotal} onChange={set('budgetTotal')} placeholder="0" /></Field>
        <Field label="Objetivo diario"><input type="number" inputMode="decimal" className="field-input" value={v.budgetDaily} onChange={set('budgetDaily')} placeholder="0" /></Field>
      </div>
      <Field label="Moneda base">
        <select className="field-select" value={v.baseCurrency} onChange={setBase}>
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label={`Tipos de cambio (1 unidad = ? ${v.baseCurrency})`}>
        {foreign.length === 0 ? (
          <p className="text-xs text-ink" style={{ opacity: 0.5 }}>
            No hay gastos en otra moneda. Si registras alguno, aquí aparecerá su tipo de cambio respecto al {v.baseCurrency}.
          </p>
        ) : (
          <div className="space-y-2">
            {foreign.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink w-20 shrink-0" style={{ opacity: 0.6 }}>1 {c} =</span>
                <input type="number" inputMode="decimal" className="field-input" value={v.fxRates[c] ?? ''} onChange={setRate(c)} placeholder="0" />
                <span className="font-mono text-xs text-ink shrink-0" style={{ opacity: 0.6 }}>{v.baseCurrency}</span>
              </div>
            ))}
            <p className="text-xs text-ink" style={{ opacity: 0.5 }}>
              Sin tipo de cambio, esos gastos quedan fuera del total (se avisa en la pestaña Gastos).
            </p>
          </div>
        )}
      </Field>
      <FormActions mode="edit" onSave={submit} />
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
  experience: (m) => (m === 'add' ? 'Nueva experiencia' : 'Editar experiencia'),
  museum: (m) => (m === 'add' ? 'Nuevo museo' : 'Editar museo'),
  expense: (m) => (m === 'add' ? 'Nuevo gasto' : 'Editar gasto'),
  budget: () => 'Presupuesto',
};

function SheetRouter({ sheet, onClose, onSave, onDeleteEntity, destinations, places, expenses }) {
  if (!sheet) return null;
  const title = SHEET_TITLES[sheet.type](sheet.mode);
  const common = {
    initial: sheet.initial,
    mode: sheet.mode,
    onSubmit: onSave,
    onDelete: sheet.mode === 'edit' ? () => onDeleteEntity(sheet.type, sheet.initial.id) : undefined,
  };
  return (
    <Sheet title={title} onClose={onClose}>
      {sheet.type === 'trip' && <TripForm {...common} />}
      {sheet.type === 'destination' && <DestinationForm {...common} />}
      {sheet.type === 'stay' && <StayForm {...common} destinations={destinations} />}
      {sheet.type === 'transport' && <TransportForm {...common} />}
      {sheet.type === 'place' && <PlaceForm {...common} destinations={destinations} />}
      {sheet.type === 'activity' && <ActivityForm {...common} destinations={destinations} places={places} />}
      {sheet.type === 'note' && <NoteForm {...common} />}
      {sheet.type === 'shopping' && <ShoppingForm {...common} />}
      {sheet.type === 'experience' && <ExperienceForm {...common} />}
      {sheet.type === 'museum' && <MuseumForm {...common} />}
      {sheet.type === 'expense' && <ExpenseForm {...common} destinations={destinations} />}
      {/* BudgetForm no recibe onDelete: el presupuesto son campos del viaje,
          no una entidad borrable, y no debe mostrar el botón de eliminar. */}
      {sheet.type === 'budget' && <BudgetForm initial={sheet.initial} expenses={expenses} onSubmit={onSave} />}
    </Sheet>
  );
}

export { SheetRouter };
