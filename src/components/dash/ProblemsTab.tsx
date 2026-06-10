import { useMemo } from "react";
import type { DashboardData, Urgency } from "@/lib/dashTypes";
import { formatDate } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

const ORDER: Record<Urgency, number> = { критическая: 0, высокая: 1, средняя: 2, низкая: 3 };
const STYLE: Record<Urgency, string> = {
  критическая: "bg-destructive/20 text-destructive border-destructive/40",
  высокая: "bg-warning/20 text-warning border-warning/40",
  средняя: "bg-info/20 text-info border-info/40",
  низкая: "bg-muted text-muted-foreground border-border",
};

export default function ProblemsTab({ data }: { data: DashboardData }) {
  const rows = useMemo(
    () => [...data.problems].sort((a, b) => ORDER[a.срочность] - ORDER[b.срочность]),
    [data]
  );

  if (rows.length === 0) {
    return (
      <div className="chart-container text-center text-sm text-muted-foreground">
        Открытых проблем нет.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((p, i) => (
        <div key={i} className={`chart-container border-l-4 ${STYLE[p.срочность]}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">{p.объект} — {p["вид работ"]}</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{formatDate(p.дата)} · {p.прораб}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/90">{p["описание проблемы"]}</p>
          <div className="mt-2">
            <span className={`badge-status border ${STYLE[p.срочность]}`}>срочность: {p.срочность}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
