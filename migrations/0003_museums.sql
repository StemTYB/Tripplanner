-- Migración 0003: tabla para los "museos" (subsección del tab Lugares).
-- Mismo approach que el resto: cada fila guarda el objeto completo como JSON
-- en 'payload', así el schema nunca se desincroniza del frontend.

CREATE TABLE IF NOT EXISTS museums (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);
