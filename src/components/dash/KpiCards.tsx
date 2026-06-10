import { formatMoney, formatPct } from "@/lib/format";
import type { DashboardData } from "@/lib/dashTypes";
import { Wallet, TrendingUp, Activity, AlertTriangle } from "lucide-react";

export default function KpiCards({ data }: { data: DashboardData }) {
  const totalEstimate = data.estimates.reduce((s, r) => s + (r["сумма сметы"] || 0), 0);
  const totalActual = data.works.reduce((s, r) => s + (r["сумма факт"] || 0), 0);
  const pct = totalEstimate ? (totalActual / totalEstimate) * 100 : 0;
  const active = data.works.filter((w) => w.статус === "в работе").length;
  const problems = data.problems.length;

  const items = [
    { label: "Сметная стоимость", value: formatMoney(totalEstimate), icon: Wallet, accent: "text-info" },
    { label: "Освоено", value: formatMoney(totalActual), sub: formatPct(pct), icon: TrendingUp, accent: "text-primary" },
    { label: "Работ в процессе", value: String(active), icon: Activity, accent: "text-success" },
    { label: "Открытых проблем", value: String(problems), icon: AlertTriangle, accent: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="section-title">{it.label}</div>
              <Icon className={`h-4 w-4 ${it.accent}`} />
            </div>
            <div className="mt-2 value-large">{it.value}</div>
            {it.sub && <div className="mt-1 text-xs text-muted-foreground">освоение {it.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
