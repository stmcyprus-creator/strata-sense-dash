import { formatMoney, formatPct } from "@/lib/format";
import type { DashboardData } from "@/lib/dashTypes";
import { Wallet, TrendingUp, Activity, AlertTriangle } from "lucide-react";

export default function KpiCards({
  data,
  onNavigate,
}: {
  data: DashboardData;
  onNavigate?: (tab: "works" | "estimates" | "problems") => void;
}) {
  const totalEstimate = data.estimates.reduce((s, r) => s + (r["сумма сметы"] || 0), 0);
  const totalActual = data.works.reduce((s, r) => s + (r["сумма факт"] || 0), 0);
  const pct = totalEstimate ? (totalActual / totalEstimate) * 100 : 0;
  const active = data.works.filter((w) => w.статус === "в работе").length;
  const problems = data.problems.length;

  const items = [
    { label: "Сметная стоимость", value: formatMoney(totalEstimate), icon: Wallet, accent: "text-info", tab: "estimates" as const },
    { label: "Освоено", value: formatMoney(totalActual), sub: formatPct(pct), icon: TrendingUp, accent: "text-primary", tab: "estimates" as const },
    { label: "Работ в процессе", value: String(active), icon: Activity, accent: "text-success", tab: "works" as const },
    { label: "Открытых проблем", value: String(problems), icon: AlertTriangle, accent: "text-destructive", tab: "problems" as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        const clickable = !!onNavigate;
        return (
          <button
            key={it.label}
            type="button"
            onClick={clickable ? () => onNavigate!(it.tab) : undefined}
            disabled={!clickable}
            className={`kpi-card text-left w-full ${clickable ? "cursor-pointer transition-colors hover:border-primary/40 hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" : ""}`}
            aria-label={`Перейти к разделу: ${it.label}`}
          >
            <div className="flex items-start justify-between">
              <div className="section-title">{it.label}</div>
              <Icon className={`h-4 w-4 ${it.accent}`} />
            </div>
            <div className="mt-2 value-large">{it.value}</div>
            {it.sub && <div className="mt-1 text-xs text-muted-foreground">освоение {it.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}
