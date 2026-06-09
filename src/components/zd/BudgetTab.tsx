import { useMemo } from "react";
import { ZdState, cellKey } from "@/lib/zdTypes";
import { fmtPct, fmtShortRub } from "@/lib/zdFormat";

interface Row {
  id: string;
  name: string;
  meta?: string;
  color?: string;
  estimate: number;
  actual: number;
}

const Bar = ({ pct, color }: { pct: number; color?: string }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
    <div
      className="h-full transition-all"
      style={{
        width: `${Math.min(100, pct)}%`,
        background: color ?? "hsl(160 84% 39%)",
      }}
    />
  </div>
);

const Card = ({ title, rows }: { title: string; rows: Row[] }) => {
  const total = rows.reduce(
    (acc, r) => ({ e: acc.e + r.estimate, a: acc.a + r.actual }),
    { e: 0, a: 0 },
  );
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h3>
        <div className="font-mono text-xs tabular-nums text-muted-foreground">
          {fmtShortRub(total.a)} / {fmtShortRub(total.e)}
        </div>
      </div>
      <div className="space-y-4">
        {rows.map((r) => {
          const pct = r.estimate ? (r.actual / r.estimate) * 100 : 0;
          return (
            <div key={r.id}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {r.color && (
                      <span
                        className="inline-block h-2 w-2 rounded-sm"
                        style={{ background: r.color }}
                      />
                    )}
                    <span className="truncate text-sm font-medium">{r.name}</span>
                  </div>
                  {r.meta && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{r.meta}</p>
                  )}
                </div>
                <div className="text-right font-mono text-[12px] tabular-nums">
                  <div>
                    <span className="text-[hsl(160_84%_45%)]">{fmtShortRub(r.actual)}</span>
                    <span className="text-muted-foreground"> / {fmtShortRub(r.estimate)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{fmtPct(pct)}</div>
                </div>
              </div>
              <div className="mt-2">
                <Bar pct={pct} color={r.color} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BudgetTab = ({ state }: { state: ZdState }) => {
  const { byTrade, byObject } = useMemo(() => {
    const byTrade: Row[] = state.trades.map((t) => {
      let e = 0, a = 0;
      for (const o of state.objects) {
        const c = state.cells[cellKey(o.id, t.id)];
        if (!c || c.status === "na") continue;
        e += c.estimate; a += c.actual;
      }
      return { id: t.id, name: t.name, color: t.color, estimate: e, actual: a };
    });
    const byObject: Row[] = state.objects.map((o) => {
      let e = 0, a = 0;
      for (const t of state.trades) {
        const c = state.cells[cellKey(o.id, t.id)];
        if (!c || c.status === "na") continue;
        e += c.estimate; a += c.actual;
      }
      return { id: o.id, name: o.name, meta: o.type, estimate: e, actual: a };
    });
    return { byTrade, byObject };
  }, [state]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Бюджет по видам работ" rows={byTrade} />
      <Card title="Бюджет по объектам" rows={byObject} />
    </div>
  );
};

export default BudgetTab;
