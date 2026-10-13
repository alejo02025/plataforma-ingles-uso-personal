import { assetBase } from '../workspace';
const key = `${assetBase}:app-refresh`;
export const refreshEvent = 'study-app-refresh';
export function readRefresh() {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}
export function requestRefresh(token: string) {
  try {
    localStorage.setItem(key, token);
  } catch {}
  window.dispatchEvent(new Event(refreshEvent));
}
export function isRefreshStorage(event: StorageEvent) {
  return event.key === key;
}
export function refreshedLink(href: string, token: string) {
  return token ? `${href}?updated=${encodeURIComponent(token)}` : href;
}
