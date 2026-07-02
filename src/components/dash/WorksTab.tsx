import { useMemo, useRef, useState } from "react";
import type { DashboardData, WorkStatus } from "@/lib/dashTypes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  const objects = useMemo(() => Array.from(new Set(data.works.map((w) => w.объект).filter(Boolean))).sort(), [data]);
  const foremen = useMemo(() => Array.from(new Set(data.works.map((w) => w.прораб).filter(Boolean))).sort(), [data]);

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

  // Группировка по разделу (виду работ)
  const groups = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const r of rows) {
      const key = r["вид работ"] || "Без раздела";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        items,
        total: items.reduce((s, x) => s + (x["сумма факт"] || 0), 0),
        problems: items.filter((x) => x.статус === "проблема").length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [rows]);

  const meta = [
    `Объект: ${obj === "all" ? "все" : obj}`,
    `Прораб: ${foreman === "all" ? "все" : foreman}`,
    `Статус: ${status === "all" ? "все" : status}`,
    ...(q ? [`Поиск: «${q}»`] : []),
    `Записей: ${rows.length}`,
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-5">
        <Input placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} className="col-span-2 lg:col-span-1" />

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

      <div ref={exportRef} className="chart-container p-2 sm:p-3">
        {groups.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Ничего не найдено</div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {groups.map((g) => (
              <AccordionItem key={g.name} value={g.name} className="border-border/50">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex flex-1 items-center justify-between gap-3 pr-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate text-left">{g.name}</span>
                      <span className="badge-status bg-secondary/60 text-muted-foreground shrink-0">{g.items.length}</span>
                      {g.problems > 0 && (
                        <span className="badge-status bg-destructive/15 text-destructive shrink-0">!{g.problems}</span>
                      )}
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-muted-foreground shrink-0">
                      {formatMoney(g.total)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  {/* Mobile: card list */}
                  <div className="divide-y divide-border/50 md:hidden">
                    {g.items.map((w, i) => (
                      <div key={i} className="py-2.5 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium truncate">{w.объект}</div>
                          <span className={`badge-status shrink-0 ${STATUS_STYLE[w.статус] ?? ""}`}>{w.статус}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono">{formatDate(w.дата)} · {w.прораб}</span>
                          <span className="font-mono font-medium">{formatMoney(w["сумма факт"])}</span>
                        </div>
                        {w.комментарий && (
                          <p className="text-xs text-muted-foreground">{w.комментарий}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Дата</th>
                          <th className="px-3 py-2 text-left font-medium">Прораб</th>
                          <th className="px-3 py-2 text-left font-medium">Объект</th>
                          <th className="px-3 py-2 text-right font-medium">Факт</th>
                          <th className="px-3 py-2 text-left font-medium">Статус</th>
                          <th className="px-3 py-2 text-left font-medium">Комментарий</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.items.map((w, i) => (
                          <tr key={i} className="border-t border-border/50 hover:bg-secondary/20">
                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{formatDate(w.дата)}</td>
                            <td className="px-3 py-2">{w.прораб}</td>
                            <td className="px-3 py-2">{w.объект}</td>
                            <td className="px-3 py-2 text-right font-mono">{formatMoney(w["сумма факт"])}</td>
                            <td className="px-3 py-2">
                              <span className={`badge-status ${STATUS_STYLE[w.статус] ?? ""}`}>{w.статус}</span>
                            </td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{w.комментарий ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
