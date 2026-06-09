import { Building2, Calendar, HardHat, Clock, RefreshCw } from "lucide-react";
import { projectInfo } from "@/data/mockData";
import RoleSwitcher from "@/components/RoleSwitcher";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
}

const DashboardHeader = ({ onRefresh, isRefreshing, lastUpdated }: DashboardHeaderProps) => {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {projectInfo.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {projectInfo.address} · {projectInfo.totalArea.toLocaleString("ru-RU")} м²
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <RoleSwitcher />
        <div className="flex items-center gap-2">
          <HardHat className="h-4 w-4 text-primary" />
          <span>Стадия: <span className="font-semibold text-foreground">{projectInfo.stage}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{today}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs">Обновлено {lastUpdatedStr}</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Обновить
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
