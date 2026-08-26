-- Migración 0002: tabla para las "experiencias" del Easter Egg (Otaku Mode)
-- Mismo approach que el resto: cada fila guarda el objeto completo como JSON
-- en 'payload', así el schema nunca se desincroniza del frontend.

CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);