const PIN_STORAGE_KEY = 'binance_app_pin';
const AUTH_EXPIRY_KEY = 'binance_app_auth_expiry';
const DEFAULT_PIN = process.env.NEXT_PUBLIC_APP_PIN || '1234';

export function getStoredPin(): string {
  if (typeof window === 'undefined') return DEFAULT_PIN;
  return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
}

export function setCustomPin(newPin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_STORAGE_KEY, newPin);
}

export function verifyPin(enteredPin: string): boolean {
  const currentPin = getStoredPin();
  return enteredPin === currentPin;
}

export function saveAuthSession(remember: boolean = true): void {
  if (typeof window === 'undefined') return;
  // 30 days if remember, otherwise 8 hours
  const durationMs = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const expiry = Date.now() + durationMs;
  localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
}

export function isSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}
