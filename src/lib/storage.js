import {v4} from 'uuid';
import {verdictFor} from './verdict.js';

const LOCAL_STORAGE_KEY = 'money-mike-state';
export const STATE_VERSION = 3;

/**
 * A fresh, empty month — used when the friend ends a month and starts over.
 */
export function freshCurrent() {
    return {
        availableBalance: 0,
        balanceUpdatedAt: null,
        futureExpenses: [],
        budgetedExpenses: [],
        pastExpenses: [],
        startedAt: new Date().toISOString(),
    };
}

/**
 * Carry the recurring bits of a month forward: keep the planned and budgeted
 * items (reset so nothing reads as paid/used yet), drop everything spent and
 * the old bank balance. New ids so archived months stay independent.
 */
export function carryOverCurrent(previous) {
    return {
        availableBalance: 0,
        balanceUpdatedAt: null,
        futureExpenses: previous.futureExpenses.map(e => ({...e, id: v4(), paid: false})),
        budgetedExpenses: previous.budgetedExpenses.map(e => ({...e, id: v4(), used: 0, paid: false})),
        pastExpenses: [],
        startedAt: new Date().toISOString(),
    };
}

/**
 * First-run demo data so the app isn't a blank page on install.
 */
function seededCurrent() {
    return {
        availableBalance: 2000,
        balanceUpdatedAt: new Date().toISOString(),
        futureExpenses: [
            {id: v4(), name: 'Dog Walker', amount: 500, date: 3, paid: false},
            {id: v4(), name: 'Insurance', amount: 500, date: 15, paid: false},
        ],
        budgetedExpenses: [
            {id: v4(), name: 'New Shoes', amount: 500, used: 0, paid: false},
        ],
        pastExpenses: [
            {id: v4(), name: 'Groceries', amount: 1000, date: 10},
        ],
        startedAt: new Date().toISOString(),
    };
}

export function defaultState() {
    return {version: STATE_VERSION, current: seededCurrent(), history: []};
}

/**
 * Normalise any stored `current` into the latest shape, backfilling fields
 * added in later versions (balanceUpdatedAt in v3).
 */
function normaliseCurrent(current = {}) {
    return {
        availableBalance: current.availableBalance ?? 0,
        balanceUpdatedAt: current.balanceUpdatedAt ?? null,
        futureExpenses: current.futureExpenses ?? [],
        budgetedExpenses: current.budgetedExpenses ?? [],
        pastExpenses: current.pastExpenses ?? [],
        startedAt: current.startedAt ?? new Date().toISOString(),
    };
}

/**
 * Bring any older stored shape up to the current version.
 *   v1 — flat object, balances at the top level, no history.
 *   v2 — { current, history }, but no balanceUpdatedAt and no per-month
 *        expense snapshots (those months simply won't expand).
 */
function migrate(stored) {
    if (!stored || typeof stored !== 'object') return defaultState();

    // v1 (or unversioned): flat shape → wrap into `current`.
    if (!stored.version || stored.version === 1) {
        return {
            version: STATE_VERSION,
            current: normaliseCurrent({
                availableBalance: stored.availableBalance,
                futureExpenses: stored.futureExpenses,
                budgetedExpenses: stored.budgetedExpenses,
                pastExpenses: stored.pastExpenses,
                startedAt: new Date().toISOString(),
            }),
            history: [],
        };
    }

    // v2 and v3: reshape current, keep history as-is (older entries may lack
    // an `expenses` snapshot, which the UI handles gracefully).
    return {
        version: STATE_VERSION,
        current: normaliseCurrent(stored.current),
        history: Array.isArray(stored.history) ? stored.history : [],
    };
}

export function loadState() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? migrate(JSON.parse(raw)) : defaultState();
    } catch (e) {
        console.error('Failed to load from localStorage', e);
        return defaultState();
    }
}

export function saveState(state) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save to localStorage', e);
    }
}

/**
 * The spendable truth: bank balance minus what's still owed on unpaid planned
 * expenses and unspent-but-committed budget.
 */
export function calculateActualBalance(available, future, budgeted) {
    const unpaidFuture = future
        .filter(e => !e.paid)
        .reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = budgeted
        .filter(e => !e.paid)
        .reduce((sum, e) => sum + (e.amount - e.used), 0);
    return available - unpaidFuture - remainingBudget;
}

function monthLabel(isoString) {
    const date = isoString ? new Date(isoString) : new Date();
    return new Intl.DateTimeFormat('en-ZA', {month: 'long', year: 'numeric'}).format(date);
}

/**
 * Build the report-card entry for the month being closed, including a full
 * snapshot of that month's expenses so it can be reviewed later.
 */
export function summariseMonth(current) {
    const endingBalance = calculateActualBalance(
        current.availableBalance,
        current.futureExpenses,
        current.budgetedExpenses,
    );
    const spent =
        current.futureExpenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0) +
        current.pastExpenses.reduce((sum, e) => sum + e.amount, 0) +
        current.budgetedExpenses.reduce((sum, e) => sum + (e.used || 0), 0);
    const verdict = verdictFor(endingBalance);

    return {
        id: v4(),
        label: monthLabel(new Date().toISOString()),
        closedAt: new Date().toISOString(),
        endingBalance,
        spent,
        tier: verdict.tier,
        grade: verdict.grade,
        expenses: {
            planned: current.futureExpenses.map(e => ({...e})),
            budgeted: current.budgetedExpenses.map(e => ({...e})),
            past: current.pastExpenses.map(e => ({...e})),
        },
    };
}
