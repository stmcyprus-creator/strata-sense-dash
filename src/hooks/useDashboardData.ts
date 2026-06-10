import { useQuery } from "@tanstack/react-query";
import { MOCK_DATA } from "@/lib/mockDashboard";
import type { DashboardData } from "@/lib/dashTypes";

export interface DashboardResult {
  data: DashboardData;
  offline: boolean;
  fetchedAt: Date;
}

async function fetchData(): Promise<DashboardResult> {
  try {
    const res = await fetch("/api/data", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as Partial<DashboardData>;
    if (!Array.isArray(json.works) || !Array.isArray(json.estimates) || !Array.isArray(json.problems)) {
      throw new Error("Некорректный формат данных");
    }
    return {
      data: { works: json.works, estimates: json.estimates, problems: json.problems },
      offline: false,
      fetchedAt: new Date(),
    };
  } catch {
    return { data: MOCK_DATA, offline: true, fetchedAt: new Date() };
  }
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
