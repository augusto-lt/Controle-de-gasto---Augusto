"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "controle-gastos:last-category";

/**
 * Lembra a última categoria usada no quick-add (localStorage). Permite que
 * o usuário adicione gastos repetidos com 3 toques: abrir → digitar → salvar.
 */
export function useLastCategoryId(): [string | null, (id: string) => void] {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      // hidratação inicial vinda de localStorage (não acessível durante render
      // em SSR/hydration mismatch — set é seguro aqui).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setId(stored);
    } catch {
      // ignore
    }
  }, []);

  const remember = useCallback((next: string) => {
    setId(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return [id, remember];
}
