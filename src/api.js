const BASE = '/api';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API ${options?.method || 'GET'} ${url} -> ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getState: () => request(`${BASE}/state`),
  updateTrip: (values) => request(`${BASE}/trip`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
  }),
  create: (entity, item) => request(`${BASE}/${entity}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
  }),
  update: (entity, id, values) => request(`${BASE}/${entity}/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
  }),
  remove: (entity, id) => request(`${BASE}/${entity}/${id}`, { method: 'DELETE' }),
};
