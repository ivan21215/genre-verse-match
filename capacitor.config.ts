
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c3d979e154114a67b6893bdbf985a60c',
  appName: 'VibeVerse',
  webDir: 'dist',
  server: {
    url: 'https://c3d979e1-5411-4a67-b689-3bdbf985a60c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      includePermissionRequests: true,
      permissions: {
        android: {
          locationAccuracy: "high",
          locationWhenInUse: "true"
        },
        ios: {
          locationWhenInUse: "This app needs your location to find venues near you"
        }
      }
    }
  }
};

export default config;
