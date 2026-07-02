import { useMemo, useRef, useState } from "react";
import type { DashboardData, WorkStatus } from "@/lib/dashTypes";
import { formatDate } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExportPdfButton from "./ExportPdfButton";

const STATUS_COLOR: Record<WorkStatus, string> = {
  выполнено: "hsl(142 71% 45%)",
  "в работе": "hsl(var(--primary))",
  запланировано: "hsl(var(--muted-foreground))",
  проблема: "hsl(var(--destructive))",
};

const STATUS_ORDER: WorkStatus[] = ["в работе", "проблема", "запланировано", "выполнено"];

interface Task {
  объект: string;
  "вид работ": string;
  start: Date;
  end: Date;
  статус: WorkStatus;
  прораб: string;
  сумма: number;
}

const MONTH_NAMES = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

function monthKey(d: Date) {
  return d.getFullYear() * 12 + d.getMonth();
}

export default function PlanTab({ data }: { data: DashboardData }) {
  const [obj, setObj] = useState<string>("all");
  const exportRef = useRef<HTMLDivElement>(null);

  const allObjects = useMemo(
    () => Array.from(new Set(data.works.map((w) => w.объект).filter(Boolean))).sort(),
    [data]
  );

  const tasks = useMemo<Task[]>(() => {
    const map = new Map<string, Task>();
    for (const w of data.works) {
      if (!w.дата) continue;
      const d = new Date(w.дата);
      if (isNaN(d.getTime())) continue;
      if (obj !== "all" && w.объект !== obj) continue;
      const key = `${w.объект}|${w["вид работ"]}`;
      const cur = map.get(key);
      if (!cur) {
        // Синтетическая длительность: 21 день от даты, если нет диапазона
        const end = new Date(d);
        end.setDate(end.getDate() + 21);
        map.set(key, {
          объект: w.объект,
          "вид работ": w["вид работ"],
          start: d,
          end,
          статус: w.статус,
          прораб: w.прораб,
          сумма: w["сумма факт"] || 0,
        });
      } else {
        if (d < cur.start) cur.start = d;
        const end = new Date(d);
        end.setDate(end.getDate() + 21);
        if (end > cur.end) cur.end = end;
        cur.сумма += w["сумма факт"] || 0;
        // приоритет статуса: проблема > в работе > запланировано > выполнено
        const rank = (s: WorkStatus) => STATUS_ORDER.indexOf(s);
        if (rank(w.статус) < rank(cur.статус)) cur.статус = w.статус;
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.объект !== b.объект) return a.объект.localeCompare(b.объект);
      return a.start.getTime() - b.start.getTime();
    });
  }, [data, obj]);

  const { months, totalMonths, minKey } = useMemo(() => {
    if (tasks.length === 0) return { months: [] as { key: number; label: string }[], totalMonths: 0, minKey: 0 };
    let minK = Infinity;
    let maxK = -Infinity;
    for (const t of tasks) {
      minK = Math.min(minK, monthKey(t.start));
      maxK = Math.max(maxK, monthKey(t.end));
    }
    const arr: { key: number; label: string }[] = [];
    for (let k = minK; k <= maxK; k++) {
      const year = Math.floor(k / 12);
      const m = k % 12;
      arr.push({ key: k, label: `${MONTH_NAMES[m]} ${String(year).slice(2)}` });
    }
    return { months: arr, totalMonths: arr.length, minKey: minK };
  }, [tasks]);

  const meta = [`Объект: ${obj === "all" ? "все" : obj}`, `Задач: ${tasks.length}`];

  // Позиция задачи в % относительно диапазона месяцев
  const barPos = (t: Task) => {
    if (totalMonths === 0) return { left: 0, width: 0 };
    const startFrac = (t.start.getMonth() + (t.start.getDate() - 1) / 30) / 1 + (t.start.getFullYear() * 12 - minKey * 1);
    const startPos = monthKey(t.start) - minKey + (t.start.getDate() - 1) / 30;
    const endPos = monthKey(t.end) - minKey + (t.end.getDate() - 1) / 30;
    void startFrac;
    const left = (startPos / totalMonths) * 100;
    const width = Math.max(1.5, ((endPos - startPos) / totalMonths) * 100);
    return { left, width };
  };

  const today = new Date();
  const todayPos =
    totalMonths > 0
      ? ((monthKey(today) - minKey + (today.getDate() - 1) / 30) / totalMonths) * 100
      : -1;

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
          title="План-график работ"
          meta={meta}
          baseFilename="plan"
          orientation="landscape"
        />
      </div>

      <div ref={exportRef} className="chart-container">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">План-график работ</h3>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {STATUS_ORDER.map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ background: STATUS_COLOR[s] }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Нет данных для графика.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[720px]">
              {/* Header — месяцы */}
              <div className="flex border-b border-border pb-1 text-[11px] text-muted-foreground">
                <div className="w-56 shrink-0 pr-2">Задача</div>
                <div className="relative flex-1">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))` }}>
                    {months.map((m) => (
                      <div key={m.key} className="border-l border-border/50 px-1">{m.label}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Строки задач */}
              <div className="relative">
                {todayPos >= 0 && todayPos <= 100 && (
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-warning/70"
                    style={{ left: `calc(14rem + ${todayPos}% * (100% - 14rem) / 100)` }}
                    title={`Сегодня: ${formatDate(today)}`}
                  />
                )}
                {tasks.map((t, i) => {
                  const { left, width } = barPos(t);
                  return (
                    <div
                      key={`${t.объект}|${t["вид работ"]}|${i}`}
                      className="flex items-center border-b border-border/40 py-1.5 text-xs hover:bg-muted/30"
                    >
                      <div className="w-56 shrink-0 pr-2">
                        <div className="truncate font-medium" title={t["вид работ"]}>{t["вид работ"]}</div>
                        <div className="truncate text-[10px] text-muted-foreground" title={t.объект}>
                          {t.объект}
                        </div>
                      </div>
                      <div className="relative h-6 flex-1">
                        {/* сетка месяцев */}
                        <div
                          className="absolute inset-0 grid"
                          style={{ gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))` }}
                        >
                          {months.map((m) => (
                            <div key={m.key} className="border-l border-border/30" />
                          ))}
                        </div>
                        {/* бар задачи */}
                        <div
                          className="absolute top-1 h-4 rounded-sm shadow-sm"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            background: STATUS_COLOR[t.статус],
                          }}
                          title={`${t["вид работ"]} · ${t.объект}\n${formatDate(t.start)} — ${formatDate(t.end)}\nСтатус: ${t.статус}\nПрораб: ${t.прораб}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Длительность рассчитывается по датам записей работ (мин/макс + 3 недели буфера). Вертикальная линия — сегодняшняя дата.
        </p>
      </div>
    </div>
  );
}
