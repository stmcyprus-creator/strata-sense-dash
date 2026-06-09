import { HardHat, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtPct } from "@/lib/zdFormat";

interface Props {
  overallPct: number;
  onReset: () => void;
}

const Header = ({ overallPct, onReset }: Props) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
        <HardHat className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Реконструкция · СТМ
        </p>
        <h1 className="text-xl font-bold leading-tight sm:text-2xl">
          База отдыха «Зелёная долина»
        </h1>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Освоено
        </p>
        <p className="font-mono text-3xl font-bold text-primary tabular-nums">
          {fmtPct(overallPct)}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset} title="Сбросить к примеру">
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Сбросить</span>
      </Button>
    </div>
  </header>
);

export default Header;
