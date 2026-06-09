import {
  DollarSign,
  CalendarDays,
  Users,
  TrendingUp,
  Shield,
  Percent,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import SectionProgress from "@/components/dashboard/SectionProgress";
import FinanceChart from "@/components/dashboard/FinanceChart";
import BudgetBreakdown from "@/components/dashboard/BudgetBreakdown";
import HrOverview from "@/components/dashboard/HrOverview";
import SupplyStatus from "@/components/dashboard/SupplyStatus";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import { kpiData } from "@/data/mockData";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const formatMoney = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} тыс`;
  return v.toString();
};

const Index = () => {
  const { data: sheetsData, isLoading, isFetching, refresh, isError } = useGoogleSheets();
  const prevFetchedAt = useRef<Date | null>(null);

  useEffect(() => {
    if (sheetsData && sheetsData.fetchedAt !== prevFetchedAt.current) {
      prevFetchedAt.current = sheetsData.fetchedAt;
      const prorabCount = sheetsData.prorab.length;
      const supplyCount = sheetsData.supply.length;
      toast.success(`Данные обновлены: прораб — ${prorabCount} записей, поставки — ${supplyCount}`);
    }
  }, [sheetsData]);

  useEffect(() => {
    if (isError) {
      toast.error("Не удалось загрузить данные из Google Sheets");
    }
  }, [isError]);

  // Compute KPI overrides from real data
  const workersOnSite = sheetsData && sheetsData.prorab.length > 0
    ? sheetsData.prorab.reduce((sum, r) => sum + r.workerCount, 0)
    : kpiData.workersOnSite;

  const overallProgress = sheetsData && sheetsData.prorab.length > 0
    ? Math.round(sheetsData.prorab.reduce((sum, r) => sum + r.progress, 0) / sheetsData.prorab.length)
    : kpiData.overallProgress;

  const incidentCount = sheetsData && sheetsData.prorab.length > 0
    ? sheetsData.prorab.filter((r) => r.issues && r.issues.trim() !== "").length
    : kpiData.safetyIncidents;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <DashboardHeader
          onRefresh={refresh}
          isRefreshing={isFetching}
          lastUpdated={sheetsData?.fetchedAt ?? null}
        />

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <KpiCard
            title="Бюджет освоен"
            value={`${formatMoney(kpiData.budgetSpent)} ₽`}
            subtitle={`из ${formatMoney(kpiData.budgetTotal)} ₽`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: "−8%", direction: "down" }}
            href="/budget"
          />
          <KpiCard
            title="Дней прошло"
            value={`${kpiData.daysElapsed}`}
            subtitle={`из ${kpiData.daysTotal} дней`}
            icon={<CalendarDays className="h-5 w-5" />}
            trend={{ value: "26%", direction: "neutral" }}
            href="/schedule"
          />
          <KpiCard
            title="На объекте"
            value={`${workersOnSite}`}
            subtitle={`из ${kpiData.workersTotal} чел.`}
            icon={<Users className="h-5 w-5" />}
            trend={{ value: "91%", direction: "up" }}
            href="/workers"
          />
          <KpiCard
            title="Общий прогресс"
            value={`${overallProgress}%`}
            subtitle="фундамент"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: "+2.3%", direction: "up" }}
            href="/progress"
          />
          <KpiCard
            title="Материалы"
            value={`${kpiData.materialsDelivered}%`}
            subtitle="обеспеченность"
            icon={<Percent className="h-5 w-5" />}
            trend={{ value: "+5%", direction: "up" }}
            href="/materials"
          />
          <KpiCard
            title="Инциденты ОТ"
            value={`${incidentCount}`}
            subtitle="за месяц"
            icon={<Shield className="h-5 w-5" />}
            trend={{ value: "−1", direction: "down" }}
            href="/safety"
          />
        </div>

        {/* Section Progress + Alerts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionProgress prorabData={sheetsData?.prorab} />
          </div>
          <AlertsFeed prorabData={sheetsData?.prorab} />
        </div>

        {/* Finance Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FinanceChart />
          </div>
          <BudgetBreakdown />
        </div>

        {/* HR + Supply */}
        <div className="grid gap-4 lg:grid-cols-2">
          <HrOverview />
          <SupplyStatus supplyRows={sheetsData?.supply} />
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Источники: Прораб · Снабжение · HR · Финансы</span>
          <span className="font-mono">
            {isLoading ? "Загрузка..." : "Данные актуальны ✓"}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Index;
