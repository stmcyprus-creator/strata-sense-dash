export type CellStatus = "planned" | "active" | "done" | "na";

export interface ZdObject {
  id: string;
  name: string;
  type: "Реновация" | "Новое";
}

export interface ZdTrade {
  id: string;
  name: string;
  color: string;
}

export interface ZdCell {
  estimate: number;
  actual: number;
  status: CellStatus;
}

export interface ZdPhase {
  id: string;
  name: string;
  startMonth: number; // 0..7 (Май..Дек)
  endMonth: number;
  tradeId: string;
  status: Exclude<CellStatus, "na">;
}

export interface ZdState {
  objects: ZdObject[];
  trades: ZdTrade[];
  cells: Record<string, ZdCell>; // key = `${objectId}:${tradeId}`
  phases: ZdPhase[];
}

export const MONTHS = ["Май", "Июнь", "Июль", "Авг", "Сен", "Окт", "Ноя", "Дек"];

export const STATUS_LABEL: Record<CellStatus, string> = {
  planned: "Запланировано",
  active: "В работе",
  done: "Завершено",
  na: "Не применяется",
};

export const cellKey = (oid: string, tid: string) => `${oid}:${tid}`;
