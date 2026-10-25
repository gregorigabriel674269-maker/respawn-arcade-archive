import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

export type ThemePref = "dark" | "light" | "auto";
export type AccentPref = "lime" | "teal" | "amber" | "rose";
export type CardSize = "lg" | "md" | "sm";
export type LayoutPref = "normal" | "compact" | "minimal";

export type Prefs = {
  theme: ThemePref;
  accent: AccentPref;
  cardSize: CardSize;
  layout: LayoutPref;
  school: boolean;
  ultra: boolean;
};

const KEY = "respawn-prefs";
const EVENT = "respawn-prefs";

export const DEFAULT_PREFS: Prefs = {
  theme: "dark",
  accent: "lime",
  cardSize: "md",
  layout: "normal",
  school: false,
  ultra: false,
};

let cacheRaw = "";
let cache: Prefs = DEFAULT_PREFS;

function sanitize(value: unknown): Prefs {
  const raw = value && typeof value === "object" ? (value as Partial<Prefs>) : {};
  return {
    theme: raw.theme === "light" || raw.theme === "auto" || raw.theme === "dark" ? raw.theme : "dark",
    accent: raw.accent === "teal" || raw.accent === "amber" || raw.accent === "rose" || raw.accent === "lime" ? raw.accent : "lime",
    cardSize: raw.cardSize === "lg" || raw.cardSize === "sm" || raw.cardSize === "md" ? raw.cardSize : "md",
    layout: raw.layout === "compact" || raw.layout === "minimal" || raw.layout === "normal" ? raw.layout : "normal",
    school: Boolean(raw.school),
    ultra: Boolean(raw.ultra),
  };
}

export function subscribePrefs(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      cacheRaw = "";
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getPrefsSnapshot(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const raw = localStorage.getItem(KEY) ?? "";
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  if (!raw) {
    cache = DEFAULT_PREFS;
    return cache;
  }
  try {
    cache = sanitize(JSON.parse(raw));
  } catch {
    cache = DEFAULT_PREFS;
  }
  return cache;
}

export function getServerPrefsSnapshot(): Prefs {
  return DEFAULT_PREFS;
}

export function updatePrefs(patch: Partial<Prefs>) {
  const next = sanitize({ ...getPrefsSnapshot(), ...patch });
  const raw = JSON.stringify(next);
  localStorage.setItem(KEY, raw);
  cacheRaw = raw;
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

const PrefsContext = createContext<Prefs>(DEFAULT_PREFS);

function resolvedTheme(theme: ThemePref): "dark" | "light" {
  if (theme === "auto" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return theme === "light" ? "light" : "dark";
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const prefs = useSyncExternalStore(subscribePrefs, getPrefsSnapshot, getServerPrefsSnapshot);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = resolvedTheme(prefs.theme);
      root.dataset.accent = prefs.accent;
      root.dataset.school = prefs.school ? "on" : "off";
      root.dataset.ultra = prefs.school && prefs.ultra ? "on" : "off";
      root.dataset.layout = prefs.layout;
      root.dataset.cards = prefs.cardSize;
    };
    apply();
    if (prefs.theme !== "auto") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs]);
  return <PrefsContext.Provider value={prefs}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  return useContext(PrefsContext);
}
