import {
  Plane, TrainFront, Bus, Car, Ship,
  MapPin,
  Utensils, ShoppingBag, Landmark, Music, Trees, Sparkles, Gauge,
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

export { colorVar, PLACE_CATEGORIES, STAY_TYPES, TRANSPORT_TYPES };
