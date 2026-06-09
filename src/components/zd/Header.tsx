import { useRef } from "react";
import { HardHat, RotateCcw, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtPct } from "@/lib/zdFormat";
import { toast } from "sonner";
import type { ZdState } from "@/lib/zdTypes";

interface Props {
  overallPct: number;
  state: ZdState;
  onReset: () => void;
  onImport: (data: unknown) => boolean;
}

const Header = ({ overallPct, state, onReset, onImport }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `zelenaya-dolina-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Резервная копия сохранена");
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (onImport(data)) {
        toast.success("Данные загружены из резервной копии");
      } else {
        toast.error("Неверный формат файла");
      }
    } catch {
      toast.error("Не удалось прочитать файл");
    }
  };

  return (
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
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Освоено
          </p>
          <p className="font-mono text-3xl font-bold text-primary tabular-nums">
            {fmtPct(overallPct)}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} title="Скачать резервную копию">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Экспорт</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick} title="Загрузить резервную копию">
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Импорт</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} title="Сбросить к примеру">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden md:inline">Сбросить</span>
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </header>
  );
};

export default Header;
