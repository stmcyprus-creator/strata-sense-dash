import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useCallback } from "react";

export function useFinanceData() {
  return useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const { data: sections, error: e1 } = await supabase
        .from("budget_sections").select("*").order("sort_order");
      if (e1) throw new Error(e1.message);

      const { data: payments, error: e2 } = await supabase
        .from("payments").select("amount, payment_date");
      if (e2) throw new Error(e2.message);

      const byMonth: Record<string, number> = {};
      const monthLabels: Record<string, string> = {
        "2025-09": "Сен", "2025-10": "Окт", "2025-11": "Ноя",
        "2025-12": "Дек", "2026-01": "Янв", "2026-02": "Фев", "2026-03": "Мар",
      };
      (payments ?? []).forEach((p) => {
        const month = p.payment_date?.slice(0, 7);
        if (month) byMonth[month] = (byMonth[month] ?? 0) + Number(p.amount);
      });

      const monthly = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, fact]) => ({ month: monthLabels[key] ?? key, fact: Math.round(fact / 1000), plan: 0 }));

      const categories = (sections ?? [])
        .filter((s) => !s.parent_id)
        .map((s) => ({
          name: s.name,
          amount: Number(s.budget_amount),
          percent: s.budget_amount > 0 ? Math.round((s.spent_amount / s.budget_amount) * 100) : 0,
        }));

      return { monthly, categories };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useHrData() {
  return useQuery({
    queryKey: ["hr"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fromDate = sevenDaysAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("timesheets")
        .select("work_date, status, hours_worked")
        .gte("work_date", fromDate)
        .order("work_date");
      if (error) throw new Error(error.message);

      const byDay: Record<string, { present: number; absent: number }> = {};
      const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
      (data ?? []).forEach((r) => {
        const d = r.work_date;
        if (!byDay[d]) byDay[d] = { present: 0, absent: 0 };
        if (r.status === "present") byDay[d].present++;
        else byDay[d].absent++;
      });

      const attendance = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({ day: dayNames[new Date(date).getDay()], ...counts }));

      const total = (data ?? []).length;
      const onSite = (data ?? []).filter((r) => r.status === "present").length;
      return { attendance, total, onSite };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSafetyData() {
  return useQuery({
    queryKey: ["safety"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_incidents")
        .select("*")
        .order("incident_datetime", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ["finance"] });
    qc.invalidateQueries({ queryKey: ["hr"] });
    qc.invalidateQueries({ queryKey: ["safety"] });
    qc.invalidateQueries({ queryKey: ["google-sheets"] });
  }, [qc]);
}
