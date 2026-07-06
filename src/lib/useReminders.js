import {useCallback, useEffect, useState} from 'react';

// Queue a callback to run once the OneSignal SDK is ready. Safe to call before
// or after init — OneSignalDeferred flushes queued callbacks with the instance.
const withOneSignal = (fn) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(fn);
};

/**
 * Tracks whether push reminders are on, off, or blocked, and exposes controls
 * to opt in/out. Status values:
 *   'loading'     — SDK not ready yet
 *   'unavailable' — OneSignal isn't configured (no app id)
 *   'on'          — permission granted and opted in
 *   'off'         — can be turned on (not yet asked, or opted out)
 *   'blocked'     — permission denied at the OS/browser level (needs settings)
 */
export function useReminders() {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!import.meta.env.VITE_OS_APP_ID) {
            setStatus('unavailable');
            return;
        }

        let detach = () => {};
        withOneSignal((OneSignal) => {
            const sync = () => {
                const denied =
                    typeof Notification !== 'undefined' && Notification.permission === 'denied';
                const optedIn = OneSignal.User?.PushSubscription?.optedIn;
                const granted = OneSignal.Notifications?.permission;

                if (denied) setStatus('blocked');
                else if (optedIn && granted) setStatus('on');
                else setStatus('off');
            };

            sync();
            OneSignal.Notifications.addEventListener('permissionChange', sync);
            OneSignal.User.PushSubscription.addEventListener('change', sync);
            detach = () => {
                OneSignal.Notifications.removeEventListener('permissionChange', sync);
                OneSignal.User.PushSubscription.removeEventListener('change', sync);
            };
        });

        return () => detach();
    }, []);

    const enable = useCallback(() => {
        withOneSignal(async (OneSignal) => {
            try {
                await OneSignal.Notifications.requestPermission();
                await OneSignal.User.PushSubscription.optIn();
            } catch (e) {
                console.error('Could not enable reminders', e);
            }
        });
    }, []);

    const disable = useCallback(() => {
        withOneSignal(async (OneSignal) => {
            try {
                await OneSignal.User.PushSubscription.optOut();
            } catch (e) {
                console.error('Could not disable reminders', e);
            }
        });
    }, []);

    return {status, enable, disable};
}
