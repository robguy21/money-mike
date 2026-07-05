import {useEffect, useRef, useState} from 'react';
import {formatRand} from '../lib/verdict.js';

export default function SpendModal({item, onConfirm, onCancel}) {
    const [amount, setAmount] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onCancel]);

    const used = item.used || 0;
    const remaining = Math.max(0, item.amount - used);
    const value = Number(amount);
    const valid = amount !== '' && value > 0;

    const submit = (e) => {
        e.preventDefault();
        if (valid) onConfirm(value);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="spend-title"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <p className="modal__eyebrow">Budget · {item.name}</p>
                <h2 className="modal__title" id="spend-title">I've spent money</h2>
                <p className="modal__body">
                    {formatRand(used)} of {formatRand(item.amount)} spent so far —{' '}
                    {formatRand(remaining)} left.
                </p>

                <form className="modal__form" onSubmit={submit}>
                    <label className="modal__label" htmlFor="spend-amount">
                        How much did you just spend?
                    </label>
                    <input
                        id="spend-amount"
                        ref={inputRef}
                        className="modal__input"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button type="submit" className="btn btn--primary btn--block" disabled={!valid}>
                        Add spend
                    </button>
                </form>

                <button type="button" className="modal__cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
