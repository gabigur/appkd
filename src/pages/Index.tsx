import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { initPushNotifications } from '@/lib/push-notifications';

const KEYDIRECT_URL = 'https://keydirect.ca';

const Index = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initPushNotifications();
    }
  }, []);

  // On native, the Capacitor server config loads keydirect.ca directly
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  // On web, show a simple landing with link to the site and admin
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <img
        src="/keydirect-logo-full.jpg"
        alt="KeyDirect Logo"
        className="h-20 w-auto mb-8 rounded-lg"
      />
      <h1 className="text-2xl font-bold text-foreground mb-2">KeyDirect Mobile App</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        This is the companion app for KeyDirect.ca. Download the mobile app to get the full experience with push notifications.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={KEYDIRECT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition"
        >
          Visit KeyDirect.ca →
        </a>
        <a
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition"
        >
          Admin Dashboard
        </a>
      </div>
    </div>
  );
};

export default Index;
