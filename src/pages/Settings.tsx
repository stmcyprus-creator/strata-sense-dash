import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ShieldCheck, ShieldAlert, KeyRound, Info } from "lucide-react";

export default function Settings() {
  const rawPin = (import.meta.env.VITE_APP_PIN as string | undefined) ?? "";
  const legacy = (import.meta.env.VITE_APP_PASSWORD as string | undefined) ?? "";
  const effective = rawPin || legacy;
  const isSet = effective.length >= 4 && effective.length <= 6 && /^\d+$/.test(effective);
  const mode = import.meta.env.MODE; // 'development' | 'production'
  const isProd = import.meta.env.PROD;

  // Statuses without revealing the value
  const pinLen = isSet ? effective.length : 0;
  const usingLegacy = !rawPin && !!legacy;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Настройки доступа</h1>
            <p className="text-xs text-muted-foreground">Диагностика PIN-кода и режима сборки</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              К дашборду
            </Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-primary" />
              Состояние PIN
            </CardTitle>
            <CardDescription>Сам PIN не отображается — только факт наличия и длина.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSet ? (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>PIN задан</AlertTitle>
                <AlertDescription>
                  <code>VITE_APP_PIN</code> присутствует в сборке. Длина: <b>{pinLen}</b> цифр.
                  {usingLegacy && (
                    <> Используется устаревшая переменная <code>VITE_APP_PASSWORD</code> — переименуйте в <code>VITE_APP_PIN</code>.</>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>PIN не задан</AlertTitle>
                <AlertDescription>
                  Переменная <code>VITE_APP_PIN</code> отсутствует или некорректна (нужно 4–6 цифр).
                  {effective && !isSet && <> Текущее значение не прошло валидацию (длина {effective.length}).</>}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Режим сборки" value={mode} tone={isProd ? "ok" : "warn"} />
              <Stat
                label="Поведение входа"
                value={isSet ? "Проверка по PIN" : "Dev-fallback (≥4 цифр)"}
                tone={isSet ? "ok" : "warn"}
              />
              <Stat label="Источник переменной" value={rawPin ? "VITE_APP_PIN" : legacy ? "VITE_APP_PASSWORD" : "—"} />
              <Stat label="Длина PIN" value={isSet ? `${pinLen} цифр` : "—"} />
            </div>

            {!isProd && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Dev-режим</AlertTitle>
                <AlertDescription>
                  В preview/локальной разработке без <code>VITE_APP_PIN</code> допускается любой PIN ≥ 4 цифр.
                  На продакшене такой обход не работает.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Как задать PIN</CardTitle>
            <CardDescription>Build-time переменная Vite, требует пересборки.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Vercel (продакшен)</div>
              Settings → Environment Variables → <code>VITE_APP_PIN</code> = 4–6 цифр → Save → Redeploy.
            </div>
            <div>
              <div className="font-medium text-foreground">Локально</div>
              Создать <code>.env.local</code> со строкой <code>VITE_APP_PIN=4729</code> и перезапустить dev-сервер.
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Ограничение безопасности</AlertTitle>
              <AlertDescription>
                Проверка PIN — клиентская: значение попадает в JS-бандл и доступно через DevTools.
                Подходит как «шторка от случайных глаз», но не как полноценная защита.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const toneClass =
    tone === "ok"
      ? "border-primary/30 bg-primary/5 text-primary"
      : tone === "warn"
      ? "border-warning/30 bg-warning/5 text-warning"
      : "border-border bg-muted/30 text-foreground";
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}
