import { useState } from 'react';

import { Field } from '../ui/Field';
import { FormActions } from '../ui/FormActions';
import { Sheet } from '../ui/Sheet';
import { colorVar, PLACE_CATEGORIES, STAY_TYPES, TRANSPORT_TYPES } from '../../domain/tripConfig';

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
      <Field label="Lugar"><input className="field-input" value={v.location} onChange={set('location')} placeholder="Ej. Hi-tech Land, Taito Station" /></Field>
      <Field label="Precio aprox. o real"><input className="field-input" value={v.price} onChange={set('price')} placeholder="Ej. ¥800 · gratis" /></Field>
      <Field label="Descripción"><textarea className="field-textarea" value={v.description} onChange={set('description')} style={{ minHeight: '8rem' }} /></Field>
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
  experience: (m) => (m === 'add' ? 'Nueva experiencia' : 'Editar experiencia'),
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
      {sheet.type === 'experience' && <ExperienceForm {...common} />}
    </Sheet>
  );
}

export { SheetRouter };
