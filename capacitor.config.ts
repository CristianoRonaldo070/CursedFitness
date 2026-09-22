import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cursedfitness.app",
  appName: "CursedFitness",
  webDir: "capacitor-app",
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#0a0e1a",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0e1a",
    },
  },
  android: {
    backgroundColor: "#0a0e1a",
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  // The SSR app is loaded from the deployed server URL.
  // Update this URL to your actual deployment before building the APK.
  server: {
    androidScheme: "https",
    // Uncomment and set this to your deployed URL for production APK:
    // url: "https://your-deployed-cursed-fitness.pages.dev",
    cleartext: true,
  },
};

export default config;
