import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Translations = Record<string, string>;

export interface I18nContextValue {
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
}

const I18N_STORAGE_KEY = "aos_settings";

const defaultTranslations: Translations = {
  "app.installed": "App Installed",
  "app.installed.desc": "Explore Sensei has been installed on your device",
  "app.update": "Update Available",
  "app.update.desc": "A new version of the app is available",
  "status.offline": "You're Offline",
  "status.online": "Back Online",
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function interpolate(input: string, params?: Record<string, string | number>): string {
  if (!params) return input;
  return input.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ""));
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>("en-US");
  const [translations, setTranslations] = useState<Translations>(defaultTranslations);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(I18N_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const saved = parsed?.locale as string | undefined;
        if (saved && typeof saved === "string") {
          setLocaleState(saved);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const lang = locale.toLowerCase();
        if (lang.startsWith("en")) {
          if (!cancelled) setTranslations(defaultTranslations);
          return;
        }
        // Future: dynamically import other locales
        if (!cancelled) setTranslations(defaultTranslations);
      } catch {
        if (!cancelled) setTranslations(defaultTranslations);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((next: string) => {
    setLocaleState(next);
    try {
      const raw = localStorage.getItem(I18N_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(I18N_STORAGE_KEY, JSON.stringify({ ...parsed, locale: next }));
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = translations[key] ?? key;
      return interpolate(value, params);
    },
    [translations],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t, setLocale }),
    [locale, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
