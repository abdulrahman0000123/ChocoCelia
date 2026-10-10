"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemeToggle({ locale = 'en', className = '' }: { locale?: string; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const isDark = mounted && resolvedTheme === 'dark';
  const label = locale === 'ar'
    ? (isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن')
    : (isDark ? 'Switch to light mode' : 'Switch to dark mode');

  return (
    <button type="button" disabled={!mounted || !resolvedTheme} onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label} title={label} aria-pressed={isDark}
      className={`flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded-full border border-border bg-surface text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:cursor-wait ${className}`}>
      {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}
