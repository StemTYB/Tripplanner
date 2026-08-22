import { Hono } from 'hono';

const ENTITY_TABLES = ['destinations', 'stays', 'transports', 'places', 'activities', 'shopping', 'notes'];
const isKnownEntity = (t) => ENTITY_TABLES.includes(t);

const app = new Hono();

// --- estado completo ------------------------------------------------------

app.get('/api/state', async (c) => {
  const { DB } = c.env;
  const tripRow = await DB.prepare('SELECT payload FROM trip WHERE id = 1').first();
  const state = { trip: tripRow ? JSON.parse(tripRow.payload) : null };

  for (const table of ENTITY_TABLES) {
    const { results } = await DB.prepare(`SELECT payload FROM ${table} ORDER BY sort_order ASC, id ASC`).all();
    state[table] = results.map((r) => JSON.parse(r.payload));
  }
  return c.json(state);
});

app.put('/api/trip', async (c) => {
  const { DB } = c.env;
  const values = await c.req.json();
  const row = await DB.prepare('SELECT payload FROM trip WHERE id = 1').first();
  const next = { ...(row ? JSON.parse(row.payload) : {}), ...values };
  await DB.prepare('UPDATE trip SET payload = ? WHERE id = 1').bind(JSON.stringify(next)).run();
  return c.json(next);
});

// --- CRUD genérico para destinations/stays/transports/places/activities/shopping/notes ---

app.post('/api/:entity', async (c) => {
  const { DB } = c.env;
  const entity = c.req.param('entity');
  if (!isKnownEntity(entity)) return c.json({ error: 'entidad desconocida' }, 404);
  const item = await c.req.json();
  if (!item.id) return c.json({ error: 'falta id' }, 400);

  await DB.prepare(`INSERT INTO ${entity} (id, dest_id, sort_order, payload) VALUES (?, ?, ?, ?)`)
    .bind(item.id, item.destId || null, item.order ?? 0, JSON.stringify(item))
    .run();
  return c.json(item, 201);
});

app.put('/api/:entity/:id', async (c) => {
  const { DB } = c.env;
  const entity = c.req.param('entity');
  const id = c.req.param('id');
  if (!isKnownEntity(entity)) return c.json({ error: 'entidad desconocida' }, 404);

  const row = await DB.prepare(`SELECT payload FROM ${entity} WHERE id = ?`).bind(id).first();
  if (!row) return c.json({ error: 'no encontrado' }, 404);

  const values = await c.req.json();
  const next = { ...JSON.parse(row.payload), ...values };
  await DB.prepare(`UPDATE ${entity} SET payload = ?, dest_id = ?, sort_order = ? WHERE id = ?`)
    .bind(JSON.stringify(next), next.destId || null, next.order ?? 0, id)
    .run();
  return c.json(next);
});

app.delete('/api/:entity/:id', async (c) => {
  const { DB } = c.env;
  const entity = c.req.param('entity');
  const id = c.req.param('id');
  if (!isKnownEntity(entity)) return c.json({ error: 'entidad desconocida' }, 404);

  await DB.prepare(`DELETE FROM ${entity} WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});

// --- todo lo que no sea /api/* -> archivos estáticos del build de Vite ----
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
