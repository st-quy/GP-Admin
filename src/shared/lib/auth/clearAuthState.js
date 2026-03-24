import { ACCESS_TOKEN, REFRESH_TOKEN } from '@shared/lib/constants/auth';
import { removeStorageData } from '@shared/lib/storage';

const AUTH_KEYS = [ACCESS_TOKEN, REFRESH_TOKEN];

const clearBrowserCookies = () => {
  if (typeof document === 'undefined' || !document.cookie) return;

  document.cookie.split(';').forEach((cookie) => {
    const [rawName] = cookie.split('=');
    const cookieName = rawName?.trim();

    if (!cookieName) return;

    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
};

export const clearAuthState = () => {
  AUTH_KEYS.forEach((key) => removeStorageData(key));

  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  clearBrowserCookies();
};

export const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim() : email;
