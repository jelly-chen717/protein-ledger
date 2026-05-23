"use client";

import { useEffect, useMemo, useState } from "react";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import StatCard from "@/components/StatCard";
import YearlyOverview from "@/components/YearlyOverview";
import type { StatsViewMode } from "@/components/StatsPeriodControls";
import { createClient } from "@/lib/supabase/client";
import type { LedgerRecord, ProteinRecord } from "@/lib/types";
import {
  DEFAULT_WEIGHT_KG,
  balanceLabel,
  formatCurrency,
  formatGram,
  todayKey,
  toNumber
} from "@/lib/utils";

type StatsTab = "protein" | "ledger";

type MonthStats = {
  total: number;
  dates: Set<string>;
};

type LedgerStats = {
  income: number;
  expense: number;
  count: number;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function yearRange(year: number) {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
}

function recordMonth(recordDate: string) {
  return Number(recordDate.slice(5, 7));
}

function isSelectedMonth(recordDate: string, year: number, month: number) {
  return recordDate.startsWith(`${year}-${pad2(month)}-`);
}

function signedNetExpense(value: number) {
  if (value < 0) {
    return `收 ${formatCurrency(Math.abs(value))}`;
  }

  return formatCurrency(value);
}

function compactMoney(value: number) {
  const formatted = Math.abs(value).toFixed(1);

  if (value < 0) {
    return `收${formatted}`;
  }

  return formatted;
}

function ledgerIntensity(value: number) {
  if (value <= 0) return "none" as const;
  if (value <= 30) return "low" as const;
  if (value <= 80) return "medium" as const;
  return "high" as const;
}

function proteinBadge(total: number) {
  const weight = DEFAULT_WEIGHT_KG;

  if (total >= weight * 2) return "③";
  if (total >= weight * 1.8) return "②";
  if (total >= weight * 1.6) return "①";
  return undefined;
}

export default function StatsDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const now = useMemo(() => new Date(), []);
  const [proteinRecords, setProteinRecords] = useState<ProteinRecord[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [todayProteinRecords, setTodayProteinRecords] = useState<ProteinRecord[]>([]);
  const [todayLedgerRecords, setTodayLedgerRecords] = useState<LedgerRecord[]>([]);
  const [tab, setTab] = useState<StatsTab>("protein");
  const [viewMode, setViewMode] = useState<StatsViewMode>("daily");
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = useMemo(() => todayKey(), []);
  const target = DEFAULT_WEIGHT_KG * 1.6;
  const range = useMemo(() => yearRange(selectedYear), [selectedYear]);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      setError("");

      const [proteinResult, ledgerResult, todayProteinResult, todayLedgerResult] =
        await Promise.all([
          supabase
            .from("protein_records")
            .select("*")
            .gte("record_date", range.start)
            .lte("record_date", range.end)
            .order("record_date", { ascending: true }),
          supabase
            .from("ledger_records")
            .select("*")
            .gte("record_date", range.start)
            .lte("record_date", range.end)
            .order("record_date", { ascending: true }),
          supabase.from("protein_records").select("*").eq("record_date", today),
          supabase.from("ledger_records").select("*").eq("record_date", today)
        ]);

      if (!mounted) return;
      setLoading(false);

      const errorMessage =
        proteinResult.error?.message ||
        ledgerResult.error?.message ||
        todayProteinResult.error?.message ||
        todayLedgerResult.error?.message ||
        "";

      if (errorMessage) {
        setError(errorMessage);
        return;
      }

      setProteinRecords((proteinResult.data ?? []) as ProteinRecord[]);
      setLedgerRecords((ledgerResult.data ?? []) as LedgerRecord[]);
      setTodayProteinRecords((todayProteinResult.data ?? []) as ProteinRecord[]);
      setTodayLedgerRecords((todayLedgerResult.data ?? []) as LedgerRecord[]);
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, [range.end, range.start, supabase, today]);

  function changePeriod(year: number, month: number) {
    setSelectedYear(year);
    setSelectedMonth(month);
  }

  function backToToday() {
    const current = new Date();
    setSelectedYear(current.getFullYear());
    setSelectedMonth(current.getMonth() + 1);
    setViewMode("daily");
  }

  function openMonth(month: number) {
    setSelectedMonth(month);
    setViewMode("daily");
  }

  const selectedProteinRecords = proteinRecords.filter((record) =>
    isSelectedMonth(record.record_date, selectedYear, selectedMonth)
  );
  const selectedLedgerRecords = ledgerRecords.filter((record) =>
    isSelectedMonth(record.record_date, selectedYear, selectedMonth)
  );

  const proteinTotals = selectedProteinRecords.reduce<Record<string, number>>(
    (acc, record) => {
      acc[record.record_date] =
        (acc[record.record_date] ?? 0) + toNumber(record.protein_g);
      return acc;
    },
    {}
  );

  const proteinCalendarValues = Object.fromEntries(
    Object.entries(proteinTotals).map(([date, total]) => [
      date,
      {
        value: formatGram(total),
        hasRecord: total > 0,
        badge: proteinBadge(total),
        isComplete: total >= target
      }
    ])
  );

  const proteinMonthStats = proteinRecords.reduce<Record<number, MonthStats>>(
    (acc, record) => {
      const month = recordMonth(record.record_date);
      const stats = acc[month] ?? { total: 0, dates: new Set<string>() };
      stats.total += toNumber(record.protein_g);
      stats.dates.add(record.record_date);
      acc[month] = stats;
      return acc;
    },
    {}
  );

  const proteinYearValues = Object.fromEntries(
    Object.entries(proteinMonthStats).map(([month, stats]) => {
      const average = stats.dates.size > 0 ? stats.total / stats.dates.size : 0;

      return [
        Number(month),
        {
          value: `${formatGram(average)}/日`,
          hasRecord: stats.dates.size > 0,
          isComplete: average >= target
        }
      ];
    })
  );

  const selectedProteinDates = new Set(
    selectedProteinRecords.map((record) => record.record_date)
  );
  const selectedProteinTotal = selectedProteinRecords.reduce(
    (sum, record) => sum + toNumber(record.protein_g),
    0
  );
  const selectedProteinAverage =
    selectedProteinDates.size > 0 ? selectedProteinTotal / selectedProteinDates.size : 0;

  const todayProtein = todayProteinRecords.reduce(
    (sum, record) => sum + toNumber(record.protein_g),
    0
  );
  const todayExpense = todayLedgerRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + toNumber(record.amount), 0);
  const todayIncome = todayLedgerRecords
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + toNumber(record.amount), 0);
  const monthExpense = selectedLedgerRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + toNumber(record.amount), 0);
  const monthIncome = selectedLedgerRecords
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + toNumber(record.amount), 0);
  const todayBalance = balanceLabel("今日", todayIncome, todayExpense);
  const monthBalance = balanceLabel("所选月", monthIncome, monthExpense);
  const isCurrentSelectedMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  const ledgerByDate = selectedLedgerRecords.reduce<Record<string, LedgerStats>>(
    (acc, record) => {
      const daily = acc[record.record_date] ?? { income: 0, expense: 0, count: 0 };
      daily[record.type] += toNumber(record.amount);
      daily.count += 1;
      acc[record.record_date] = daily;
      return acc;
    },
    {}
  );

  const ledgerCalendarValues = Object.fromEntries(
    Object.entries(ledgerByDate).map(([date, daily]) => {
      const netExpense = daily.expense - daily.income;
      return [
        date,
        {
          value: compactMoney(netExpense),
          hasRecord: daily.count > 0,
          intensity: ledgerIntensity(netExpense)
        }
      ];
    })
  );

  const ledgerMonthStats = ledgerRecords.reduce<Record<number, LedgerStats>>(
    (acc, record) => {
      const month = recordMonth(record.record_date);
      const stats = acc[month] ?? { income: 0, expense: 0, count: 0 };
      stats[record.type] += toNumber(record.amount);
      stats.count += 1;
      acc[month] = stats;
      return acc;
    },
    {}
  );

  const ledgerYearValues = Object.fromEntries(
    Object.entries(ledgerMonthStats).map(([month, stats]) => {
      const netExpense = stats.expense - stats.income;
      return [
        Number(month),
        {
          value: signedNetExpense(netExpense),
          hasRecord: stats.count > 0,
          intensity: ledgerIntensity(netExpense)
        }
      ];
    })
  );

  const categoryTop = Object.entries(
    selectedLedgerRecords
      .filter((record) => record.type === "expense")
      .reduce<Record<string, number>>((acc, record) => {
        acc[record.category] = (acc[record.category] ?? 0) + toNumber(record.amount);
        return acc;
      }, {})
  )
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxCategory = Math.max(...categoryTop.map((item) => item.total), 1);

  const detailProteinRecords = detailDate
    ? proteinRecords.filter((record) => record.record_date === detailDate)
    : [];
  const detailLedgerRecords = detailDate
    ? ledgerRecords.filter((record) => record.record_date === detailDate)
    : [];
  const detailProteinTotal = detailProteinRecords.reduce(
    (sum, record) => sum + toNumber(record.protein_g),
    0
  );
  const detailExpense = detailLedgerRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + toNumber(record.amount), 0);
  const detailIncome = detailLedgerRecords
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + toNumber(record.amount), 0);
  const detailNetExpense = detailExpense - detailIncome;

  if (loading) {
    return <p className="panel text-sm text-slate-500">统计加载中...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-mint p-1">
        <button
          type="button"
          className={`min-h-12 rounded-xl text-base font-black transition ${
            tab === "protein" ? "bg-white text-leaf shadow-soft" : "text-slate-600"
          }`}
          onClick={() => setTab("protein")}
        >
          蛋白质
        </button>
        <button
          type="button"
          className={`min-h-12 rounded-xl text-base font-black transition ${
            tab === "ledger" ? "bg-white text-leaf shadow-soft" : "text-slate-600"
          }`}
          onClick={() => setTab("ledger")}
        >
          记账
        </button>
      </div>

      {tab === "protein" ? (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {isCurrentSelectedMonth ? (
              <>
                <StatCard label="今日摄入" value={formatGram(todayProtein)} />
                <StatCard label="当前目标" value="1.6 倍体重" helper={formatGram(target)} />
              </>
            ) : (
              <>
                <StatCard label="所选月日均" value={formatGram(selectedProteinAverage)} />
                <StatCard label="记录天数" value={`${selectedProteinDates.size} 天`} />
              </>
            )}
          </div>

          {viewMode === "daily" ? (
            <MonthlyCalendar
              title="蛋白质日历"
              values={proteinCalendarValues}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPeriodChange={changePeriod}
              onToday={backToToday}
              onDayClick={setDetailDate}
            />
          ) : (
            <YearlyOverview
              title="年度蛋白质日均"
              values={proteinYearValues}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPeriodChange={changePeriod}
              onToday={backToToday}
              onMonthClick={openMonth}
            />
          )}
        </section>
      ) : (
        <section className="space-y-3">
          {isCurrentSelectedMonth ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                <p className="text-sm font-semibold text-slate-500">今日支出</p>
                <p className="mt-2 text-3xl font-black text-red-600">
                  {formatCurrency(todayExpense)}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                <p className="text-sm font-semibold text-slate-500">本月支出</p>
                <p className="mt-2 text-3xl font-black text-red-600">
                  {formatCurrency(monthExpense)}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">今日收入</p>
                <p className="mt-1 text-lg font-black text-leaf">
                  {formatCurrency(todayIncome)}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">本月收入</p>
                <p className="mt-1 text-lg font-black text-leaf">
                  {formatCurrency(monthIncome)}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">{todayBalance.label}</p>
                <p className="mt-1 text-lg font-black text-ink">{todayBalance.value}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">{monthBalance.label}</p>
                <p className="mt-1 text-lg font-black text-ink">{monthBalance.value}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard label="所选月支出" value={formatCurrency(monthExpense)} />
              <StatCard label="所选月收入" value={formatCurrency(monthIncome)} />
              <StatCard label={monthBalance.label} value={monthBalance.value} />
            </div>
          )}

          {viewMode === "daily" ? (
            <MonthlyCalendar
              title="净支出日历"
              values={ledgerCalendarValues}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPeriodChange={changePeriod}
              onToday={backToToday}
              onDayClick={setDetailDate}
            />
          ) : (
            <YearlyOverview
              title="年度净支出"
              values={ledgerYearValues}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPeriodChange={changePeriod}
              onToday={backToToday}
              onMonthClick={openMonth}
            />
          )}

          <div className="panel">
            <h3 className="text-base font-black text-ink">所选月支出类型 Top 6</h3>
            {categoryTop.length === 0 ? (
              <p className="mt-3 rounded-xl bg-paper px-4 py-5 text-center text-sm text-slate-500">
                所选月暂无支出记录
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {categoryTop.map((item, index) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-ink">
                        {index + 1}. {item.category}
                      </span>
                      <span className="text-sm font-black text-sky-600">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${(item.total / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {detailDate ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[82vh] w-full overflow-y-auto rounded-2xl border border-line bg-white p-4 shadow-soft sm:max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black text-leaf">
                  {tab === "protein" ? "蛋白质记录" : "记账记录"}
                </p>
                <h3 className="mt-1 text-xl font-black text-ink">{detailDate}</h3>
              </div>
              <button
                type="button"
                className="rounded-xl border border-line px-3 py-2 text-sm font-black text-slate-600"
                onClick={() => setDetailDate(null)}
              >
                关闭
              </button>
            </div>

            {tab === "protein" ? (
              detailProteinRecords.length === 0 ? (
                <p className="mt-4 rounded-xl bg-paper px-4 py-5 text-center text-sm text-slate-500">
                  这天没有蛋白质记录。
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {detailProteinRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm font-black text-ink">
                        {record.name}
                      </span>
                      <span className="shrink-0 text-sm font-black text-leaf">
                        {formatGram(toNumber(record.protein_g))}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-line pt-3 text-sm font-black">
                    <span>合计</span>
                    <span className="text-leaf">{formatGram(detailProteinTotal)}</span>
                  </div>
                </div>
              )
            ) : detailLedgerRecords.length === 0 ? (
              <p className="mt-4 rounded-xl bg-paper px-4 py-5 text-center text-sm text-slate-500">
                这天没有记账记录。
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {detailLedgerRecords.map((record) => (
                  <div key={record.id} className="rounded-xl bg-paper px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-ink">{record.category}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {record.note || "无备注"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-black ${
                          record.type === "expense" ? "text-red-600" : "text-leaf"
                        }`}
                      >
                        {signedNetExpense(
                          record.type === "expense"
                            ? toNumber(record.amount)
                            : -toNumber(record.amount)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-line pt-3 text-sm font-black">
                  <span>合计净支出</span>
                  <span className={detailNetExpense < 0 ? "text-leaf" : "text-red-600"}>
                    {signedNetExpense(detailNetExpense)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
