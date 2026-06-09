import { useNavigate } from "react-router-dom";
import { ArrowLeft, Percent } from "lucide-react";
import SupplyStatus from "@/components/dashboard/SupplyStatus";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { kpiData } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";

const MaterialsReport = () => {
  const navigate = useNavigate();
  const { data: sheetsData } = useGoogleSheets();
  const { canAccess } = useRole();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {canAccess("/") && (
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Назад к дашборду
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Материалы и снабжение</h1>
            <p className="text-sm text-muted-foreground">Обеспеченность и поставки</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="kpi-card">
            <p className="section-title">Обеспеченность</p>
            <p className="value-large mt-1">{kpiData.materialsDelivered}%</p>
            <p className="mt-1 text-xs text-muted-foreground">материалов доставлено</p>
          </div>
          <div className="kpi-card">
            <p className="section-title">Потребность</p>
            <p className="value-large mt-1">{100 - kpiData.materialsDelivered}%</p>
            <p className="mt-1 text-xs text-muted-foreground">ожидает поставки</p>
          </div>
        </div>

        <SupplyStatus supplyRows={sheetsData?.supply} />
      </div>
    </div>
  );
};

export default MaterialsReport;
