"use client";

import { useEffect, useState } from "react";

/**
 * Persist a piece of state to localStorage. SSR-safe: returns `initial` on the
 * first render, then hydrates from storage on the client.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
    setHydrated(true);
  }, [key]);

  // Persist on change (after hydration so we don't overwrite stored value with
  // the SSR initial on first paint).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore.
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
