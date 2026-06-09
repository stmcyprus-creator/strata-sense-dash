import { useMemo, useState } from "react";
import { ZdCell, ZdObject, ZdState, ZdTrade, cellKey } from "@/lib/zdTypes";
import { fmtPct, fmtShort, fmtShortRub } from "@/lib/zdFormat";
import CellEditDialog from "./CellEditDialog";

interface Props {
  state: ZdState;
  onUpdateCell: (oid: string, tid: string, next: ZdCell) => void;
}

const statusBar: Record<string, string> = {
  done: "bg-[hsl(160_84%_39%)]",
  active: "bg-primary",
  planned: "bg-muted-foreground/40",
  na: "bg-transparent",
};

const MatrixTab = ({ state, onUpdateCell }: Props) => {
  const [editing, setEditing] = useState<{ o: ZdObject; t: ZdTrade } | null>(null);

  const totals = useMemo(() => {
    const perTrade: Record<string, { e: number; a: number }> = {};
    const perObject: Record<string, { e: number; a: number }> = {};
    for (const o of state.objects) {
      perObject[o.id] = { e: 0, a: 0 };
      for (const t of state.trades) {
        const c = state.cells[cellKey(o.id, t.id)];
        if (!c || c.status === "na") continue;
        perTrade[t.id] = perTrade[t.id] || { e: 0, a: 0 };
        perTrade[t.id].e += c.estimate;
        perTrade[t.id].a += c.actual;
        perObject[o.id].e += c.estimate;
        perObject[o.id].a += c.actual;
      }
    }
    const grand = Object.values(perObject).reduce(
      (acc, v) => ({ e: acc.e + v.e, a: acc.a + v.a }),
      { e: 0, a: 0 },
    );
    return { perTrade, perObject, grand };
  }, [state]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="sticky left-0 z-10 bg-card/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Объект
              </th>
              {state.trades.map((t) => (
                <th key={t.id} className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: t.color }} />
                    <span className="text-muted-foreground">{t.name}</span>
                  </span>
                </th>
              ))}
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Итого
              </th>
            </tr>
          </thead>
          <tbody>
            {state.objects.map((o) => {
              const tot = totals.perObject[o.id];
              const pct = tot.e ? (tot.a / tot.e) * 100 : 0;
              return (
                <tr key={o.id} className="border-b border-border/60 hover:bg-muted/20">
                  <td className="sticky left-0 z-10 bg-card/95 px-3 py-2.5">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-[11px] text-muted-foreground">{o.type}</div>
                  </td>
                  {state.trades.map((t) => {
                    const c = state.cells[cellKey(o.id, t.id)];
                    const isNa = !c || c.status === "na";
                    const cpct = c && c.estimate ? (c.actual / c.estimate) * 100 : 0;
                    return (
                      <td key={t.id} className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setEditing({ o, t })}
                          className="w-full rounded-md border border-transparent px-2 py-1.5 text-left transition hover:border-border hover:bg-background"
                        >
                          {isNa ? (
                            <span className="text-muted-foreground/60">—</span>
                          ) : (
                            <>
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-mono text-[13px] tabular-nums">
                                  {fmtShort(c!.estimate)}
                                </span>
                                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                  {fmtPct(cpct)}
                                </span>
                              </div>
                              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full ${statusBar[c!.status]} transition-all`}
                                  style={{ width: `${Math.min(100, cpct)}%` }}
                                />
                              </div>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right">
                    <div className="font-mono text-[13px] font-semibold tabular-nums">
                      {fmtShort(tot.a)}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      из {fmtShort(tot.e)}
                    </div>
                  </td>
                </tr>
              );
            })}

            <tr className="bg-muted/30 font-semibold">
              <td className="sticky left-0 z-10 bg-muted/40 px-3 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                Итого
              </td>
              {state.trades.map((t) => {
                const tt = totals.perTrade[t.id] || { e: 0, a: 0 };
                return (
                  <td key={t.id} className="px-2 py-3">
                    <div className="font-mono text-[13px] tabular-nums">{fmtShort(tt.a)}</div>
                    <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      из {fmtShort(tt.e)}
                    </div>
                  </td>
                );
              })}
              <td className="px-3 py-3 text-right">
                <div className="font-mono text-sm tabular-nums text-primary">
                  {fmtShortRub(totals.grand.a)}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  из {fmtShortRub(totals.grand.e)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <CellEditDialog
        open={!!editing}
        object={editing?.o ?? null}
        trade={editing?.t ?? null}
        cell={editing ? state.cells[cellKey(editing.o.id, editing.t.id)] : null}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          if (editing) onUpdateCell(editing.o.id, editing.t.id, next);
          setEditing(null);
        }}
      />
    </>
  );
};

export default MatrixTab;
