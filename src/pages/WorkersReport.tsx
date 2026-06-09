import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import HrOverview from "@/components/dashboard/HrOverview";
import { kpiData } from "@/data/mockData";

const WorkersReport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к дашборду
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Персонал на объекте</h1>
            <p className="text-sm text-muted-foreground">Детальный отчёт по рабочей силе</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "На объекте", value: `${kpiData.workersOnSite}`, sub: "сегодня" },
            { label: "Всего в штате", value: `${kpiData.workersTotal}`, sub: "по проекту" },
            { label: "Присутствие", value: `${Math.round((kpiData.workersOnSite / kpiData.workersTotal) * 100)}%`, sub: "от штата" },
          ].map((item) => (
            <div key={item.label} className="kpi-card">
              <p className="section-title">{item.label}</p>
              <p className="value-large mt-1">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>

        <HrOverview />
      </div>
    </div>
  );
};

export default WorkersReport;
