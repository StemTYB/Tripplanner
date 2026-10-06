/**
 * Pestaña "Gastos" — resumen de presupuesto, desglose y registro de gastos.
 * ---------------------------------------------------------
 * Todo lo específico de esta función vive aquí y en src/domain/budget.js, no
 * repartido por App.jsx: el CRUD usa las mismas funciones genéricas
 * (add/update/remove) y el mismo endpoint, así que el resto de la app no
 * necesita saber que los gastos existen.
 *
 * Sobre multi-moneda: cada gasto conserva su importe y su moneda originales.
 * La conversión a la moneda base del viaje la hace budget.js como un paso
 * aparte, y lo que no se puede convertir se avisa en pantalla en vez de
 * sumarse a ciegas al total.
 */

import { useMemo, useState } from 'react';
import { Plus, Pencil, Wallet, AlertTriangle } from 'lucide-react';

import { DeleteButton } from '../ui/DeleteButton';
import { EmptyState } from '../ui/EmptyState';
import { SectionHeader } from '../ui/SectionHeader';
import { colorVar, catOf as categoryOf, EXPENSE_CATEGORIES } from '../../domain/tripConfig';
import {
  computeSummary, fmtDay, fmtMoney, groupTotals, isoToday, toBase,
} from '../../domain/budget';

// Atajo local sobre las categorías de gasto (mismo fallback 'otro' que el resto).
const catOf = (key) => categoryOf(EXPENSE_CATEGORIES, key);

// --- fila de un gasto ------------------------------------------------------

function ExpenseRow({ e, budget, destName, onEdit, onDelete }) {
  const cat = catOf(e.category);
  const Icon = cat.icon;
  // Equivalente en moneda base, solo si la moneda del gasto es otra y hay
  // tipo de cambio. Es informativo: no altera el importe guardado.
  const converted = e.currency && e.currency !== budget.baseCurrency
    ? toBase(e.amount, e.currency, budget)
    : null;

  return (
    <div className="rounded-2xl p-3.5 bg-paper border flex gap-3" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: colorVar(cat.color) }}>
        <Icon size={16} className="text-paper" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onEdit} className="min-w-0 text-left">
            <p className="font-display font-semibold text-ink text-sm truncate">{e.note || cat.label}</p>
            <p className="font-mono text-xs text-ink truncate" style={{ opacity: 0.55 }}>
              {fmtDay(e.date)} · {destName || 'Sin destino'} · {cat.label}
            </p>
          </button>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-lg text-ink" style={{ opacity: 0.5 }} aria-label="Editar gasto"><Pencil size={13} /></button>
            <DeleteButton onDelete={onDelete} />
          </div>
        </div>
        <p className="font-mono text-sm font-semibold text-ink mt-1">
          {fmtMoney(e.amount, e.currency)}
          {converted != null && (
            <span className="font-normal" style={{ opacity: 0.5 }}> · ≈ {fmtMoney(converted, budget.baseCurrency)}</span>
          )}
        </p>
      </div>
    </div>
  );
}

// --- tarjetas de resumen ---------------------------------------------------

function SummaryCard({ summary, onEditBudget }) {
  const { budget, spent, hasBudget, remaining, progress } = summary;
  const over = hasBudget && remaining < 0;
  const pct = Math.max(0, Math.min(100, progress * 100));

  return (
    <div className="rounded-3xl bg-ink p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-paper" style={{ opacity: 0.55 }}>Gastado</p>
          <p className="font-display text-3xl font-bold leading-tight mt-1 truncate text-paper">{fmtMoney(spent, budget.baseCurrency)}</p>
        </div>
        <button onClick={onEditBudget} className="shrink-0 p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.14)' }} aria-label="Editar presupuesto">
          <Pencil size={14} className="text-paper" />
        </button>
      </div>

      {hasBudget ? (
        <>
          <div className="h-2 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: 'rgba(var(--inverse-rgb),0.16)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: over ? 'var(--stamp)' : 'var(--sage)' }} />
          </div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <p className="font-mono text-xs text-paper" style={{ opacity: 0.65 }}>
              Presupuesto {fmtMoney(budget.budgetTotal, budget.baseCurrency)}
            </p>
            <p className="font-mono text-xs font-semibold text-paper" style={{ color: over ? 'var(--stamp)' : 'var(--sage)' }}>
              {over
                ? `Excedido en ${fmtMoney(Math.abs(remaining), budget.baseCurrency)}`
                : `Quedan ${fmtMoney(remaining, budget.baseCurrency)}`}
            </p>
          </div>
        </>
      ) : (
        <button onClick={onEditBudget} className="font-mono text-xs text-paper mt-3 text-left" style={{ opacity: 0.7, textDecoration: 'underline' }}>
          Sin presupuesto total definido — toca para definirlo
        </button>
      )}
    </div>
  );
}

