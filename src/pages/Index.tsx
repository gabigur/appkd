import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { initPushNotifications } from '@/lib/push-notifications';

const KEYDIRECT_URL = 'https://keydirect.ca';

const Index = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Initialize push notifications on native platforms
    if (Capacitor.isNativePlatform()) {
      initPushNotifications();
    }
  }, []);

  // On native, the Capacitor server config loads keydirect.ca directly
  // On web preview, we show a preview message with iframe
  if (Capacitor.isNativePlatform()) {
    // On native, this won't actually render since the server URL points to keydirect.ca
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Banner for web preview */}
      <div className="bg-primary px-4 py-3 text-center">
        <p className="text-sm font-medium text-primary-foreground">
          📱 KeyDirect Mobile App Preview — 
          <a href="/admin" className="underline font-bold ml-1">
            Go to Admin Dashboard →
          </a>
        </p>
      </div>

      {/* WebView preview */}
      <iframe
        ref={iframeRef}
        src={KEYDIRECT_URL}
        className="flex-1 w-full border-none"
        style={{ minHeight: 'calc(100vh - 48px)' }}
        title="KeyDirect.ca"
        allow="payment; geolocation"
      />
    </div>
  );
};

export default Index;
