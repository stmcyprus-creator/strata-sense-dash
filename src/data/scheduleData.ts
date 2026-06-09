// График производства работ (Музыка) — из PDF
// Периоды определены по Гант-диаграмме

export interface ScheduleItem {
  id: string;
  name: string;
  plannedStart: string; // YYYY-MM
  plannedEnd: string;   // YYYY-MM
  /** 0–100, calculated from prorab reports or set manually */
  progress: number;
}

export const workSchedule: ScheduleItem[] = [
  { id: "monolith-below",  name: "Монолитные работы ниже 0.0", plannedStart: "2026-01", plannedEnd: "2026-08", progress: 0 },
  { id: "monolith-above",  name: "Монолитные работы выше 0.0", plannedStart: "2026-01", plannedEnd: "2027-03", progress: 0 },
  { id: "brickwork",       name: "Кирпичная кладка",           plannedStart: "2026-06", plannedEnd: "2027-03", progress: 0 },
  { id: "windows",         name: "Окна",                       plannedStart: "2026-06", plannedEnd: "2027-03", progress: 0 },
  { id: "electrics",       name: "Внутр. Электрика",           plannedStart: "2026-06", plannedEnd: "2027-03", progress: 0 },
  { id: "plumbing",        name: "Сантехника внутр.",           plannedStart: "2026-06", plannedEnd: "2027-03", progress: 0 },
  { id: "roofing",         name: "Кровля",                     plannedStart: "2026-07", plannedEnd: "2026-11", progress: 0 },
  { id: "plastering",      name: "Штукатурные работы",         plannedStart: "2026-08", plannedEnd: "2027-03", progress: 0 },
  { id: "facade",          name: "Фасад",                      plannedStart: "2026-09", plannedEnd: "2027-03", progress: 0 },
  { id: "ventilation",     name: "Вентиляция",                 plannedStart: "2026-09", plannedEnd: "2027-03", progress: 0 },
  { id: "doors",           name: "Двери",                      plannedStart: "2026-10", plannedEnd: "2027-03", progress: 0 },
  { id: "elevators",       name: "Лифты",                      plannedStart: "2026-11", plannedEnd: "2027-03", progress: 0 },
  { id: "low-current",     name: "Слаботочные системы",        plannedStart: "2026-11", plannedEnd: "2027-03", progress: 0 },
  { id: "ext-water",       name: "Наружные сети ВК",           plannedStart: "2027-04", plannedEnd: "2027-07", progress: 0 },
  { id: "ext-electric",    name: "Наружные сети Эл.",          plannedStart: "2027-04", plannedEnd: "2027-07", progress: 0 },
  { id: "ext-heat",        name: "Наружные сети тепл.",        plannedStart: "2027-04", plannedEnd: "2027-07", progress: 0 },
  { id: "common-finish",   name: "Отделка МОП",               plannedStart: "2027-05", plannedEnd: "2027-08", progress: 0 },
  { id: "vru",             name: "ВРУ",                        plannedStart: "2027-06", plannedEnd: "2027-08", progress: 0 },
  { id: "tp-basement",     name: "ТП Водомер подвал",         plannedStart: "2027-06", plannedEnd: "2027-08", progress: 0 },
];

/** All months covered by the schedule */
export const scheduleMonths = [
  "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06",
  "2026-07","2026-08","2026-09","2026-10","2026-11","2026-12",
  "2027-01","2027-02","2027-03","2027-04","2027-05","2027-06",
  "2027-07","2027-08","2027-09",
];

const MONTH_LABELS: Record<string, string> = {
  "01": "Янв", "02": "Фев", "03": "Мар", "04": "Апр",
  "05": "Май", "06": "Июн", "07": "Июл", "08": "Авг",
  "09": "Сен", "10": "Окт", "11": "Ноя", "12": "Дек",
};

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_LABELS[m]} ${y.slice(2)}`;
}

/** Check if a month falls within [start, end] */
export function isInRange(month: string, start: string, end: string): boolean {
  return month >= start && month <= end;
}

/** Get current schedule status based on today's date */
export function getScheduleStatus(item: ScheduleItem, now = new Date()): "upcoming" | "active" | "completed" | "overdue" {
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (item.progress >= 100) return "completed";
  if (currentMonth < item.plannedStart) return "upcoming";
  if (currentMonth > item.plannedEnd && item.progress < 100) return "overdue";
  return "active";
}

/** Map workType from prorab report to schedule item */
export function matchWorkType(workType: string): ScheduleItem | undefined {
  const lower = workType.toLowerCase();
  return workSchedule.find((s) => {
    const sLower = s.name.toLowerCase();
    // Check if work type contains key words from schedule item
    return sLower.includes(lower) || lower.includes(sLower) ||
      lower.split(/\s+/).some(word => word.length > 3 && sLower.includes(word));
  });
}
