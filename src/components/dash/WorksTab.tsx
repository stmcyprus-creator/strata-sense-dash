import { useMemo, useRef, useState } from "react";
import type { DashboardData, WorkStatus } from "@/lib/dashTypes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, formatDate } from "@/lib/format";
import ExportPdfButton from "./ExportPdfButton";

const STATUS_STYLE: Record<WorkStatus, string> = {
  "выполнено": "bg-success/15 text-success",
  "в работе": "bg-primary/15 text-primary",
  "запланировано": "bg-muted text-muted-foreground",
  "проблема": "bg-destructive/15 text-destructive",
};

export default function WorksTab({ data }: { data: DashboardData }) {
  const [obj, setObj] = useState<string>("all");
  const [foreman, setForeman] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);

  const objects = useMemo(() => Array.from(new Set(data.works.map((w) => w.объект))).sort(), [data]);
  const foremen = useMemo(() => Array.from(new Set(data.works.map((w) => w.прораб))).sort(), [data]);

  const rows = useMemo(
    () =>
      data.works.filter((w) => {
        if (obj !== "all" && w.объект !== obj) return false;
        if (foreman !== "all" && w.прораб !== foreman) return false;
        if (status !== "all" && w.статус !== status) return false;
        if (q && !(`${w.объект} ${w["вид работ"]} ${w.комментарий ?? ""}`.toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
      }),
    [data, obj, foreman, status, q]
  );

  const meta = [
    `Объект: ${obj === "all" ? "все" : obj}`,
    `Прораб: ${foreman === "all" ? "все" : foreman}`,
    `Статус: ${status === "all" ? "все" : status}`,
    ...(q ? [`Поиск: «${q}»`] : []),
    `Записей: ${rows.length}`,
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={obj} onValueChange={setObj}>
          <SelectTrigger><SelectValue placeholder="Объект" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все объекты</SelectItem>
            {objects.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={foreman} onValueChange={setForeman}>
          <SelectTrigger><SelectValue placeholder="Прораб" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все прорабы</SelectItem>
            {foremen.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="выполнено">Выполнено</SelectItem>
            <SelectItem value="в работе">В работе</SelectItem>
            <SelectItem value="запланировано">Запланировано</SelectItem>
            <SelectItem value="проблема">Проблема</SelectItem>
          </SelectContent>
        </Select>
        <ExportPdfButton
          targetRef={exportRef}
          title="Работы"
          meta={meta}
          baseFilename="works"
          orientation="landscape"
          className="lg:justify-self-end"
        />
      </div>

      <div ref={exportRef} className="chart-container overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Дата</th>
                <th className="px-3 py-2 text-left font-medium">Прораб</th>
                <th className="px-3 py-2 text-left font-medium">Объект</th>
                <th className="px-3 py-2 text-left font-medium">Вид работ</th>
                <th className="px-3 py-2 text-right font-medium">Факт</th>
                <th className="px-3 py-2 text-left font-medium">Статус</th>
                <th className="px-3 py-2 text-left font-medium">Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{formatDate(w.дата)}</td>
                  <td className="px-3 py-2">{w.прораб}</td>
                  <td className="px-3 py-2">{w.объект}</td>
                  <td className="px-3 py-2">{w["вид работ"]}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatMoney(w["сумма факт"])}</td>
                  <td className="px-3 py-2">
                    <span className={`badge-status ${STATUS_STYLE[w.статус] ?? ""}`}>{w.статус}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{w.комментарий ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">Ничего не найдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
