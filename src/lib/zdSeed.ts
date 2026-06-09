import { ZdState, cellKey } from "./zdTypes";

export const SEED: ZdState = (() => {
  const objects = [
    { id: "adm", name: "Административное здание", type: "Реновация" as const },
    { id: "din", name: "Столовая", type: "Реновация" as const },
    { id: "h1", name: "Домик №1", type: "Реновация" as const },
    { id: "h2", name: "Домик №2", type: "Реновация" as const },
    { id: "h3", name: "Домик №3", type: "Реновация" as const },
    { id: "land", name: "Благоустройство территории", type: "Реновация" as const },
    { id: "new", name: "Строительство по заданию заказчика", type: "Новое" as const },
  ];

  const trades = [
    { id: "plumb", name: "Сантехника", color: "#3b82f6" },
    { id: "elec", name: "Электрика", color: "#eab308" },
    { id: "screed", name: "Стяжка", color: "#a855f7" },
    { id: "finish", name: "Отделка", color: "#ec4899" },
    { id: "build", name: "Строительство по заданию", color: "#f97316" },
  ];

  // matrix of [estimate, actual, status] per object × trade
  // For "new" object, only build trade applies; others na (or low estimates)
  const m: Record<string, [number, number, "planned" | "active" | "done" | "na"]> = {
    // Административное здание
    [cellKey("adm", "plumb")]: [480_000, 480_000, "done"],
    [cellKey("adm", "elec")]: [620_000, 410_000, "active"],
    [cellKey("adm", "screed")]: [380_000, 380_000, "done"],
    [cellKey("adm", "finish")]: [1_200_000, 320_000, "active"],
    [cellKey("adm", "build")]: [0, 0, "na"],

    // Столовая
    [cellKey("din", "plumb")]: [950_000, 600_000, "active"],
    [cellKey("din", "elec")]: [820_000, 250_000, "active"],
    [cellKey("din", "screed")]: [540_000, 540_000, "done"],
    [cellKey("din", "finish")]: [2_400_000, 0, "planned"],
    [cellKey("din", "build")]: [0, 0, "na"],

    // Домик №1
    [cellKey("h1", "plumb")]: [310_000, 310_000, "done"],
    [cellKey("h1", "elec")]: [280_000, 280_000, "done"],
    [cellKey("h1", "screed")]: [220_000, 220_000, "done"],
    [cellKey("h1", "finish")]: [860_000, 640_000, "active"],
    [cellKey("h1", "build")]: [0, 0, "na"],

    // Домик №2
    [cellKey("h2", "plumb")]: [310_000, 180_000, "active"],
    [cellKey("h2", "elec")]: [280_000, 90_000, "active"],
    [cellKey("h2", "screed")]: [220_000, 0, "planned"],
    [cellKey("h2", "finish")]: [860_000, 0, "planned"],
    [cellKey("h2", "build")]: [0, 0, "na"],

    // Домик №3
    [cellKey("h3", "plumb")]: [310_000, 0, "planned"],
    [cellKey("h3", "elec")]: [280_000, 0, "planned"],
    [cellKey("h3", "screed")]: [220_000, 0, "planned"],
    [cellKey("h3", "finish")]: [860_000, 0, "planned"],
    [cellKey("h3", "build")]: [0, 0, "na"],

    // Благоустройство
    [cellKey("land", "plumb")]: [420_000, 120_000, "active"],
    [cellKey("land", "elec")]: [380_000, 0, "planned"],
    [cellKey("land", "screed")]: [0, 0, "na"],
    [cellKey("land", "finish")]: [0, 0, "na"],
    [cellKey("land", "build")]: [1_800_000, 350_000, "active"],

    // Новое
    [cellKey("new", "plumb")]: [0, 0, "na"],
    [cellKey("new", "elec")]: [0, 0, "na"],
    [cellKey("new", "screed")]: [0, 0, "na"],
    [cellKey("new", "finish")]: [0, 0, "na"],
    [cellKey("new", "build")]: [3_600_000, 480_000, "active"],
  };

  const cells: Record<string, { estimate: number; actual: number; status: any }> = {};
  for (const [k, [e, a, s]] of Object.entries(m)) cells[k] = { estimate: e, actual: a, status: s };

  const phases = [
    { id: "p1", name: "Демонтаж", startMonth: 0, endMonth: 1, tradeId: "build", status: "done" as const },
    { id: "p2", name: "Сантехника (черновая)", startMonth: 1, endMonth: 3, tradeId: "plumb", status: "active" as const },
    { id: "p3", name: "Электрика (разводка)", startMonth: 1, endMonth: 3, tradeId: "elec", status: "active" as const },
    { id: "p4", name: "Стяжка полов", startMonth: 2, endMonth: 4, tradeId: "screed", status: "active" as const },
    { id: "p5", name: "Отделка", startMonth: 4, endMonth: 7, tradeId: "finish", status: "planned" as const },
    { id: "p6", name: "Новое строительство", startMonth: 2, endMonth: 6, tradeId: "build", status: "active" as const },
    { id: "p7", name: "Благоустройство", startMonth: 5, endMonth: 7, tradeId: "build", status: "planned" as const },
  ];

  return { objects, trades, cells, phases };
})();
