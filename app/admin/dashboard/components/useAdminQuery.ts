'use client';
import { useSyncExternalStore } from 'react';
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener); window.addEventListener('admin-query', listener);
  return () => { window.removeEventListener('popstate', listener); window.removeEventListener('admin-query', listener); };
}
export function useAdminQuery() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => '');
  const update = (values: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    Object.entries(values).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new Event('admin-query'));
  };
  return { params: new URLSearchParams(search), update };
}
