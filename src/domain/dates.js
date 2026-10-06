/**
 * FECHAS — utilidades puras compartidas por App y el dominio
 * ---------------------------------------------------------
 * Todas trabajan con fechas ISO de calendario local ('YYYY-MM-DD'), nunca con
 * instantes UTC: parseISO añade 'T00:00:00' para que el día no se desplace.
 * Antes vivían duplicadas en App.jsx y budget.js; ahora hay una sola copia.
 */

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n) => String(n).padStart(2, '0');

const parseISO = (s) => new Date(s + 'T00:00:00');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const isoToday = () => toISO(new Date());
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = (iso, opts = { day: 'numeric', month: 'short' }) => parseISO(iso).toLocaleDateString('es-MX', opts);
const fmtDateFull = (iso) => cap(parseISO(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
const fmtDay = (iso) => (iso ? fmtDate(iso) : 'Sin fecha');

export { parseISO, toISO, isoToday, addDays, diffDays, fmtDate, fmtDateFull, fmtDay };
