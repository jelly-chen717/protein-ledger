"use client";

import { useState } from "react";
import ProteinTracker from "@/components/ProteinTracker";
import LedgerTracker from "@/components/LedgerTracker";

type Tab = "protein" | "ledger";

export default function TodayTabs() {
  const [tab, setTab] = useState<Tab>("protein");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-mint p-1">
        <button type="button" className={`min-h-12 rounded-xl text-base font-black transition ${tab === "protein" ? "bg-white text-leaf shadow-soft" : "text-slate-600"}`} onClick={() => setTab("protein")}>蛋白质</button>
        <button type="button" className={`min-h-12 rounded-xl text-base font-black transition ${tab === "ledger" ? "bg-white text-leaf shadow-soft" : "text-slate-600"}`} onClick={() => setTab("ledger")}>记账</button>
      </div>
      {tab === "protein" ? <ProteinTracker /> : <LedgerTracker />}
    </div>
  );
}
