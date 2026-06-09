import { fmtShortRub } from "@/lib/zdFormat";

interface Props {
  done: number;
  active: number;
  planned: number;
}

const StackedProgress = ({ done, active, planned }: Props) => {
  const total = Math.max(1, done + active + planned);
  const dp = (done / total) * 100;
  const ap = (active / total) * 100;
  const pp = (planned / total) * 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div style={{ width: `${dp}%` }} className="h-full bg-[hsl(160_84%_39%)]" />
        <div style={{ width: `${ap}%` }} className="h-full bg-primary" />
        <div style={{ width: `${pp}%` }} className="h-full bg-muted-foreground/30" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <Legend color="bg-[hsl(160_84%_39%)]" label="Завершено" value={fmtShortRub(done)} />
        <Legend color="bg-primary" label="В работе" value={fmtShortRub(active)} />
        <Legend color="bg-muted-foreground/40" label="Запланировано" value={fmtShortRub(planned)} />
      </div>
    </div>
  );
};

const Legend = ({ color, label, value }: { color: string; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono tabular-nums">{value}</span>
  </div>
);

export default StackedProgress;
