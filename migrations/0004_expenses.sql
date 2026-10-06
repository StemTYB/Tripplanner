-- Migración 0004: tabla para los gastos del viaje (pestaña "Gastos").
-- Mismo approach que el resto: cada fila guarda el objeto completo como JSON
-- en 'payload', así el schema nunca se desincroniza del frontend.
-- Estrictamente aditiva: no toca ninguna tabla existente.

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  sort_order INTEGER,
  payload TEXT NOT NULL
);
