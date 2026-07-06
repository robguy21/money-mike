import {useReminders} from '../lib/useReminders.js';

export default function ReminderBanner() {
    const {status, enable} = useReminders();

    if (status === 'off') {
        return (
            <div className="reminder">
                <div className="reminder__text">
                    <p className="reminder__title">Want Mike to nag you?</p>
                    <p className="reminder__hint">Get a daily nudge to log your spending.</p>
                </div>
                <button type="button" className="btn btn--primary" onClick={enable}>
                    Turn on reminders
                </button>
            </div>
        );
    }

    if (status === 'blocked') {
        return (
            <div className="reminder reminder--blocked">
                <div className="reminder__text">
                    <p className="reminder__title">Reminders are switched off</p>
                    <p className="reminder__hint">
                        Notifications are blocked for Money Mike. Turn them back on in your
                        phone's Settings, then reopen the app.
                    </p>
                </div>
            </div>
        );
    }

    // 'on' | 'loading' | 'unavailable' — nothing to show.
    return null;
}
