import { detectCapacitor } from "@/hooks/use-capacitor";

let isCapacitorInitialized = false;

/**
 * Initialize Capacitor native plugins when running inside the Android APK.
 * Safe to call from the browser — silently no-ops if not in Capacitor.
 */
export async function initCapacitor(): Promise<void> {
  if (!detectCapacitor()) return;
  if (isCapacitorInitialized) return;
  isCapacitorInitialized = true;

  try {
    // Dynamic imports so these never load in the web bundle
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { SplashScreen } = await import("@capacitor/splash-screen");
    const { App } = await import("@capacitor/app");

    // Transparent dark status bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0e1a" });

    // Hide splash quickly — 500 ms is enough for the WebView to render
    setTimeout(() => {
      SplashScreen.hide({ fadeOutDuration: 200 });
    }, 500);

    // Handle Android hardware back button cleanly
    App.addListener("backButton", ({ canGoBack }) => {
      // If an input is focused, dismiss keyboard gracefully without navigating
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
        active.blur();
        return;
      }

      // Only navigate back if we're on a sub-route, otherwise exit gracefully
      const hash = window.location.hash || "";
      if (hash && hash !== "#/" && hash !== "#" && canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn("[CursedFitness] Capacitor init skipped:", err);
  }
}
