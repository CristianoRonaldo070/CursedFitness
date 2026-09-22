import { useState, useEffect } from "react";

/**
 * Detects whether the app is running inside a Capacitor native shell (Android APK).
 * Returns `true` when in the native app, `false` in a regular browser.
 */
export function useIsCapacitor(): boolean {
  const [isNative, setIsNative] = useState(() => detectCapacitor());

  useEffect(() => {
    // Re-check after hydration (SSR → client)
    setIsNative(detectCapacitor());
  }, []);

  return isNative;
}

/**
 * Synchronous detection — safe to call anywhere.
 * Capacitor injects `window.Capacitor` into the WebView.
 */
export function detectCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

/**
 * Returns the native platform name ("android" | "ios" | "web").
 */
export function getCapacitorPlatform(): string {
  if (typeof window === "undefined") return "web";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  return cap?.getPlatform?.() ?? "web";
}
