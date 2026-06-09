import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign } from "lucide-react";
import FinanceChart from "@/components/dashboard/FinanceChart";
import BudgetBreakdown from "@/components/dashboard/BudgetBreakdown";
import { kpiData, financeData } from "@/data/mockData";

const formatMoney = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} тыс`;
  return v.toString();
};

const BudgetReport = () => {
  const navigate = useNavigate();

  const spent = kpiData.budgetSpent;
  const total = kpiData.budgetTotal;
  const remaining = total - spent;
  const pct = Math.round((spent / total) * 100);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к дашборду
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Бюджет проекта</h1>
            <p className="text-sm text-muted-foreground">Детальный отчёт по освоению бюджета</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Освоено", value: `${formatMoney(spent)} ₽`, sub: `${pct}% от бюджета` },
            { label: "Остаток", value: `${formatMoney(remaining)} ₽`, sub: `${100 - pct}% бюджета` },
            { label: "Общий бюджет", value: `${formatMoney(total)} ₽`, sub: "утверждённый" },
          ].map((item) => (
            <div key={item.label} className="kpi-card">
              <p className="section-title">{item.label}</p>
              <p className="value-large mt-1">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><FinanceChart /></div>
          <BudgetBreakdown />
        </div>
      </div>
    </div>
  );
};

export default BudgetReport;
