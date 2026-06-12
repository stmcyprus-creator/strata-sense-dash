import { useEffect, useRef, useState, ReactNode, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, Delete } from "lucide-react";

const STORAGE_KEY = "zd_auth_ok_v1";
const MAX_LEN = 6;

export default function PinGate({ children }: { children: ReactNode }) {
  const expected =
    (import.meta.env.VITE_APP_PIN as string | undefined) ??
    (import.meta.env.VITE_APP_PASSWORD as string | undefined) ??
    "";
  const minLen = Math.max(4, Math.min(MAX_LEN, expected.length || 4));

  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setOk(true);
  }, []);

  useEffect(() => {
    if (!ok) inputRef.current?.focus();
  }, [ok]);

  if (ok) return <>{children}</>;

  const tryUnlock = (value: string) => {
    if (!expected) {
      if (value.length >= 4) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setOk(true);
      } else {
        setError("Введите PIN (VITE_APP_PIN не задан — подойдёт любой ≥4 цифр)");
      }
      return;
    }
    if (value === expected) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOk(true);
    } else {
      setError("Неверный PIN");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setPin("");
    }
  };

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, MAX_LEN);
    setPin(digits);
    setError(null);
    if (expected && digits.length === expected.length) {
      tryUnlock(digits);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin.length < minLen) {
      setError(`Минимум ${minLen} цифр`);
      return;
    }
    tryUnlock(pin);
  };

  const press = (d: string) => {
    if (pin.length >= MAX_LEN) return;
    onChange(pin + d);
  };
  const back = () => onChange(pin.slice(0, -1));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className={`w-full max-w-xs rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 ${
          shake ? "animate-[shake_0.4s_ease]" : ""
        }`}
      >
        <style>{`@keyframes shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold">База «Зелёная долина»</h1>
          <p className="text-xs text-muted-foreground">Введите PIN-код доступа</p>
        </div>

        {/* hidden numeric input for mobile keypad + paste */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          value={pin}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-label="PIN"
        />

        <div
          className="flex justify-center gap-2"
          onClick={() => inputRef.current?.focus()}
        >
          {Array.from({ length: MAX_LEN }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                className={`h-3 w-3 rounded-full border transition-colors ${
                  filled ? "bg-primary border-primary" : "border-border bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <Button
              key={d}
              type="button"
              variant="secondary"
              className="h-12 text-lg font-medium"
              onClick={() => press(d)}
            >
              {d}
            </Button>
          ))}
          <div />
          <Button
            type="button"
            variant="secondary"
            className="h-12 text-lg font-medium"
            onClick={() => press("0")}
          >
            0
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-12"
            onClick={back}
            aria-label="Стереть"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={pin.length < minLen}>
          Войти
        </Button>
      </form>
    </div>
  );
}
