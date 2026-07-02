import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { RefreshCw, LogOut, WifiOff, Settings as SettingsIcon } from "lucide-react";
import KpiCards from "@/components/dash/KpiCards";
import WorksTab from "@/components/dash/WorksTab";
import EstimatesTab from "@/components/dash/EstimatesTab";
import ProblemsTab from "@/components/dash/ProblemsTab";
import { formatTime } from "@/lib/format";

type TabKey = "works" | "estimates" | "problems";

export default function Dashboard() {
  const { data, isLoading, refetch, isFetching } = useDashboardData();
  const [tab, setTab] = useState<TabKey>("works");

  const logout = () => {
    sessionStorage.removeItem("zd_auth_ok_v1");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1280px] space-y-4 p-3 sm:space-y-5 sm:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight sm:text-2xl">
              База отдыха «Зелёная долина»
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">Контроль реновации и реконструкции</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {data?.offline && (
              <span className="badge-status border border-warning/40 bg-warning/10 text-warning">
                <WifiOff className="h-3 w-3" /> <span className="hidden sm:inline">нет связи с данными</span>
              </span>
            )}
            {data?.fetchedAt && (
              <span className="hidden text-xs text-muted-foreground md:inline">
                обновлено {formatTime(data.fetchedAt)}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Обновить">
              <RefreshCw className={`h-3.5 w-3.5 sm:mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Обновить</span>
            </Button>
            <Button asChild variant="ghost" size="sm" aria-label="Доступ">
              <Link to="/settings">
                <SettingsIcon className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Доступ</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} aria-label="Выйти">
              <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </header>


        {isLoading || !data ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : (
          <>
            <KpiCards data={data.data} />
            <Tabs defaultValue="works" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
                <TabsTrigger value="works">Работы</TabsTrigger>
                <TabsTrigger value="estimates">Сметы vs Факт</TabsTrigger>
                <TabsTrigger value="problems">Проблемы</TabsTrigger>
              </TabsList>
              <TabsContent value="works"><WorksTab data={data.data} /></TabsContent>
              <TabsContent value="estimates"><EstimatesTab data={data.data} /></TabsContent>
              <TabsContent value="problems"><ProblemsTab data={data.data} /></TabsContent>
            </Tabs>
          </>
        )}

        <footer className="border-t border-border pt-4 text-[11px] text-muted-foreground">
          Данные загружаются с <span className="font-mono">/api/data</span>. При недоступности эндпоинта показываются демо-данные.
        </footer>
      </div>
    </div>
  );
}
