import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { kpiData } from "@/data/mockData";
import {
  workSchedule,
  scheduleMonths,
  formatMonth,
  isInRange,
  getScheduleStatus,
  ScheduleItem,
} from "@/data/scheduleData";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { ProrabRow } from "@/lib/googleSheets";

/** Aggregate prorab progress by matching work type names to schedule items */
function calcProgressFromProrab(schedule: ScheduleItem[], prorab: ProrabRow[]): ScheduleItem[] {
  if (!prorab || prorab.length === 0) return schedule;

  const progressMap = new Map<string, number[]>();

  for (const row of prorab) {
    const key = row.workType?.toLowerCase() || row.description?.toLowerCase() || "";
    if (!key) continue;

    for (const item of schedule) {
      const itemLower = item.name.toLowerCase();
      const words = key.split(/\s+/).filter(w => w.length > 3);
      if (itemLower.includes(key) || key.includes(itemLower) || words.some(w => itemLower.includes(w))) {
        if (!progressMap.has(item.id)) progressMap.set(item.id, []);
        progressMap.get(item.id)!.push(row.progress);
        break;
      }
    }
  }

  return schedule.map((item) => {
    const values = progressMap.get(item.id);
    if (!values || values.length === 0) return item;
    return { ...item, progress: Math.round(values.reduce((a, b) => a + b, 0) / values.length) };
  });
}

const statusColors: Record<string, string> = {
  upcoming: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  overdue: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<string, string> = {
  upcoming: "Предстоит",
  active: "В работе",
  completed: "Завершено",
  overdue: "Просрочено",
};

const ScheduleReport = () => {
  const navigate = useNavigate();
  const { data: sheetsData } = useGoogleSheets();
  const pct = Math.round((kpiData.daysElapsed / kpiData.daysTotal) * 100);

  const items = calcProgressFromProrab(workSchedule, sheetsData?.prorab ?? []);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Visible months — show a sliding window around current month
  const currentIdx = scheduleMonths.indexOf(currentMonth);
  const startIdx = Math.max(0, currentIdx - 2);
  const visibleMonths = scheduleMonths.slice(startIdx, startIdx + 12);

  const activeCount = items.filter(i => getScheduleStatus(i) === "active").length;
  const overdueCount = items.filter(i => getScheduleStatus(i) === "overdue").length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к дашборду
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">График производства работ</h1>
            <p className="text-sm text-muted-foreground">Музыка · 2026–2027 гг.</p>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Всего направлений", value: items.length, sub: "видов работ" },
            { label: "В работе", value: activeCount, sub: "сейчас активны" },
            { label: "Просрочено", value: overdueCount, sub: overdueCount > 0 ? "требуют внимания" : "всё в срок" },
            { label: "Прошло срока", value: `${pct}%`, sub: `${kpiData.daysElapsed} из ${kpiData.daysTotal} дн.` },
          ].map((item) => (
            <div key={item.label} className="kpi-card">
              <p className="section-title">{item.label}</p>
              <p className="value-large mt-1">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        <div className="chart-container overflow-x-auto">
          <h3 className="section-title mb-4">Диаграмма Ганта</h3>
          <table className="w-full min-w-[900px] text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card text-left py-2 pr-4 font-medium text-muted-foreground min-w-[200px]">
                  Направление
                </th>
                {visibleMonths.map((m) => (
                  <th
                    key={m}
                    className={`text-center py-2 px-1 font-medium min-w-[60px] ${
                      m === currentMonth ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {formatMonth(m)}
                    {m === currentMonth && (
                      <div className="h-0.5 bg-primary rounded-full mt-1" />
                    )}
                  </th>
                ))}
                <th className="text-center py-2 px-2 font-medium text-muted-foreground min-w-[70px]">
                  Прогресс
                </th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground min-w-[80px]">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = getScheduleStatus(item);
                return (
                  <tr key={item.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card py-2.5 pr-4 font-medium">
                      {item.name}
                    </td>
                    {visibleMonths.map((m) => {
                      const inRange = isInRange(m, item.plannedStart, item.plannedEnd);
                      const isNow = m === currentMonth && inRange;
                      return (
                        <td key={m} className="py-2.5 px-0.5">
                          {inRange && (
                            <div
                              className={`h-5 rounded-sm ${
                                isNow
                                  ? "bg-primary"
                                  : item.progress > 0
                                  ? "bg-primary/40"
                                  : "bg-muted-foreground/20"
                              }`}
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="font-mono w-7 text-right">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[status]}`}>
                        {statusLabels[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded-sm bg-primary" /> Текущий месяц
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded-sm bg-primary/40" /> С прогрессом
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded-sm bg-muted-foreground/20" /> Плановый период
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleReport;
