/**
 * PRESUPUESTO Y GASTOS — utilidades puras
 * ---------------------------------------------------------
 * Todo lo de aquí son funciones sin estado: reciben el viaje y la lista de
 * gastos, y devuelven números. La vista (ExpensesView) solo pinta.
 *
 * Dos reglas que valen para todo el módulo:
 *
 *  1. Lectura tolerante. Los campos de presupuesto viven dentro de
 *     trip.payload, y un viaje guardado antes de esta función simplemente no
 *     los tiene. Cada lectura usa un valor por defecto, así que una fila
 *     antigua nunca rompe la carga.
 *
 *  2. Multi-moneda explícita. Cada gasto guarda su importe + su moneda. Para
 *     sumar hay que convertir a la moneda base del viaje, y esa conversión es
 *     un paso aparte y visible: si no hay tipo de cambio para una moneda, el
 *     gasto NO entra en el total — se devuelve en `unconverted` para poder
 *     avisarlo en la UI en lugar de mezclar monedas en silencio.
 */

import { DEFAULT_CURRENCY } from './tripConfig';
import { diffDays, fmtDay, isoToday } from './dates';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Importe con su moneda. Intl antepone el código (JPY 1,235 / USD 1,234.50),
// lo que evita la ambigüedad del símbolo $ entre MXN y USD.
function fmtMoney(amount, currency) {
  const code = currency || DEFAULT_CURRENCY;
  const n = num(amount);
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: code }).format(n);
  } catch {
    // Código de moneda inválido en datos antiguos: no romper el render.
    return `${n.toLocaleString('es-MX')} ${code}`.trim();
  }
}

// --- presupuesto del viaje -------------------------------------------------

// Lee los campos de presupuesto de trip.payload con fallbacks. Un viaje
// anterior a esta función no tiene ninguno de estos campos y esto devuelve
// el objeto a cero en vez de undefined.
function readBudget(trip) {
  const t = trip || {};
  const rates = t.fxRates && typeof t.fxRates === 'object' ? t.fxRates : {};
  return {
    baseCurrency: typeof t.baseCurrency === 'string' && t.baseCurrency ? t.baseCurrency : DEFAULT_CURRENCY,
    budgetTotal: num(t.budgetTotal),
    budgetDaily: num(t.budgetDaily),
    fxRates: rates,
  };
}

// Devuelve el importe convertido a la moneda base, o null si no hay tipo de
// cambio conocido para esa moneda (nunca 0 silencioso: null es "no lo sé").
function toBase(amount, currency, budget) {
  const n = num(amount);
  if (!currency || currency === budget.baseCurrency) return n;
  const rate = Number(budget.fxRates[currency]);
  return Number.isFinite(rate) && rate > 0 ? n * rate : null;
}

// Suma una lista de gastos en moneda base, separando lo no convertible.
function totalOf(list, budget) {
  let base = 0;
  const unconverted = [];
  for (const e of list) {
    const v = toBase(e.amount, e.currency, budget);
    if (v === null) unconverted.push(e);
    else base += v;
  }
  return { base, count: list.length, unconverted };
}

// Monedas distintas de la base presentes en los gastos: alimenta los campos
// de tipo de cambio del formulario de presupuesto.
function currenciesUsed(list) {
  const set = new Set();
  for (const e of list || []) if (e.currency) set.add(e.currency);
  return [...set].sort();
}

// --- días ------------------------------------------------------------------

function tripDays(trip) {
  if (!trip || !trip.startDate || !trip.endDate) return 0;
  return Math.max(0, diffDays(trip.startDate, trip.endDate) + 1);
}

// Días de viaje transcurridos, contando hoy. 0 si el viaje aún no empieza.
function daysElapsed(trip, todayIso) {
  if (!trip || !trip.startDate || !trip.endDate || !todayIso) return 0;
  if (todayIso < trip.startDate) return 0;
  if (todayIso > trip.endDate) return tripDays(trip);
  return Math.max(0, diffDays(trip.startDate, todayIso) + 1);
}

// --- resumen ---------------------------------------------------------------

function computeSummary(trip, expenses, todayIso) {
  const budget = readBudget(trip);
  const list = Array.isArray(expenses) ? expenses : [];
  const totals = totalOf(list, budget);

  const totalDays = tripDays(trip);
  const elapsed = daysElapsed(trip, todayIso);
  const dailyAvg = elapsed > 0 ? totals.base / elapsed : 0;
  const expectedToDate = budget.budgetDaily * elapsed;

  return {
    budget,
    totalDays,
    elapsed,
    spent: totals.base,
    expenseCount: totals.count,
    unconverted: totals.unconverted,
    hasBudget: budget.budgetTotal > 0,
    remaining: budget.budgetTotal - totals.base,
    progress: budget.budgetTotal > 0 ? totals.base / budget.budgetTotal : 0,
    dailyAvg,
    hasDailyTarget: budget.budgetDaily > 0,
    expectedToDate,
    // > 0 significa que vas por encima del objetivo a estas alturas.
    paceDelta: totals.base - expectedToDate,
    // Proyección al ritmo actual; null mientras no haya días transcurridos.
    projection: elapsed > 0 && totalDays > 0 ? dailyAvg * totalDays : null,
  };
}

// Agrupa gastos por destino o por categoría y suma cada grupo. `keyOf` decide
// el criterio; los gastos sin clave caen en '__none' en vez de desaparecer.
function groupTotals(list, budget, keyOf) {
  const groups = new Map();
  for (const e of list || []) {
    const key = keyOf(e) || '__none';
    if (!groups.has(key)) groups.set(key, { key, items: [] });
    groups.get(key).items.push(e);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, ...totalOf(g.items, budget) }))
    .sort((a, b) => b.base - a.base);
}

export {
  isoToday, fmtDay, fmtMoney,
  readBudget, toBase, totalOf, currenciesUsed,
  tripDays, daysElapsed, computeSummary, groupTotals,
};
