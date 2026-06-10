export type WorkStatus = "выполнено" | "в работе" | "запланировано" | "проблема";

export interface WorkRow {
  дата: string;
  прораб: string;
  объект: string;
  "вид работ": string;
  "сумма факт": number;
  статус: WorkStatus;
  комментарий?: string;
}

export interface EstimateRow {
  объект: string;
  "вид работ": string;
  "сумма сметы": number;
}

export type Urgency = "низкая" | "средняя" | "высокая" | "критическая";

export interface ProblemRow {
  дата: string;
  прораб: string;
  объект: string;
  "вид работ": string;
  "описание проблемы": string;
  срочность: Urgency;
}

export interface DashboardData {
  works: WorkRow[];
  estimates: EstimateRow[];
  problems: ProblemRow[];
}
