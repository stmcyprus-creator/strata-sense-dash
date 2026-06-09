import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ClipboardList, Calendar, User, MapPin, Layers, MessageSquare, Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/lib/supabaseClient";

const SECTIONS = ["А", "Б"];
const WORK_TYPES = [
  "Монолитные работы ниже 0.0",
  "Монолитные работы выше 0.0",
  "Кирпичная кладка",
  "Земляные работы",
  "Свайное поле",
  "Ростверк",
  "Фундаментная плита",
  "Арматурные работы",
  "Бетонирование",
  "Опалубочные работы",
  "Гидроизоляция",
  "Другое",
];

interface FormData {
  report_date: string;
  section: string;
  floor: string;
  work_type: string;
  description: string;
  progress: string;
  executor: string;
  worker_count: string;
  issues: string;
  notes: string;
}

const defaultForm: FormData = {
  report_date: new Date().toISOString().slice(0, 10),
  section: "А",
  floor: "",
  work_type: "",
  description: "",
  progress: "",
  executor: "",
  worker_count: "",
  issues: "",
  notes: "",
};

const ForemanReport = () => {
  const navigate = useNavigate();
  const { canAccess } = useRole();

  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setRows(data ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.work_type) { setError("Укажите вид работы"); return; }
    if (!form.progress) { setError("Укажите % выполнения"); return; }

    setSaving(true);
    setError(null);

    const { error: dbError } = await supabase.from("work_logs").insert({
      project_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      foreman_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      log_date: form.report_date || new Date().toISOString().split('T')[0],
      work_description: form.work_type + (form.description ? `: ${form.description}` : ''),
      source: 'web',
      section: form.section,
      floor: form.floor || null,
      executor: form.executor || null,
      worker_count: parseInt(form.worker_count) || 0,
      progress: parseFloat(form.progress) || 0,
      notes: form.notes || null,
    });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setSaved(true);
    setForm(defaultForm);
    setShowForm(false);
    await fetchRows();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[800px] space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {canAccess("/") && (
              <button onClick={() => navigate("/")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Отчёт прораба</h1>
                <p className="text-sm text-muted-foreground">Ежедневные записи с объекта</p>
              </div>
            </div>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Добавить отчёт
            </button>
          )}
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Отчёт сохранён успешно
          </div>
        )}

        {showForm && (
          <div className="rounded-xl border border-primary/20 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Новый отчёт</h2>
              <button onClick={() => { setShowForm(false); setError(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Дата</label>
                <input type="date" value={form.report_date} onChange={(e) => handleChange("report_date", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Секция</label>
                <select value={form.section} onChange={(e) => handleChange("section", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  {SECTIONS.map((s) => <option key={s} value={s}>Секция {s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Этаж / уровень</label>
                <input type="text" placeholder="напр. -1, Фундамент" value={form.floor} onChange={(e) => handleChange("floor", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">% выполнения *</label>
                <input type="number" min="0" max="100" placeholder="0–100" value={form.progress} onChange={(e) => handleChange("progress", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Вид работы *</label>
              <select value={form.work_type} onChange={(e) => handleChange("work_type", e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="">— выберите —</option>
                {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Описание</label>
              <input type="text" placeholder="Что конкретно делали" value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Бригада / исполнитель</label>
                <input type="text" placeholder="Бригада Иванова" value={form.executor} onChange={(e) => handleChange("executor", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Рабочих на объекте</label>
                <input type="number" min="0" placeholder="0" value={form.worker_count} onChange={(e) => handleChange("worker_count", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Замечания / проблемы</label>
              <input type="text" placeholder="Если есть" value={form.issues} onChange={(e) => handleChange("issues", e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Примечания</label>
              <input type="text" placeholder="Дополнительно" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? "Сохранение..." : "Сохранить отчёт"}
              </button>
              <button onClick={() => { setShowForm(false); setError(null); }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50">
                Отмена
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Загрузка данных...
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">Нет записей</p>
            <p className="mt-1 text-sm">Нажмите «Добавить отчёт» чтобы внести первую запись</p>
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {row.log_date}
                  </span>
                  {row.section && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Секция {row.section}
                    </span>
                  )}
                  {row.floor && (
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {row.floor}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {row.executor || "—"}
                  </span>
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {row.progress ?? 0}%
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-foreground">{row.work_description}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  {row.worker_count > 0 && (
                    <span className="text-muted-foreground">👷 {row.worker_count} чел.</span>
                  )}
                  {row.notes && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {row.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForemanReport;
