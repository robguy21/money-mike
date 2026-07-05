import {useState} from 'react';
import {formatRand} from '../lib/verdict.js';

function DetailGroup({title, rows}) {
    if (!rows || rows.length === 0) return null;
    return (
        <div className="month-detail__group">
            <p className="month-detail__group-title">{title}</p>
            <ul className="month-detail__list">
                {rows.map((row) => (
                    <li key={row.id} className="month-detail__row">
                        <span className="month-detail__name">{row.name}</span>
                        <span className="month-detail__figure">{row.figure}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MonthDetail({expenses}) {
    if (!expenses) {
        return <p className="month-detail__empty">No expense detail was saved for this month.</p>;
    }

    const planned = (expenses.planned ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        figure: formatRand(e.amount),
    }));
    const budgeted = (expenses.budgeted ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        figure: `${formatRand(e.used || 0)} of ${formatRand(e.amount)}`,
    }));
    const spent = (expenses.past ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        figure: formatRand(e.amount),
    }));

    if (planned.length === 0 && budgeted.length === 0 && spent.length === 0) {
        return <p className="month-detail__empty">This month had no logged expenses.</p>;
    }

    return (
        <div className="month-detail">
            <DetailGroup title="Spent" rows={spent}/>
            <DetailGroup title="Budgeted" rows={budgeted}/>
            <DetailGroup title="Planned" rows={planned}/>
        </div>
    );
}

export default function MonthHistory({history}) {
    const [openId, setOpenId] = useState(null);

    return (
        <div className="month-history">
            {history.map((month) => {
                const isOpen = openId === month.id;
                return (
                    <div key={month.id} className="month-history__item">
                        <button
                            type="button"
                            className="month-history__summary"
                            aria-expanded={isOpen}
                            onClick={() => setOpenId(isOpen ? null : month.id)}
                        >
                            <span className="month-history__head">
                                <span className="month-history__label">{month.label}</span>
                                <span className="month-history__meta">
                                    Spent{' '}
                                    <span className="month-history__meta-figure">{formatRand(month.spent)}</span>
                                    {' · '}tap to {isOpen ? 'hide' : 'view'}
                                </span>
                            </span>
                            <span className="month-history__right">
                                <span className="month-history__grade" data-tier={month.tier}>
                                    {month.grade}
                                </span>
                                <span className="month-history__amount">{formatRand(month.endingBalance)}</span>
                            </span>
                        </button>

                        {isOpen && <MonthDetail expenses={month.expenses}/>}
                    </div>
                );
            })}
        </div>
    );
}
