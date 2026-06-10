const moneyFmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

export const formatMoney = (n: number) => `${moneyFmt.format(Math.round(n))} ₽`;
export const formatDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return String(d);
  return dateFmt.format(date);
};
export const formatTime = (d: Date) => timeFmt.format(d);
export const formatPct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;
