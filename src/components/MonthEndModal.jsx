import {useEffect, useRef} from 'react';

export default function MonthEndModal({verdict, onStartFresh, onUseLastMonth, onCancel}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        dialogRef.current?.focus();
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onCancel]);

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="month-end-title"
                tabIndex={-1}
                ref={dialogRef}
                onClick={(e) => e.stopPropagation()}
            >
                <p className="modal__eyebrow">Wrapping up</p>
                <h2 className="modal__title" id="month-end-title">Start a new month</h2>
                <p className="modal__body">
                    Mike files this month on your report card
                    {verdict ? <> as “<strong>{verdict.grade}</strong>”</> : null}. How do you
                    want to begin the next one?
                </p>

                <div className="modal__choices">
                    <button type="button" className="modal__choice modal__choice--primary" onClick={onUseLastMonth}>
                        <span className="modal__choice-title">Use last month</span>
                        <span className="modal__choice-hint">
                            Keep your planned &amp; budgeted items, clear what was spent
                        </span>
                    </button>
                    <button type="button" className="modal__choice" onClick={onStartFresh}>
                        <span className="modal__choice-title">Start fresh</span>
                        <span className="modal__choice-hint">
                            Empty everything and begin from scratch
                        </span>
                    </button>
                </div>

                <button type="button" className="modal__cancel" onClick={onCancel}>
                    Not yet
                </button>
            </div>
        </div>
    );
}
