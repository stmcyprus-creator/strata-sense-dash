import { useMemo, useRef, useState } from "react";
import type { DashboardData } from "@/lib/dashTypes";
import { formatMoney, formatPct } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ExportPdfButton from "./ExportPdfButton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Period = "all" | "30d" | "month" | "quarter";

const PERIOD_LABELS: Record<Period, string> = {
  all: "За всё время",
  "30d": "Последние 30 дней",
  month: "Текущий месяц",
  quarter: "Текущий квартал",
};

function inPeriod(dateStr: string, period: Period): boolean {
  if (period === "all") return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  if (period === "30d") {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  if (period === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  // quarter
  const q = Math.floor(now.getMonth() / 3);
  const dq = Math.floor(d.getMonth() / 3);
  return d.getFullYear() === now.getFullYear() && dq === q;
}

interface TooltipPayloadItem {
  color?: string;
  name?: string;
  value?: number;
  payload?: { name: string; Смета: number; Освоено: number };
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0]?.payload;
  const estimate = p?.Смета ?? 0;
  const actual = p?.Освоено ?? 0;
  const pct = estimate ? (actual / estimate) * 100 : 0;
  const remaining = estimate - actual;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <div className="mb-1.5 font-semibold text-foreground">{label}</div>
      <div className="space-y-1 font-mono">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Смета:</span>
          <span>{formatMoney(estimate)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Освоено:</span>
          <span className="text-primary">{formatMoney(actual)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Остаток:</span>
          <span className={remaining < 0 ? "text-destructive" : ""}>{formatMoney(remaining)}</span>
        </div>
        <div className="mt-1 flex justify-between gap-4 border-t border-border pt-1">
          <span className="text-muted-foreground">Освоение:</span>
          <span className={pct > 100 ? "text-destructive" : "text-foreground"}>{formatPct(pct)}</span>
        </div>
      </div>
    </div>
  );
}

export default function EstimatesTab({ data }: { data: DashboardData }) {
  const [obj, setObj] = useState<string>("all");
  const [period, setPeriod] = useState<Period>("all");
  const exportRef = useRef<HTMLDivElement>(null);

  const allObjects = useMemo(
    () => Array.from(new Set(data.estimates.map((e) => e.объект).filter(Boolean))).sort(),
    [data]
  );

  const groups = useMemo(() => {
    const actualMap = new Map<string, number>();
    for (const w of data.works) {
      if (!inPeriod(w.дата, period)) continue;
      const key = `${w.объект}|${w["вид работ"]}`;
      actualMap.set(key, (actualMap.get(key) ?? 0) + (w["сумма факт"] || 0));
    }
    const byObject = new Map<string, { trade: string; estimate: number; actual: number }[]>();
    for (const e of data.estimates) {
      if (obj !== "all" && e.объект !== obj) continue;
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
  }, [data, obj, period]);

  const totalEstimate = groups.reduce((s, g) => s + g.estimate, 0);
  const totalActual = groups.reduce((s, g) => s + g.actual, 0);
  const meta = [
    `Объект: ${obj === "all" ? "все" : obj}`,
    `Период: ${PERIOD_LABELS[period]}`,
    `Смета: ${formatMoney(totalEstimate)}`,
    `Освоено: ${formatMoney(totalActual)} (${formatPct(totalEstimate ? (totalActual / totalEstimate) * 100 : 0)})`,
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={obj} onValueChange={setObj}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Объект" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все объекты</SelectItem>
            {allObjects.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <ExportPdfButton
          targetRef={exportRef}
          title="Сметы vs Факт"
          meta={meta}
          baseFilename="estimates"
          orientation="portrait"
        />
      </div>

      <div ref={exportRef} className="space-y-3">
        {groups.length > 0 && (
          <div className="chart-container">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">Освоение бюджета по объектам</h3>
              <span className="font-mono text-xs text-muted-foreground">
                {formatMoney(totalActual)} / {formatMoney(totalEstimate)} ·{" "}
                {formatPct(totalEstimate ? (totalActual / totalEstimate) * 100 : 0)}
              </span>
            </div>
            <div className="mt-2">
              <ToggleGroup
                type="single"
                size="sm"
                value={period}
                onValueChange={(v) => v && setPeriod(v as Period)}
                className="flex flex-wrap justify-start gap-1"
              >
                <ToggleGroupItem value="all" className="text-xs h-7 px-2">Всё время</ToggleGroupItem>
                <ToggleGroupItem value="quarter" className="text-xs h-7 px-2">Квартал</ToggleGroupItem>
                <ToggleGroupItem value="month" className="text-xs h-7 px-2">Месяц</ToggleGroupItem>
                <ToggleGroupItem value="30d" className="text-xs h-7 px-2">30 дней</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="mt-3 h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groups.map((g) => ({ name: g.объект, Смета: g.estimate, Освоено: g.actual }))}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}М` : `${(v / 1000).toFixed(0)}к`)}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Смета" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Освоено" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

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
        {groups.length === 0 && (
          <div className="chart-container text-center text-sm text-muted-foreground md:col-span-2">
            Нет данных по выбранному фильтру.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
