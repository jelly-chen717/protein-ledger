"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Toast from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";
import type { LedgerRecord, LedgerType } from "@/lib/types";
import { useToast } from "@/lib/useToast";
import { balanceLabel, formatCurrency, signedCurrency, todayKey, toNumber } from "@/lib/utils";

const expenseCategories = ["饮食", "奶茶", "娱乐", "购物", "人情", "其他"];
const incomeCategories = ["生活费", "兼职", "红包", "其他"];
const quickAmounts = [5, 10, 15, 20, 50];

export default function LedgerTracker() {
  const supabase = useMemo(() => createClient(), []);
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [recordDate, setRecordDate] = useState(todayKey());
  const [type, setType] = useState<LedgerType>("expense");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { message, showToast } = useToast();
  const isToday = recordDate === todayKey();
  const categories = type === "expense" ? expenseCategories : incomeCategories;
  const expense = records.filter((r) => r.type === "expense").reduce((s, r) => s + toNumber(r.amount), 0);
  const income = records.filter((r) => r.type === "income").reduce((s, r) => s + toNumber(r.amount), 0);
  const balance = balanceLabel(isToday ? "今日" : "所选日", income, expense);

  useEffect(() => setCategory(type === "expense" ? expenseCategories[0] : incomeCategories[0]), [type]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase.from("ledger_records").select("*").eq("record_date", recordDate).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!mounted) return;
      setLoading(false);
      if (error) setError(error.message);
      else setRecords((data ?? []) as LedgerRecord[]);
    });
    return () => { mounted = false; };
  }, [recordDate, supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!recordDate || parsedAmount <= 0) { setError("请选择日期并填写大于 0 的金额。"); return; }
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setError("请先登录。"); return; }
    const { data, error } = await supabase.from("ledger_records").insert({ user_id: user.id, record_date: recordDate, type, category, amount: parsedAmount, note: note.trim() || null }).select("*").single();
    setSaving(false);
    if (error) { setError(error.message); return; }
    setRecords((cur) => [data as LedgerRecord, ...cur]);
    setAmount(""); setNote(""); showToast(`已添加记账：${category} ${formatCurrency(parsedAmount)}`);
  }

  async function deleteRecord(id: string) {
    const { error } = await supabase.from("ledger_records").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setRecords((cur) => cur.filter((r) => r.id !== id));
    showToast("已删除记账记录");
  }

  return (
    <div className="space-y-5">
      <Toast message={message} />
      <section className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft"><p className="text-sm font-semibold text-slate-500">{isToday ? "今日支出" : "所选日支出"}</p><p className="mt-3 text-3xl font-black text-red-600">{formatCurrency(expense)}</p></div>
        <div className="grid gap-2"><div className="rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft"><p className="text-xs font-semibold text-slate-500">{isToday ? "今日收入" : "所选日收入"}</p><p className="mt-1 text-lg font-black text-leaf">{formatCurrency(income)}</p></div><div className="rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft"><p className="text-xs font-semibold text-slate-500">{balance.label}</p><p className="mt-1 text-lg font-black text-ink">{balance.value}</p></div></div>
      </section>

      <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-3 shadow-soft">
        <h3 className="text-base font-black text-ink">添加记账记录</h3>
        <label className="mt-3 block text-xs font-bold text-slate-500">记录日期<input className="field mt-1 px-3 py-2.5" type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} required /></label>
        <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-paper p-1">{(["expense", "income"] as LedgerType[]).map((option) => <button key={option} type="button" className={`min-h-10 rounded-lg text-sm font-bold transition ${type === option ? "bg-white text-leaf shadow-soft" : "text-slate-500"}`} onClick={() => setType(option)}>{option === "expense" ? "支出" : "收入"}</button>)}</div>
        <select className="field mt-2 px-3 py-2.5" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <input className="field mt-2 px-3 py-2.5" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" inputMode="decimal" min="0" step="0.01" placeholder="金额" required />
        <div className="mt-2 grid grid-cols-5 gap-1.5">{quickAmounts.map((value) => <button key={value} type="button" className="min-h-9 rounded-lg bg-paper text-sm font-bold text-slate-600 active:bg-mint" onClick={() => setAmount(String(value))}>¥{value}</button>)}</div>
        <input className="field mt-2 px-3 py-2.5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" />
        <button type="submit" className="primary-button mt-2 min-h-11 w-full py-2.5" disabled={saving}><Plus aria-hidden className="mr-2 inline h-5 w-5" />添加记账记录</button>
      </form>
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <section className="panel"><h3 className="text-lg font-black text-ink">{isToday ? "今日记账记录" : "所选日期记账记录"}</h3>{loading ? <p className="mt-4 text-sm text-slate-500">加载中...</p> : records.length === 0 ? <p className="mt-4 rounded-xl bg-paper px-4 py-5 text-center text-sm text-slate-500">这天还没有记账。</p> : <div className="mt-3 space-y-2">{records.map((record) => <div key={record.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 py-2.5"><div className="min-w-0"><p className="text-sm font-black text-ink">{record.category}</p><p className="truncate text-xs text-slate-500">{record.note || "无备注"}</p></div><p className={`text-sm font-black ${record.type === "expense" ? "text-red-600" : "text-leaf"}`}>{signedCurrency(record.type, toNumber(record.amount))}</p><button type="button" className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-red-50 text-red-700" onClick={() => deleteRecord(record.id)}><Trash2 aria-hidden className="h-4 w-4" /></button></div>)}</div>}</section>
    </div>
  );
}
