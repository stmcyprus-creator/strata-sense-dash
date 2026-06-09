import { Wallet, CheckCircle2, Hourglass, Activity } from "lucide-react";
import { fmtShortRub } from "@/lib/zdFormat";

interface Totals {
  estimate: number;
  actual: number;
  active: number;
}

const Card = ({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
        {icon}
      </div>
    </div>
    <p className="mt-3 font-mono text-2xl font-bold tabular-nums">{value}</p>
  </div>
);

const KpiRow = ({ totals }: { totals: Totals }) => {
  const remaining = Math.max(0, totals.estimate - totals.actual);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        title="Смета (контракт)"
        value={fmtShortRub(totals.estimate)}
        icon={<Wallet className="h-4 w-4" />}
        tone="bg-primary/15 text-primary"
      />
      <Card
        title="Освоено (факт)"
        value={fmtShortRub(totals.actual)}
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="bg-[hsl(160_84%_39%/0.15)] text-[hsl(160_84%_45%)]"
      />
      <Card
        title="Осталось"
        value={fmtShortRub(remaining)}
        icon={<Hourglass className="h-4 w-4" />}
        tone="bg-muted text-muted-foreground"
      />
      <Card
        title="В активной работе"
        value={fmtShortRub(totals.active)}
        icon={<Activity className="h-4 w-4" />}
        tone="bg-primary/15 text-primary"
      />
    </div>
  );
};

export default KpiRow;
