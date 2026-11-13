import { getSettings } from './settings.ts';

/** Short vibration on phones that support it. Respects the Settings switch. */
export function buzz(pattern: number | number[]): void {
  if (!getSettings().haptics) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
