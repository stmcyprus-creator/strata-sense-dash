import { ProrabRow } from "@/lib/googleSheets";
import { sectionProgress as mockSectionProgress } from "@/data/mockData";
import { workSchedule, getScheduleStatus, matchWorkType } from "@/data/scheduleData";

interface SectionProgressProps {
  prorabData?: ProrabRow[];
}

const SectionProgress = ({ prorabData }: SectionProgressProps) => {
  // If we have real data from Sheets, aggregate by schedule work types
  const sections = prorabData && prorabData.length > 0
    ? aggregateBySchedule(prorabData)
    : getDefaultFromSchedule();

  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Прогресс по направлениям работ</h3>
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Нет данных. Заполните таблицу прораба.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{section.name}</span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      section.status === "active"
                        ? "bg-primary"
                        : section.status === "completed"
                        ? "bg-success"
                        : section.status === "overdue"
                        ? "bg-destructive"
                        : "bg-muted-foreground/40"
                    }`}
                    title={section.statusLabel}
                  />
                </div>
                <span className="font-mono text-sm font-semibold text-primary">
                  {section.progress}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${section.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {section.period} · {section.statusLabel}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Предстоит",
  active: "В работе",
  completed: "Завершено",
  overdue: "Просрочено",
};

function getDefaultFromSchedule() {
  return workSchedule.map((item) => {
    const status = getScheduleStatus(item);
    return {
      id: item.id,
      name: item.name,
      progress: item.progress,
      status,
      statusLabel: STATUS_LABELS[status],
      period: `${item.plannedStart} — ${item.plannedEnd}`,
    };
  });
}

function aggregateBySchedule(rows: ProrabRow[]) {
  const progressMap = new Map<string, number[]>();

  for (const row of rows) {
    const matched = matchWorkType(row.workType || row.description || "");
    if (matched) {
      if (!progressMap.has(matched.id)) progressMap.set(matched.id, []);
      progressMap.get(matched.id)!.push(row.progress);
    }
  }

  return workSchedule.map((item) => {
    const values = progressMap.get(item.id);
    const progress = values && values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : item.progress;
    const updated = { ...item, progress };
    const status = getScheduleStatus(updated);
    return {
      id: item.id,
      name: item.name,
      progress,
      status,
      statusLabel: STATUS_LABELS[status],
      period: `${item.plannedStart} — ${item.plannedEnd}`,
    };
  });
}

export default SectionProgress;
