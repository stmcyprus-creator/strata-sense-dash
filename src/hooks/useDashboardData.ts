import { useQuery } from "@tanstack/react-query";
import { MOCK_DATA } from "@/lib/mockDashboard";
import type {
  DashboardData,
  WorkRow,
  WorkStatus,
  EstimateRow,
  ProblemRow,
  Urgency,
} from "@/lib/dashTypes";
import { parseCSV, toNumber } from "@/lib/csv";

export interface DashboardResult {
  data: DashboardData;
  offline: boolean;
  source: "api" | "sheets" | "mock";
  fetchedAt: Date;
  error?: string;
}

const STATUSES: WorkStatus[] = ["выполнено", "в работе", "запланировано", "проблема"];
const URGENCIES: Urgency[] = ["низкая", "средняя", "высокая", "критическая"];

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const found = Object.keys(row).find((h) => h.toLowerCase() === k.toLowerCase());
    if (found && row[found] !== "") return row[found];
  }
  return "";
}

function normalizeStatus(s: string): WorkStatus {
  const v = s.toLowerCase().trim();
  return (STATUSES.find((x) => x === v) ?? "запланировано") as WorkStatus;
}
function normalizeUrgency(s: string): Urgency {
  const v = s.toLowerCase().trim();
  return (URGENCIES.find((x) => x === v) ?? "средняя") as Urgency;
}

function mapWorks(rows: Record<string, string>[]): WorkRow[] {
  return rows.map((r) => ({
    дата: pick(r, ["дата", "date"]),
    прораб: pick(r, ["прораб", "foreman"]),
    объект: pick(r, ["объект", "object"]),
    "вид работ": pick(r, ["вид работ", "work", "тип работ"]),
    "сумма факт": toNumber(pick(r, ["сумма факт", "факт", "amount"])),
    статус: normalizeStatus(pick(r, ["статус", "status"])),
    комментарий: pick(r, ["комментарий", "comment", "примечание"]) || undefined,
  }));
}
function mapEstimates(rows: Record<string, string>[]): EstimateRow[] {
  return rows.map((r) => ({
    объект: pick(r, ["объект", "object"]),
    "вид работ": pick(r, ["вид работ", "work", "тип работ"]),
    "сумма сметы": toNumber(pick(r, ["сумма сметы", "смета", "budget"])),
  }));
}
function mapProblems(rows: Record<string, string>[]): ProblemRow[] {
  return rows.map((r) => ({
    дата: pick(r, ["дата", "date"]),
    прораб: pick(r, ["прораб", "foreman"]),
    объект: pick(r, ["объект", "object"]),
    "вид работ": pick(r, ["вид работ", "work"]),
    "описание проблемы": pick(r, ["описание проблемы", "описание", "issue", "problem"]),
    срочность: normalizeUrgency(pick(r, ["срочность", "urgency", "приоритет"])),
  }));
}

async function fetchCsv(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url, { headers: { Accept: "text/csv,*/*" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return parseCSV(await res.text());
}

const SHEET_ID = "1h4H8k-1hidOoo1bguKHoZ-zFeWUZnVf6ST4RNaiY2YM";
const csvUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

async function fetchFromSheets(): Promise<DashboardResult | null> {
  const worksUrl =
    (import.meta.env.VITE_SHEET_WORKS_CSV as string | undefined) ?? csvUrl("1527393517");
  const estimatesUrl =
    (import.meta.env.VITE_SHEET_ESTIMATES_CSV as string | undefined) ?? csvUrl("1999774586");
  const problemsUrl =
    (import.meta.env.VITE_SHEET_PROBLEMS_CSV as string | undefined) ?? csvUrl("2062713879");
  if (!worksUrl || !estimatesUrl || !problemsUrl) return null;

  const [w, e, p] = await Promise.all([
    fetchCsv(worksUrl),
    fetchCsv(estimatesUrl),
    fetchCsv(problemsUrl),
  ]);

  return {
    data: { works: mapWorks(w), estimates: mapEstimates(e), problems: mapProblems(p) },
    offline: false,
    source: "sheets",
    fetchedAt: new Date(),
  };
}

async function fetchFromApi(): Promise<DashboardResult | null> {
  try {
    const res = await fetch("/api/data", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as Partial<DashboardData> & {
      works?: unknown;
      estimates?: unknown;
      problems?: unknown;
    };

    // Either the API already returns typed JSON, or CSV-shaped rows.
    const rawWorks = Array.isArray(json.works) ? (json.works as unknown as Record<string, string>[]) : null;
    const rawEst = Array.isArray(json.estimates) ? (json.estimates as unknown as Record<string, string>[]) : null;
    const rawProb = Array.isArray(json.problems) ? (json.problems as unknown as Record<string, string>[]) : null;
    if (!rawWorks || !rawEst || !rawProb) return null;

    // Detect if already typed (has number fields) — if not, run mappers.
    const needsMap =
      rawWorks.length > 0 && typeof (rawWorks[0] as Record<string, unknown>)["сумма факт"] !== "number";

    return {
      data: needsMap
        ? { works: mapWorks(rawWorks), estimates: mapEstimates(rawEst), problems: mapProblems(rawProb) }
        : {
            works: rawWorks as unknown as WorkRow[],
            estimates: rawEst as unknown as EstimateRow[],
            problems: rawProb as unknown as ProblemRow[],
          },
      offline: false,
      source: "api",
      fetchedAt: new Date(),
    };
  } catch {
    return null;
  }
}

async function fetchData(): Promise<DashboardResult> {
  // 1) public Google Sheets CSV (preferred when configured)
  try {
    const s = await fetchFromSheets();
    if (s) return s;
  } catch (err) {
    // fall through to /api/data
    const a = await fetchFromApi();
    if (a) return a;
    return {
      data: MOCK_DATA,
      offline: true,
      source: "mock",
      fetchedAt: new Date(),
      error: (err as Error).message,
    };
  }

  // 2) optional /api/data proxy
  const a = await fetchFromApi();
  if (a) return a;

  // 3) fallback to mocks
  return { data: MOCK_DATA, offline: true, source: "mock", fetchedAt: new Date() };
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
