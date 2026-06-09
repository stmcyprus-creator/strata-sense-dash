import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import SectionProgress from "@/components/dashboard/SectionProgress";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { kpiData } from "@/data/mockData";

const ProgressReport = () => {
  const navigate = useNavigate();
  const { data: sheetsData } = useGoogleSheets();

  const overallProgress = sheetsData && sheetsData.prorab.length > 0
    ? Math.round(sheetsData.prorab.reduce((sum, r) => sum + r.progress, 0) / sheetsData.prorab.length)
    : kpiData.overallProgress;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к дашборду
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Прогресс строительства</h1>
            <p className="text-sm text-muted-foreground">Детализация по секциям и видам работ</p>
          </div>
        </div>

        <div className="kpi-card">
          <p className="section-title">Общий прогресс</p>
          <p className="value-large mt-1">{overallProgress}%</p>
          <div className="progress-bar mt-3 h-4">
            <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <SectionProgress prorabData={sheetsData?.prorab} />
      </div>
    </div>
  );
};

export default ProgressReport;
