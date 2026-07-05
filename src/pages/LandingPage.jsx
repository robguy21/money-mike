import {useEffect, useMemo, useState} from 'react';
import ExpenseList from '../components/ExpenseList.jsx';
import MonthHistory from '../components/MonthHistory.jsx';
import MonthEndModal from '../components/MonthEndModal.jsx';
import {formatRand, formatStamp, verdictFor} from '../lib/verdict.js';
import {
    loadState,
    saveState,
    calculateActualBalance,
    summariseMonth,
    freshCurrent,
    carryOverCurrent,
    STATE_VERSION,
} from '../lib/storage.js';

const sum = (items, key = 'amount') => items.reduce((total, item) => total + (item[key] || 0), 0);

export default function LandingPage() {
    const initialState = useMemo(loadState, []);
    const [current, setCurrent] = useState(initialState.current);
    const [history, setHistory] = useState(initialState.history);
    const [monthEndOpen, setMonthEndOpen] = useState(false);

    useEffect(() => {
        saveState({version: STATE_VERSION, current, history});
    }, [current, history]);

    const actualBalance = calculateActualBalance(
        current.availableBalance,
        current.futureExpenses,
        current.budgetedExpenses,
    );
    const verdict = verdictFor(actualBalance);
    const updatedStamp = formatStamp(current.balanceUpdatedAt);

    const setAvailableBalance = (value) =>
        setCurrent(c => ({
            ...c,
            availableBalance: Number(value),
            balanceUpdatedAt: new Date().toISOString(),
        }));

    const addFuture = (entry) =>
        setCurrent(c => ({...c, futureExpenses: [...c.futureExpenses, entry]}));

    const addBudget = (entry) =>
        setCurrent(c => ({...c, budgetedExpenses: [...c.budgetedExpenses, entry]}));

    // Add to a budget's spend, capped at the budgeted amount so the balance
    // math stays honest (an overspent budget can't free up phantom money).
    const addSpend = (id, amount) =>
        setCurrent(c => ({
            ...c,
            budgetedExpenses: c.budgetedExpenses.map(e =>
                e.id === id
                    ? {...e, used: Math.min(e.amount, Math.max(0, (e.used || 0) + amount))}
                    : e),
        }));

    // Mark an item paid in place (keeps it in its list so recurring planned
    // items survive into next month via "Use last month").
    const markPaid = (id, type) =>
        setCurrent(c => {
            const key = type === 'future' ? 'futureExpenses' : 'budgetedExpenses';
            return {
                ...c,
                [key]: c[key].map(e => (e.id === id ? {...e, paid: true} : e)),
            };
        });

    const removeItem = (id, type) =>
        setCurrent(c => {
            if (type === 'future') return {...c, futureExpenses: c.futureExpenses.filter(e => e.id !== id)};
            if (type === 'budget') return {...c, budgetedExpenses: c.budgetedExpenses.filter(e => e.id !== id)};
            return {...c, pastExpenses: c.pastExpenses.filter(e => e.id !== id)};
        });

    const finishMonth = (mode) => {
        const summary = summariseMonth(current);
        setHistory(h => [summary, ...h]);
        setCurrent(mode === 'carry' ? carryOverCurrent(current) : freshCurrent());
        setMonthEndOpen(false);
    };

    return (
        <div className="dashboard">
            <div className="dashboard__hero" data-tier={verdict.tier}>
                <p className="dashboard__eyebrow">Mike says</p>
                <h1 className="dashboard__verdict">{verdict.title}</h1>
                <span className="dashboard__figure">{formatRand(actualBalance)}</span>
            </div>

            <div className="dashboard__reality">
                <label className="dashboard__label" htmlFor="available-balance">
                    What your banking app says
                </label>
                <input
                    id="available-balance"
                    className="dashboard__reality-input"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={current.availableBalance === 0 ? '' : current.availableBalance}
                    onChange={(e) => setAvailableBalance(e.target.value)}
                />
                <p className="dashboard__stamp">
                    {updatedStamp ? `Updated ${updatedStamp}` : 'Not updated yet this month'}
                </p>
            </div>

            <section className="dashboard__section">
                <div className="dashboard__section-head">
                    <h2 className="dashboard__section-title">Planned</h2>
                    <span className="dashboard__section-total">{formatRand(sum(current.futureExpenses))}</span>
                </div>
                <ExpenseList
                    items={current.futureExpenses}
                    type="future"
                    onMarkPaid={markPaid}
                    onRemove={removeItem}
                    onAdd={addFuture}
                />
            </section>

            <section className="dashboard__section">
                <div className="dashboard__section-head">
                    <h2 className="dashboard__section-title">Budgeted</h2>
                    <span className="dashboard__section-total">{formatRand(sum(current.budgetedExpenses))}</span>
                </div>
                <ExpenseList
                    items={current.budgetedExpenses}
                    type="budget"
                    onMarkPaid={markPaid}
                    onRemove={removeItem}
                    onSpend={addSpend}
                    onAdd={addBudget}
                />
            </section>

            {current.pastExpenses.length > 0 && (
                <section className="dashboard__section dashboard__section--past">
                    <div className="dashboard__section-head">
                        <h2 className="dashboard__section-title">Already spent</h2>
                        <span className="dashboard__section-total">{formatRand(sum(current.pastExpenses))}</span>
                    </div>
                    <ExpenseList
                        items={current.pastExpenses}
                        type="past"
                        onRemove={removeItem}
                    />
                </section>
            )}

            <div className="dashboard__closer">
                <p className="dashboard__closer-hint">
                    Done for the month? Mike grades you and starts you fresh.
                </p>
                <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={() => setMonthEndOpen(true)}
                >
                    End month &amp; summarise
                </button>
            </div>

            {history.length > 0 && (
                <section className="dashboard__section">
                    <div className="dashboard__section-head">
                        <h2 className="dashboard__section-title">Mike's report card</h2>
                    </div>
                    <MonthHistory history={history}/>
                </section>
            )}

            {monthEndOpen && (
                <MonthEndModal
                    verdict={verdict}
                    onUseLastMonth={() => finishMonth('carry')}
                    onStartFresh={() => finishMonth('fresh')}
                    onCancel={() => setMonthEndOpen(false)}
                />
            )}
        </div>
    );
}
