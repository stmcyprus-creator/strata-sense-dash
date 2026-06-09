import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useZdState } from "@/hooks/useZdState";
import Header from "@/components/zd/Header";
import KpiRow from "@/components/zd/KpiRow";
import StackedProgress from "@/components/zd/StackedProgress";
import MatrixTab from "@/components/zd/MatrixTab";
import BudgetTab from "@/components/zd/BudgetTab";
import TimelineTab from "@/components/zd/TimelineTab";

const ZdDashboard = () => {
  const { state, updateCell, reset, importState } = useZdState();

  const totals = useMemo(() => {
    let estimate = 0, actual = 0, active = 0, done = 0, planned = 0;
    for (const c of Object.values(state.cells)) {
      if (c.status === "na") continue;
      estimate += c.estimate;
      actual += c.actual;
      if (c.status === "active") active += c.estimate;
      if (c.status === "done") done += c.estimate;
      if (c.status === "planned") planned += c.estimate;
    }
    return { estimate, actual, active, done, planned };
  }, [state]);

  const overallPct = totals.estimate ? (totals.actual / totals.estimate) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1280px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Header overallPct={overallPct} onReset={reset} />
        <KpiRow totals={{ estimate: totals.estimate, actual: totals.actual, active: totals.active }} />
        <StackedProgress done={totals.done} active={totals.active} planned={totals.planned} />

        <Tabs defaultValue="matrix" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
            <TabsTrigger value="matrix">Матрица работ</TabsTrigger>
            <TabsTrigger value="budget">Бюджет</TabsTrigger>
            <TabsTrigger value="timeline">Таймлайн</TabsTrigger>
          </TabsList>
          <TabsContent value="matrix">
            <MatrixTab state={state} onUpdateCell={updateCell} />
          </TabsContent>
          <TabsContent value="budget">
            <BudgetTab state={state} />
          </TabsContent>
          <TabsContent value="timeline">
            <TimelineTab state={state} />
          </TabsContent>
        </Tabs>

        <footer className="border-t border-border pt-4 text-[11px] text-muted-foreground">
          Данные сохраняются локально в этом браузере. Backend не используется.
        </footer>
      </div>
    </div>
  );
};

export default ZdDashboard;
