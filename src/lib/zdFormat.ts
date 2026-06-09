const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export const fmtRub = (n: number) => `${rub.format(Math.round(n))} ₽`;

export const fmtShort = (n: number) => {
  if (!n) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace(".", ",")} млн`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)} тыс`;
  return rub.format(n);
};

export const fmtShortRub = (n: number) => `${fmtShort(n)} ₽`;

export const fmtPct = (n: number) => `${Math.round(n)}%`;
