export const DEFAULT_WEIGHT_KG = 56.6;
export const DEFAULT_HEIGHT_CM = 165;

export function todayKey() {
  return formatDate(new Date());
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function recentDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    return formatDate(date);
  });
}

export function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: formatDate(start), end: formatDate(end) };
}

export function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function formatGram(value: number) {
  return `${value.toFixed(1).replace(/\\.0$/, "")}g`;
}

export function formatCurrency(value: number) {
  return `¥${value.toFixed(2).replace(/\\.00$/, "")}`;
}

export function balanceLabel(prefix: string, income: number, expense: number) {
  const balance = income - expense;
  if (balance > 0) return { label: `${prefix}结余`, value: formatCurrency(balance), tone: "positive" as const };
  if (balance < 0) return { label: `${prefix}净支出`, value: formatCurrency(Math.abs(balance)), tone: "negative" as const };
  return { label: `${prefix}收支平衡`, value: formatCurrency(0), tone: "neutral" as const };
}

export function signedCurrency(type: "income" | "expense", amount: number) {
  return `${type === "income" ? "+" : "-"}${formatCurrency(amount)}`;
}
