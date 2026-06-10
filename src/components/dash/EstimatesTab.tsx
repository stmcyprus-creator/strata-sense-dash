import { useMemo } from "react";
import type { DashboardData } from "@/lib/dashTypes";
import { formatMoney, formatPct } from "@/lib/format";

export default function EstimatesTab({ data }: { data: DashboardData }) {
  const groups = useMemo(() => {
    const actualMap = new Map<string, number>();
    for (const w of data.works) {
      const key = `${w.объект}|${w["вид работ"]}`;
      actualMap.set(key, (actualMap.get(key) ?? 0) + (w["сумма факт"] || 0));
    }
    const byObject = new Map<string, { trade: string; estimate: number; actual: number }[]>();
    for (const e of data.estimates) {
      const key = `${e.объект}|${e["вид работ"]}`;
      const actual = actualMap.get(key) ?? 0;
      const arr = byObject.get(e.объект) ?? [];
      arr.push({ trade: e["вид работ"], estimate: e["сумма сметы"], actual });
      byObject.set(e.объект, arr);
    }
    return Array.from(byObject.entries()).map(([объект, rows]) => {
      const estimate = rows.reduce((s, r) => s + r.estimate, 0);
      const actual = rows.reduce((s, r) => s + r.actual, 0);
      return { объект, rows, estimate, actual };
    });
  }, [data]);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {groups.map((g) => {
        const pct = g.estimate ? (g.actual / g.estimate) * 100 : 0;
        return (
          <div key={g.объект} className="chart-container">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">{g.объект}</h3>
              <span className="font-mono text-xs text-muted-foreground">{formatPct(pct)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>Освоено {formatMoney(g.actual)}</span>
              <span>Смета {formatMoney(g.estimate)}</span>
            </div>
            <div className="mt-3 space-y-2">
              {g.rows.map((r) => {
                const p = r.estimate ? Math.min(100, (r.actual / r.estimate) * 100) : 0;
                const over = r.actual > r.estimate && r.estimate > 0;
                return (
                  <div key={r.trade}>
                    <div className="flex justify-between text-xs">
                      <span>{r.trade}</span>
                      <span className={`font-mono ${over ? "text-destructive" : "text-muted-foreground"}`}>
                        {formatMoney(r.actual)} / {formatMoney(r.estimate)}
                      </span>
                    </div>
                    <div className="progress-bar mt-1">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${p}%`, background: over ? "hsl(var(--destructive))" : undefined }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
