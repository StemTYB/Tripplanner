import {
  Plane, TrainFront, Bus, Car, Ship,
  MapPin,
  Utensils, ShoppingBag, Landmark, Music, Trees, Sparkles, Gauge,
  Flame, Gamepad2, Coffee,
} from 'lucide-react';

// colorVar returns a CSS var() reference (not a literal hex) so every dynamic
// color usage (destination badges, category icons, map pins) automatically
// re-skins when the active theme changes the underlying custom property.
const colorVar = (key) => `var(--${key})`;

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

export { colorVar, PLACE_CATEGORIES, STAY_TYPES, TRANSPORT_TYPES, EXPERIENCE_CATEGORIES };
