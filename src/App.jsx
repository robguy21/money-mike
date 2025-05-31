import {useEffect, useState} from 'react'
import LandingPage from "./pages/LandingPage.jsx";

function App() {
    useEffect(() => {
        if (import.meta.env.VITE_OS_APP_ID && import.meta.env.VITE_OS_SAFARI_ID) {
            const script = document.createElement('script');
            script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
            script.defer = true;
            document.body.appendChild(script);

            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async function (OneSignal) {
                await OneSignal.init({
                    appId: import.meta.env.VITE_OS_APP_ID,
                    safari_web_id: import.meta.env.VITE_OS_SAFARI_ID,
                    notifyButton: {
                        enable: true,
                    },
                });
            });
        }
    }, []);

  return (
      <div>
          <LandingPage />
      </div>
  )
}

export default App
