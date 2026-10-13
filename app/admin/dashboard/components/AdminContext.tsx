'use client';
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
export type AdminLocale = 'ar' | 'en';
const localeKey = 'choco-admin-locale';
const subscribe = (listener: () => void) => {
  window.addEventListener('storage', listener); window.addEventListener('admin-locale', listener);
  return () => { window.removeEventListener('storage', listener); window.removeEventListener('admin-locale', listener); };
};
let tabLocale: AdminLocale | null = null;
const snapshot = (): AdminLocale => { try { const saved = localStorage.getItem(localeKey); return saved === 'en' || saved === 'ar' ? saved : tabLocale ?? 'ar'; } catch { return tabLocale ?? 'ar'; } };
const serverSnapshot = (): AdminLocale => 'ar';
type AdminValue = {locale:AdminLocale;ar:boolean;setLocale:(locale:AdminLocale)=>void;t:(arabic:string,english:string)=>string};
const AdminContext = createContext<AdminValue>({locale:'ar',ar:true,setLocale:()=>{},t:arabic=>arabic});
export function AdminProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const setLocale = (value: AdminLocale) => { tabLocale = value; try { localStorage.setItem(localeKey, value); } catch {} window.dispatchEvent(new Event('admin-locale')); };
  return <AdminContext.Provider value={{ locale, ar: locale === 'ar', setLocale, t: (a, e) => locale === 'ar' ? a : e }}>{children}</AdminContext.Provider>;
}
export const useAdmin = () => useContext(AdminContext);
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.status === 401) window.dispatchEvent(new Event('admin-session-expired'));
  return response;
}
export function adminError(error: unknown, ar: boolean) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'Unauthorized') return ar ? 'انتهت جلسة الدخول. سجّل الدخول للمتابعة.' : 'Your session expired. Sign in to continue.';
  if (message.startsWith('Conflict:')) return ar ? 'تم تعديل الطلب. حدّث البيانات قبل الحفظ.' : 'Order changed. Refresh before saving.';
  if (message.startsWith('Invalid price revision after collection')) return ar ? 'لا يمكن تغيير قيمة طلب بدأ تحصيله. سجّل استردادًا بدل تغيير قيمة البيع.' : 'An order with collections cannot be repriced. Record a refund instead.';
  if (message.startsWith('Invalid collection or refund')) return ar ? 'المحصل لا يتجاوز قيمة الطلب، والمسترد لا يتجاوز المحصل.' : 'Receipts cannot exceed the order total; refunds cannot exceed receipts.';
  if (message.startsWith('Invalid revision reason')) return ar ? 'أدخل سبب التغيير من ٣ إلى ٥٠٠ حرف.' : 'Enter a revision reason between 3 and 500 characters.';
  if (message.startsWith('Invalid ')) return ar ? 'راجع القيم المدخلة وحدود التحصيل والاسترداد قبل الحفظ.' : 'Check the entered values and collection/refund limits before saving.';
  return ar ? 'تعذر إتمام العملية. حاول مرة أخرى.' : 'Could not complete the request. Please retry.';
}
