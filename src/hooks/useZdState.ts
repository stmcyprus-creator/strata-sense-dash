import { useCallback, useEffect, useState } from "react";
import { SEED } from "@/lib/zdSeed";
import { ZdCell, ZdState, cellKey } from "@/lib/zdTypes";

const KEY = "zd-state-v1";

const load = (): ZdState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    if (!parsed?.objects || !parsed?.trades || !parsed?.cells) return SEED;
    return parsed as ZdState;
  } catch {
    return SEED;
  }
};

export const useZdState = () => {
  const [state, setState] = useState<ZdState>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const updateCell = useCallback((oid: string, tid: string, next: ZdCell) => {
    setState((s) => ({ ...s, cells: { ...s.cells, [cellKey(oid, tid)]: next } }));
  }, []);

  const reset = useCallback(() => setState(SEED), []);

  return { state, updateCell, reset };
};
