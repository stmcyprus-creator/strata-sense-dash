import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { kpiData } from "@/data/mockData";

const SafetyReport = () => {
  const navigate = useNavigate();
  const { data: sheetsData } = useGoogleSheets();

  const incidentCount = sheetsData && sheetsData.prorab.length > 0
    ? sheetsData.prorab.filter((r) => r.issues && r.issues.trim() !== "").length
    : kpiData.safetyIncidents;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к дашборду
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Охрана труда</h1>
            <p className="text-sm text-muted-foreground">Инциденты и безопасность</p>
          </div>
        </div>

        <div className="kpi-card">
          <p className="section-title">Инциденты за месяц</p>
          <p className="value-large mt-1">{incidentCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">зафиксировано</p>
        </div>

        <AlertsFeed prorabData={sheetsData?.prorab} />
      </div>
    </div>
  );
};

export default SafetyReport;