function BudgetTile({ label, value, muted }) {
  return (
    <div className="rounded-2xl bg-paper border p-2.5 text-center" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
      <p className="font-display text-sm font-bold text-ink truncate" style={{ opacity: muted ? 0.4 : 1 }}>{value}</p>
      <p className="font-mono text-xs text-ink mt-0.5" style={{ opacity: 0.5 }}>{label}</p>
    </div>
  );
}

function PaceRow({ summary }) {
  const { budget, dailyAvg, projection, hasDailyTarget } = summary;
  const base = budget.baseCurrency;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <BudgetTile label="Media / día" value={fmtMoney(dailyAvg, base)} muted={summary.elapsed === 0} />
        <BudgetTile label="Objetivo / día" value={hasDailyTarget ? fmtMoney(budget.budgetDaily, base) : '—'} muted={!hasDailyTarget} />
        <BudgetTile label="Proyección" value={projection != null ? fmtMoney(projection, base) : '—'} muted={projection == null} />
      </div>
      {hasDailyTarget && summary.elapsed > 0 && (
        <p className="font-mono text-xs text-ink" style={{ opacity: 0.55 }}>
          Día {summary.elapsed} de {summary.totalDays} · objetivo acumulado {fmtMoney(summary.expectedToDate, base)} ·{' '}
          {summary.paceDelta >= 0
            ? `vas ${fmtMoney(summary.paceDelta, base)} por encima`
            : `vas ${fmtMoney(-summary.paceDelta, base)} por debajo`}
        </p>
      )}
    </div>
  );
}

function ConversionWarning({ count, currencies, onEditBudget }) {
  return (
    <div className="rounded-2xl p-3.5 bg-paper border flex gap-2.5 items-start" style={{ borderColor: 'rgba(var(--line-rgb),0.16)' }}>
      <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
      <p className="text-xs text-ink" style={{ opacity: 0.75 }}>
        {count} {count === 1 ? 'gasto' : 'gastos'} en {currencies.join(', ')} fuera del total: falta el tipo de cambio.
        Añádelo en <button onClick={onEditBudget} style={{ textDecoration: 'underline' }}>Presupuesto</button>.
      </p>
    </div>
  );
}

function GroupCard({ g, max, baseCurrency }) {
  const pct = max > 0 ? Math.max(2, (g.base / max) * 100) : 0;
  return (
    <div className="rounded-2xl p-3.5 bg-paper border" style={{ borderColor: 'rgba(var(--line-rgb),0.1)' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-display font-semibold text-ink text-sm truncate">{g.label}</p>
        <p className="font-mono text-xs text-ink shrink-0">{fmtMoney(g.base, baseCurrency)}</p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(var(--line-rgb),0.12)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colorVar(g.color) }} />
      </div>
      <p className="font-mono text-xs text-ink mt-1.5" style={{ opacity: 0.45 }}>
        {g.count} {g.count === 1 ? 'gasto' : 'gastos'}
        {g.unconverted.length > 0 ? ` · ${g.unconverted.length} sin convertir` : ''}
      </p>
    </div>
  );
}

// --- vista -----------------------------------------------------------------

