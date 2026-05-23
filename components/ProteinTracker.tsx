"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Toast from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";
import type { ProteinRecord } from "@/lib/types";
import { useToast } from "@/lib/useToast";
import { DEFAULT_HEIGHT_CM, DEFAULT_WEIGHT_KG, formatGram, todayKey, toNumber } from "@/lib/utils";

const quickFoods = [
  ["2个卤鸡腿", 37], ["两个全蛋", 11], ["一勺蛋白粉", 22],
  ["半勺蛋白粉", 11], ["250ml 豆浆", 7], ["两勺燕麦", 5]
] as const;

export default function ProteinTracker() {
  const supabase = useMemo(() => createClient(), []);
  const [records, setRecords] = useState<ProteinRecord[]>([]);
  const [recordDate, setRecordDate] = useState(todayKey());
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { message, showToast } = useToast();
  const total = records.reduce((sum, r) => sum + toNumber(r.protein_g), 0);
  const target = DEFAULT_WEIGHT_KG * 1.6;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase.from("protein_records").select("*").eq("record_date", recordDate).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!mounted) return;
      setLoading(false);
      if (error) setError(error.message);
      else setRecords((data ?? []) as ProteinRecord[]);
    });
    return () => { mounted = false; };
  }, [recordDate, supabase]);

  async function addRecord(recordName: string, proteinG: number) {
    if (!recordName.trim() || proteinG <= 0 || !recordDate) {
      setError("请填写内容、克数和日期。");
      return;
    }
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setError("请先登录。"); return; }
    const { data, error } = await supabase.from("protein_records").insert({ user_id: user.id, record_date: recordDate, name: recordName.trim(), protein_g: proteinG }).select("*").single();
    setSaving(false);
    if (error) { setError(error.message); return; }
    setRecords((cur) => [data as ProteinRecord, ...cur]);
    setName(""); setProtein(""); showToast(`已添加：${recordName.trim()} +${formatGram(proteinG)}`);
  }

  async function deleteRecord(id: string) {
    const { error } = await supabase.from("protein_records").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setRecords((cur) => cur.filter((r) => r.id !== id));
    showToast("已删除蛋白质记录");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addRecord(name, Number(protein));
  }

  return (
    <div className="space-y-5">
      <Toast message={message} />
      <section className="panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">{DEFAULT_WEIGHT_KG}kg / {DEFAULT_HEIGHT_CM}cm</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">{recordDate === todayKey() ? "今日蛋白质" : "所选日期蛋白质"}</p>
            <h2 className="mt-1 text-3xl font-black text-ink">{formatGram(total)} / {formatGram(target)}</h2>
          </div>
          <label className="rounded-2xl bg-mint px-3 py-2 text-sm font-bold text-leaf">
            <span className="block text-xs text-leaf/80">记录日期</span>
            <input className="mt-1 w-[9.5rem] bg-transparent text-sm font-black text-leaf outline-none" type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} required />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-black text-ink">快捷添加</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickFoods.map(([food, grams]) => (
            <button key={food} type="button" className="min-h-24 rounded-2xl border border-line bg-white p-3 text-left shadow-soft active:bg-mint disabled:opacity-60" disabled={saving} onClick={() => addRecord(food, grams)}>
              <span className="block text-sm font-black text-ink">{food}</span>
              <span className="mt-2 block text-2xl font-black text-leaf">+{formatGram(grams)}</span>
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-3 shadow-soft">
        <h3 className="text-base font-black text-ink">手动添加</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input className="field px-3 py-2.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="内容" required />
          <input className="field px-3 py-2.5" value={protein} onChange={(e) => setProtein(e.target.value)} type="number" inputMode="decimal" min="0" step="0.1" placeholder="克数" required />
        </div>
        <button type="submit" className="primary-button mt-2 min-h-11 w-full py-2.5" disabled={saving}><Plus aria-hidden className="mr-2 inline h-5 w-5" />添加蛋白质记录</button>
      </form>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <section className="panel">
        <h3 className="text-lg font-black text-ink">{recordDate === todayKey() ? "今日蛋白质记录" : "所选日期蛋白质记录"}</h3>
        {loading ? <p className="mt-4 text-sm text-slate-500">加载中...</p> : records.length === 0 ? <p className="mt-4 rounded-xl bg-paper px-4 py-5 text-center text-sm text-slate-500">这天还没有记录。</p> : (
          <div className="mt-3 space-y-2">
            {records.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 py-2.5">
                <p className="min-w-0 flex-1 truncate text-sm font-black text-ink">{record.name}</p>
                <p className="text-sm font-black text-leaf">{formatGram(toNumber(record.protein_g))}</p>
                <button type="button" className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-red-50 text-red-700" onClick={() => deleteRecord(record.id)} aria-label="删除"><Trash2 aria-hidden className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
