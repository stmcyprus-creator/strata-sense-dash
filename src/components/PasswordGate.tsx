import { useState, FormEvent, ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

const STORAGE_KEY = "zd_auth_ok_v1";

export default function PasswordGate({ children }: { children: ReactNode }) {
  const expected = (import.meta.env.VITE_APP_PASSWORD as string | undefined) ?? "";
  const [ok, setOk] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setOk(true);
  }, []);

  if (ok) return <>{children}</>;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!expected) {
      // Dev fallback: any non-empty password works if VITE_APP_PASSWORD is not set
      if (value.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setOk(true);
        return;
      }
      setError("Введите любой пароль (VITE_APP_PASSWORD не задан)");
      return;
    }
    if (value === expected) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOk(true);
    } else {
      setError("Неверный пароль");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">База отдыха «Зелёная долина»</h1>
            <p className="text-xs text-muted-foreground">Контроль реновации</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="pw">Пароль доступа</label>
          <Input
            id="pw"
            type="password"
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            placeholder="••••••••"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full">Войти</Button>
      </form>
    </div>
  );
}
