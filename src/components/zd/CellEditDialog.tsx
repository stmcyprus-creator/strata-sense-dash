import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CellStatus, STATUS_LABEL, ZdCell, ZdObject, ZdTrade } from "@/lib/zdTypes";

interface Props {
  open: boolean;
  object: ZdObject | null;
  trade: ZdTrade | null;
  cell: ZdCell | null;
  onClose: () => void;
  onSave: (next: ZdCell) => void;
}

const CellEditDialog = ({ open, object, trade, cell, onClose, onSave }: Props) => {
  const [estimate, setEstimate] = useState("0");
  const [actual, setActual] = useState("0");
  const [status, setStatus] = useState<CellStatus>("planned");

  useEffect(() => {
    if (cell) {
      setEstimate(String(cell.estimate));
      setActual(String(cell.actual));
      setStatus(cell.status);
    }
  }, [cell, open]);

  const save = () => {
    const e = Math.max(0, Number(estimate) || 0);
    const a = Math.max(0, Number(actual) || 0);
    onSave({ estimate: e, actual: a, status });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {object?.name}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              · {trade?.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CellStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as CellStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="est">Смета, ₽</Label>
            <Input
              id="est"
              type="number"
              inputMode="numeric"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              disabled={status === "na"}
              className="font-mono tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="act">Освоено (факт), ₽</Label>
            <Input
              id="act"
              type="number"
              inputMode="numeric"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              disabled={status === "na"}
              className="font-mono tabular-nums"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CellEditDialog;
