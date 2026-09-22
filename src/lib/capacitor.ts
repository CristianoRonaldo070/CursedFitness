import { detectCapacitor } from "@/hooks/use-capacitor";

/**
 * Initialize Capacitor native plugins when running inside the Android APK.
 * Safe to call from the browser — silently no-ops if not in Capacitor.
 */
export async function initCapacitor(): Promise<void> {
  if (!detectCapacitor()) return;

  try {
    // Dynamic imports so these never load in the web bundle
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { SplashScreen } = await import("@capacitor/splash-screen");
    const { App } = await import("@capacitor/app");

    // Transparent dark status bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0e1a" });

    // Hide splash after 1.5 s
    setTimeout(() => {
      SplashScreen.hide({ fadeOutDuration: 300 });
    }, 1500);

    // Handle Android hardware back button
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn("[CursedFitness] Capacitor init skipped:", err);
  }
}
