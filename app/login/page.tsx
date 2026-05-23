import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <section className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold text-leaf">Protein Ledger</p>
          <h1 className="mt-2 text-3xl font-black text-ink">增肌账本</h1>
          <p className="mt-2 text-sm text-slate-500">登录后记录蛋白质、收入和支出</p>
        </div>
        <Suspense fallback={<div className="panel text-sm text-slate-500">加载中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
