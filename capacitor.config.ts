import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8d8ac7906b4b4d8c8ab8440689a2ab89',
  appName: 'KeyDirect.ca',
  webDir: 'dist',
  server: {
    url: 'https://8d8ac790-6b4b-4d8c-8ab8-440689a2ab89.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
