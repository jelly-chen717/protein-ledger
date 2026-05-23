"use client";

import { useState } from "react";
export type StatsViewMode = "daily" | "monthly";

type Props = { viewMode: StatsViewMode; selectedYear: number; selectedMonth: number; onViewModeChange: (mode: StatsViewMode) => void; onPeriodChange: (year: number, month: number) => void; onToday: () => void };

export default function StatsPeriodControls({ viewMode, selectedYear, selectedMonth, onViewModeChange, onPeriodChange, onToday }: Props) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(selectedYear);
  const [month, setMonth] = useState(selectedMonth);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear + 1 - i);
  return (
    <div className="relative flex shrink-0 items-center justify-end gap-1.5">
      <div className="grid grid-cols-2 rounded-full bg-mint p-0.5"><button type="button" className={`h-7 rounded-full px-2 text-xs font-black ${viewMode === "daily" ? "bg-white text-leaf shadow-sm" : "text-slate-500"}`} onClick={() => onViewModeChange("daily")}>按日</button><button type="button" className={`h-7 rounded-full px-2 text-xs font-black ${viewMode === "monthly" ? "bg-white text-leaf shadow-sm" : "text-slate-500"}`} onClick={() => onViewModeChange("monthly")}>按月</button></div>
      <button type="button" className="h-7 rounded-full border border-line bg-white px-2.5 text-xs font-black text-slate-600 shadow-sm" onClick={() => setOpen((v) => !v)}>{viewMode === "daily" ? `${selectedYear} 年 ${selectedMonth} 月` : `${selectedYear} 年`}</button>
      <button type="button" className="h-7 rounded-full border border-line bg-white px-2 text-xs font-black text-leaf shadow-sm" onClick={onToday}>今天</button>
      {open ? <div className="absolute right-0 top-9 z-20 w-56 rounded-2xl border border-line bg-white p-3 shadow-soft"><div className="grid grid-cols-2 gap-2"><select className="field px-2 py-2" value={year} onChange={(e) => setYear(Number(e.target.value))}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select><select className="field px-2 py-2" value={month} onChange={(e) => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m} 月</option>)}</select></div><button className="primary-button mt-3 w-full" type="button" onClick={() => { onPeriodChange(year, month); setOpen(false); }}>确认</button></div> : null}
    </div>
  );
}
