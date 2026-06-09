import { SupplyRow } from "@/lib/googleSheets";
import { supplyData as mockSupplyData } from "@/data/mockData";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

interface SupplyStatusProps {
  supplyRows?: SupplyRow[];
}

const SupplyStatus = ({ supplyRows }: SupplyStatusProps) => {
  const hasRealData = supplyRows && supplyRows.length > 0;

  // If we have real data, display it; otherwise fallback to mock
  const items = hasRealData
    ? supplyRows.map((r) => ({
        name: r.material,
        qty: `${r.quantity} ${r.unit}`,
        date: r.date,
        supplier: r.supplier,
        plateNumber: r.plateNumber,
        time: r.time,
      }))
    : mockSupplyData.items.map((item) => ({
        name: item.name,
        qty: item.qty,
        date: item.date,
        supplier: "",
        plateNumber: "",
        time: "",
      }));

  return (
    <div className="chart-container">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">Снабжение</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          <span>{items.length} позиций</span>
          {hasRealData && (
            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" title="Данные обновлены" />
          )}
        </div>
      </div>

      {!hasRealData && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[
            { label: "Ожидает", value: mockSupplyData.pending, color: "text-muted-foreground" },
            { label: "В пути", value: mockSupplyData.inTransit, color: "text-info" },
            { label: "Доставлено", value: mockSupplyData.delivered, color: "text-success" },
            { label: "Задержка", value: mockSupplyData.delayed, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary/50 p-2 text-center">
              <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {hasRealData && (
        <div className="mb-4 rounded-lg bg-secondary/50 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-primary">{items.length}</p>
          <p className="text-[10px] text-muted-foreground">Поставок загружено</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm transition-colors hover:bg-secondary/30"
          >
            <div className="flex items-center gap-2">
              {hasRealData ? (
                <Truck className="h-3.5 w-3.5 text-info" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              )}
              <span className="truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{item.qty}</span>
              {item.supplier && <span className="truncate max-w-[100px]">{item.supplier}</span>}
              <span className="font-mono">{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplyStatus;