function ExpensesView({ data, destinations, openAdd, openEdit, onDelete }) {
  const [groupBy, setGroupBy] = useState('categoria');
  const [catFilter, setCatFilter] = useState('todas');

  const trip = data.trip;
  const expenses = data.expenses;
  const today = useMemo(() => isoToday(), []);

  const summary = useMemo(() => computeSummary(trip, expenses, today), [trip, expenses, today]);
  const { budget } = summary;

  const sorted = useMemo(
    () => [...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [expenses]
  );

  const catKeysUsed = useMemo(() => {
    const used = new Set(expenses.map((e) => e.category || 'otro'));
    return Object.keys(EXPENSE_CATEGORIES).filter((k) => used.has(k));
  }, [expenses]);

  const visible = catFilter === 'todas' ? sorted : sorted.filter((e) => (e.category || 'otro') === catFilter);

  const groups = useMemo(() => {
    if (groupBy === 'categoria') {
      return groupTotals(expenses, budget, (e) => e.category || 'otro').map((g) => ({
        ...g, label: catOf(g.key).label, color: catOf(g.key).color,
      }));
    }
    return groupTotals(expenses, budget, (e) => e.destId || '__none').map((g) => {
      const dest = destinations.find((d) => d.id === g.key);
      return {
        ...g,
        label: g.key === '__none' ? 'Sin destino' : dest?.name || 'Destino eliminado',
        // 'sky' y no 'ink' para el grupo sin destino: una barra fina en
        // var(--ink) sería invisible sobre el fondo oscuro.
        color: dest?.color || 'sky',
      };
    });
  }, [groupBy, expenses, budget, destinations]);

  // Un gasto se registra cuando se paga, así que por defecto se fecha hoy;
  // antes de que empiece el viaje, el primer día del viaje.
  const defaultDate = trip.startDate && today < trip.startDate ? trip.startDate : today;
  const newExpense = () => ({
    amount: '',
    currency: budget.baseCurrency,
    category: 'comida',
    date: defaultDate,
    note: '',
    destId: destinations[0]?.id || '',
  });

  const unconvertedCurrencies = [...new Set(summary.unconverted.map((e) => e.currency || '?'))];
  const openBudget = () => openEdit('budget', trip);

  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
      <SectionHeader title="Gastos" addLabel="Añadir gasto" onAdd={() => openAdd('expense', newExpense())} />
      <SummaryCard summary={summary} onEditBudget={openBudget} />
      <PaceRow summary={summary} />

      {summary.unconverted.length > 0 && (
        <ConversionWarning count={summary.unconverted.length} currencies={unconvertedCurrencies} onEditBudget={openBudget} />
      )}

      {expenses.length === 0 ? (
        <>
          <EmptyState icon={Wallet} title="Sin gastos registrados" subtitle="Añade el primero para empezar a seguir el presupuesto del viaje" />
          <button onClick={() => openAdd('expense', newExpense())}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed text-sm font-semibold text-ink" style={{ borderColor: 'rgba(var(--line-rgb),0.2)', opacity: 0.7 }}>
            <Plus size={15} /> Añadir gasto
          </button>
        </>
      ) : (
        <>
          <div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3">
              {[['categoria', 'Por categoría'], ['destino', 'Por destino']].map(([k, label]) => (
                <button key={k} onClick={() => setGroupBy(k)} className={`chip ${groupBy === k ? 'active' : ''}`}>{label}</button>
              ))}
            </div>
            <div className="space-y-2.5">
              {groups.map((g) => (
                <GroupCard key={g.key} g={g} max={groups[0]?.base || 0} baseCurrency={budget.baseCurrency} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-bold text-ink">Movimientos</h2>
              <span className="font-mono text-xs text-ink" style={{ opacity: 0.45 }}>{visible.length}/{expenses.length}</span>
            </div>
            {catKeysUsed.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3">
                {[['todas', 'Todas'], ...catKeysUsed.map((k) => [k, catOf(k).label])].map(([k, label]) => (
                  <button key={k} onClick={() => setCatFilter(k)} className={`chip ${catFilter === k ? 'active' : ''}`}>{label}</button>
                ))}
              </div>
            )}
            <div className="space-y-2.5">
              {visible.map((e) => (
                <ExpenseRow key={e.id} e={e} budget={budget} destName={destinations.find((d) => d.id === e.destId)?.name}
                  onEdit={() => openEdit('expense', e)} onDelete={() => onDelete('expenses', e.id)} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { ExpensesView };
