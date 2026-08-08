"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/lib/store/demoStore";

/** Marks Zustand persist hydration complete and refreshes /me when a token exists. */
export function StoreHydration() {
  const hydrated = useDemoStore((s) => s.hydrated);
  const token = useDemoStore((s) => s.token);
  const setHydrated = useDemoStore((s) => s.setHydrated);
  const refreshMe = useDemoStore((s) => s.refreshMe);

  useEffect(() => {
    const finish = () => setHydrated(true);

    if (useDemoStore.persist.hasHydrated()) {
      finish();
      return undefined;
    }

    const unsub = useDemoStore.persist.onFinishHydration(finish);
    // Fallback if persist callback never fires (e.g. storage blocked).
    const timer = window.setTimeout(finish, 500);
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated && token) {
      void refreshMe();
    }
  }, [hydrated, token, refreshMe]);

  return null;
}
