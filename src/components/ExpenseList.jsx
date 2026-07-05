import {useState} from 'react';
import {v4} from 'uuid';
import {formatRand} from '../lib/verdict.js';
import {CheckIcon, TrashIcon, PlusIcon} from './icons.jsx';
import SpendModal from './SpendModal.jsx';

const EMPTY_COPY = {
    future: 'Nothing planned. Suspicious.',
    budget: 'No budgets yet. Live a little — carefully.',
    past: 'Nothing spent yet. Keep it that way.',
};

const emptyEntry = {name: '', amount: '', date: '', used: ''};

export default function ExpenseList({items, type, onMarkPaid, onRemove, onSpend, onAdd}) {
    const [newEntry, setNewEntry] = useState(emptyEntry);
    const [spendFor, setSpendFor] = useState(null);

    const canAdd = newEntry.name.trim() && newEntry.amount !== '';

    const handleAdd = () => {
        if (!canAdd) return;
        const entry = {
            id: v4(),
            name: newEntry.name.trim(),
            amount: Number(newEntry.amount),
            ...(type === 'future' && {date: Number(newEntry.date || 1), paid: false}),
            ...(type === 'budget' && {used: Number(newEntry.used || 0), paid: false}),
        };
        onAdd(entry);
        setNewEntry(emptyEntry);
    };

    return (
        <div className="expense-list">
            {items.length === 0 && (
                <p className="expense-empty">{EMPTY_COPY[type]}</p>
            )}

            {items.map(item => {
                const isBudget = type === 'budget';
                const used = item.used || 0;
                const pct = isBudget && item.amount > 0
                    ? Math.min(100, Math.round((used / item.amount) * 100))
                    : 0;

                return (
                    <div key={item.id} className={`expense${item.paid ? ' expense--paid' : ''}`}>
                        <div className="expense__row">
                            <span className="expense__name">{item.name}</span>
                            <span className="expense__amount">{formatRand(item.amount)}</span>
                        </div>

                        {isBudget && (
                            <div className="expense__progress" aria-hidden="true">
                                <span className="expense__progress-fill" style={{width: `${pct}%`}}/>
                            </div>
                        )}

                        <div className="expense__meta-row">
                            <span className="expense__meta">
                                {isBudget
                                    ? `${formatRand(used)} of ${formatRand(item.amount)} spent`
                                    : (item.date ? `Day ${item.date}` : '—')}
                            </span>

                            <span className="expense__actions">
                                {!item.paid && type !== 'past' && (
                                    <button
                                        type="button"
                                        className="expense__action expense__action--done"
                                        aria-label={`Mark ${item.name} as done`}
                                        onClick={() => onMarkPaid(item.id, type)}
                                    >
                                        <CheckIcon/>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="expense__action expense__action--remove"
                                    aria-label={`Remove ${item.name}`}
                                    onClick={() => onRemove(item.id, type)}
                                >
                                    <TrashIcon/>
                                </button>
                            </span>
                        </div>

                        {isBudget && !item.paid && (
                            <button
                                type="button"
                                className="expense__spend-btn"
                                onClick={() => setSpendFor(item)}
                            >
                                I've spent money
                            </button>
                        )}
                    </div>
                );
            })}

            {type !== 'past' && (
                <div className="expense-add">
                    <input
                        className="expense-add__name-input"
                        type="text"
                        placeholder="What is it?"
                        value={newEntry.name}
                        aria-label="New item name"
                        onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <div className="expense-add__row">
                        <span className="expense-add__field">
                            <input
                                type="number"
                                inputMode="numeric"
                                placeholder="R0"
                                value={newEntry.amount}
                                aria-label="Amount"
                                onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </span>
                        <span className="expense-add__field">
                            {type === 'future' ? (
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Day"
                                    value={newEntry.date}
                                    aria-label="Day of month"
                                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                            ) : (
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Used"
                                    value={newEntry.used}
                                    aria-label="Amount used"
                                    onChange={(e) => setNewEntry({...newEntry, used: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                            )}
                        </span>
                        <button
                            type="button"
                            className="expense-add__submit"
                            aria-label="Add item"
                            disabled={!canAdd}
                            onClick={handleAdd}
                        >
                            <PlusIcon/>
                        </button>
                    </div>
                </div>
            )}

            {spendFor && (
                <SpendModal
                    item={spendFor}
                    onConfirm={(amount) => {
                        onSpend(spendFor.id, amount);
                        setSpendFor(null);
                    }}
                    onCancel={() => setSpendFor(null)}
                />
            )}
        </div>
    );
}
