// Mock data for the construction BI dashboard
// Object: Residential building 17,000 m², 2 sections (A, B), foundation stage

export const projectInfo = {
  name: "ЖК Рассвет",
  address: "ул. Музыки",
  totalArea: 17000,
  sections: ["А", "Б"],
  stage: "Монолитные работы ниже 0.0",
  startDate: "2026-01-01",
  plannedEnd: "2027-08-31",
  currentDate: "2026-02-24",
};

export const kpiData = {
  budgetTotal: 520_000_000,
  budgetSpent: 87_400_000,
  budgetPlan: 95_000_000,
  daysTotal: 668,
  daysElapsed: 176,
  workersTotal: 64,
  workersOnSite: 58,
  materialsDelivered: 78,
  safetyIncidents: 1,
  overallProgress: 16.8,
};

export const sectionProgress = [
  {
    id: "А",
    name: "Секция А",
    progress: 22,
    status: "on_track" as const,
    tasks: [
      { name: "Земляные работы", progress: 100 },
      { name: "Свайное поле", progress: 85 },
      { name: "Ростверк", progress: 30 },
      { name: "Фундаментная плита", progress: 0 },
    ],
  },
  {
    id: "Б",
    name: "Секция Б",
    progress: 12,
    status: "delayed" as const,
    tasks: [
      { name: "Земляные работы", progress: 100 },
      { name: "Свайное поле", progress: 45 },
      { name: "Ростверк", progress: 0 },
      { name: "Фундаментная плита", progress: 0 },
    ],
  },
];

export const financeData = {
  monthly: [
    { month: "Сен", plan: 12000, fact: 11200 },
    { month: "Окт", plan: 15000, fact: 14800 },
    { month: "Ноя", plan: 18000, fact: 19500 },
    { month: "Дек", plan: 14000, fact: 13200 },
    { month: "Янв", plan: 16000, fact: 15400 },
    { month: "Фев", plan: 20000, fact: 13300 },
  ],
  categories: [
    { name: "Материалы", amount: 38_200_000, percent: 43.7 },
    { name: "Работы", amount: 28_600_000, percent: 32.7 },
    { name: "Техника", amount: 12_100_000, percent: 13.8 },
    { name: "Прочее", amount: 8_500_000, percent: 9.8 },
  ],
};

export const hrData = {
  total: 64,
  onSite: 58,
  turnoverRate: 8.2,
  byRole: [
    { role: "Бетонщики", count: 18 },
    { role: "Арматурщики", count: 14 },
    { role: "Машинисты", count: 8 },
    { role: "Разнорабочие", count: 12 },
    { role: "ИТР", count: 6 },
    { role: "Прочие", count: 6 },
  ],
  attendance: [
    { day: "Пн", present: 56, absent: 8 },
    { day: "Вт", present: 60, absent: 4 },
    { day: "Ср", present: 58, absent: 6 },
    { day: "Чт", present: 55, absent: 9 },
    { day: "Пт", present: 57, absent: 7 },
    { day: "Сб", present: 42, absent: 22 },
  ],
};

export const supplyData = {
  pending: 5,
  inTransit: 3,
  delivered: 12,
  delayed: 2,
  items: [
    { name: "Арматура A500C ∅16", status: "delivered" as const, date: "20.02", qty: "24 т" },
    { name: "Бетон B25 W8", status: "in_transit" as const, date: "24.02", qty: "180 м³" },
    { name: "Опалубка PERI", status: "delayed" as const, date: "21.02", qty: "320 м²" },
    { name: "ПГС фр. 5-20", status: "delivered" as const, date: "22.02", qty: "85 м³" },
    { name: "Гидроизоляция", status: "pending" as const, date: "27.02", qty: "640 м²" },
    { name: "Арматура A500C ∅12", status: "in_transit" as const, date: "25.02", qty: "18 т" },
    { name: "Утеплитель XPS 50мм", status: "pending" as const, date: "01.03", qty: "420 м²" },
  ],
};

export const alerts = [
  { type: "warning" as const, text: "Секция Б: отставание от графика 5 дней", time: "2ч назад" },
  { type: "danger" as const, text: "Задержка поставки опалубки PERI (3 дня)", time: "4ч назад" },
  { type: "info" as const, text: "Бетон B25 — поставка завтра, 180 м³", time: "5ч назад" },
  { type: "success" as const, text: "Секция А: свайное поле — выполнено 85%", time: "вчера" },
];
