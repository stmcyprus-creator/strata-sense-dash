import { MONTHS, ZdState } from "@/lib/zdTypes";

const TimelineTab = ({ state }: { state: ZdState }) => {
  const tradeById = Object.fromEntries(state.trades.map((t) => [t.id, t]));
  const cols = MONTHS.length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Календарный план
        </h3>
        <p className="text-[11px] text-muted-foreground">Май — Декабрь</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Month header */}
          <div
            className="grid border-b border-border pb-1.5 text-[11px] text-muted-foreground"
            style={{ gridTemplateColumns: `220px repeat(${cols}, minmax(0, 1fr))` }}
          >
            <div />
            {MONTHS.map((m) => (
              <div key={m} className="px-1 text-center font-medium">{m}</div>
            ))}
          </div>

          {/* Rows */}
          <div className="mt-2 space-y-2">
            {state.phases.map((p) => {
              const t = tradeById[p.tradeId];
              const span = p.endMonth - p.startMonth + 1;
              const isPlanned = p.status === "planned";
              const isActive = p.status === "active";
              return (
                <div
                  key={p.id}
                  className="relative grid items-center"
                  style={{ gridTemplateColumns: `220px repeat(${cols}, minmax(0, 1fr))` }}
                >
                  <div className="pr-3 text-sm">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t?.name}</div>
                  </div>
                  {/* grid bg cells */}
                  {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="h-9 border-l border-border/40" />
                  ))}
                  {/* bar */}
                  <div
                    className={`pointer-events-none absolute top-1 h-7 rounded-md ${isActive ? "ring-1 ring-white/70" : ""}`}
                    style={{
                      left: `calc(220px + (100% - 220px) * ${p.startMonth} / ${cols})`,
                      width: `calc((100% - 220px) * ${span} / ${cols})`,
                      background: t?.color ?? "hsl(var(--primary))",
                      opacity: isPlanned ? 0.45 : 1,
                    }}
                  >

                    <div className="flex h-full items-center px-2 text-[11px] font-semibold text-white/95 mix-blend-normal">
                      {p.status === "done" ? "Завершено" : p.status === "active" ? "В работе" : "Запланировано"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {state.trades.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-sm" style={{ background: t.color }} />
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineTab;
