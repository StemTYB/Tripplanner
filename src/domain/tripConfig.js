import {
  Plane, TrainFront, Bus, Car, Ship,
  MapPin,
  Utensils, ShoppingBag, Landmark, Music, Trees, Sparkles, Gauge,
  Flame, Gamepad2, Coffee,
  BedDouble, Ticket, Wallet,
} from 'lucide-react';

// colorVar returns a CSS var() reference (not a literal hex) so every dynamic
// color usage (destination badges, category icons, map pins) automatically
// re-skins when the active theme changes the underlying custom property.
const colorVar = (key) => `var(--${key})`;

// Entrada de categoría dentro de un mapa (PLACE_CATEGORIES,
// EXPERIENCE_CATEGORIES, EXPENSE_CATEGORIES) con 'otro' como fallback para
// valores antiguos o desconocidos que lleguen en datos ya guardados.
const catOf = (map, key) => map[key] || map.otro;

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

// Categorías de la pestaña "Experiencias" (Easter Egg). Las experiencias
// antiguas sin categoría se tratan como 'otro', así no se rompe nada al
// añadir el selector.
const EXPERIENCE_CATEGORIES = {
  soapland: { label: 'Soaplands', icon: Flame, color: 'stamp' },
  arcade: { label: 'Arcades', icon: Gamepad2, color: 'sky' },
  cafe: { label: 'Cafés', icon: Coffee, color: 'gold' },
  otro: { label: 'Otro', icon: Sparkles, color: 'ink' },
};

// Categorías de la pestaña "Gastos". Deliberadamente separadas de
// PLACE_CATEGORIES: esa lista alimenta los <select> de lugares y actividades,
// así que añadir aquí categorías de gasto no debe tocar aquellos formularios.
const EXPENSE_CATEGORIES = {
  comida: { label: 'Comida', icon: Utensils, color: 'stamp' },
  transporte: { label: 'Transporte', icon: TrainFront, color: 'sky' },
  alojamiento: { label: 'Alojamiento', icon: BedDouble, color: 'gold' },
  compras: { label: 'Compras', icon: ShoppingBag, color: 'gold' },
  entradas: { label: 'Entradas', icon: Ticket, color: 'sky' },
  ocio: { label: 'Ocio', icon: Music, color: 'stamp' },
  otro: { label: 'Otro', icon: Wallet, color: 'sage' },
};

// Monedas ofrecidas al registrar un gasto. Cada gasto guarda su propio
// importe + moneda; la conversión a la moneda base del viaje es un paso
// aparte (ver src/domain/budget.js) y nunca se suma a ciegas.
const CURRENCIES = ['JPY', 'MXN', 'USD', 'EUR'];
const DEFAULT_CURRENCY = 'JPY';

export {
  colorVar, catOf,
  PLACE_CATEGORIES, STAY_TYPES, TRANSPORT_TYPES, EXPERIENCE_CATEGORIES,
  EXPENSE_CATEGORIES, CURRENCIES, DEFAULT_CURRENCY,
};
