"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { DEFAULT_SETTINGS, db, getSettings } from "@/lib/db";
import type { Settings } from "@/types";

/** Settings reativas. Sempre devolve um objeto válido (cai no default). */
export function useSettings(): Settings {
  const value = useLiveQuery(
    async () => {
      // dispara um read na tabela kv para registrar dependência reativa
      await db.kv.get("settings");
      return getSettings();
    },
    [],
    DEFAULT_SETTINGS,
  );
  return value ?? DEFAULT_SETTINGS;
}
