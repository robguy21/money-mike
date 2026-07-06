import {useEffect} from 'react'
import LandingPage from "./pages/LandingPage.jsx";

function App() {
    useEffect(() => {
        const appId = import.meta.env.VITE_OS_APP_ID;
        const safariWebId = import.meta.env.VITE_OS_SAFARI_ID;
        // Only the app id is required. safari_web_id is desktop-Safari-only, so a
        // missing one must not disable push for everyone else.
        if (!appId) return;

        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        document.body.appendChild(script);

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function (OneSignal) {
            await OneSignal.init({
                appId,
                ...(safariWebId && {safari_web_id: safariWebId}),
                // Give OneSignal's worker its own scope so the vite-plugin-pwa
                // (Workbox) worker at "/" can't overwrite it and kill the
                // push subscription.
                serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
                serviceWorkerParam: {scope: '/push/onesignal/'},
                notifyButton: {
                    enable: true,
                },
            });
        });
    }, []);

  return (
      <main>
          <LandingPage />
      </main>
  )
}

export default App
