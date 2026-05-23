import AuthButton from "@/components/AuthButton";
import AuthGuard from "@/components/AuthGuard";
import TodayTabs from "@/components/TodayTabs";

export default function TodayPage() {
  return (
    <AuthGuard>
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-leaf">今日</p>
            <h1 className="mt-1 text-3xl font-black text-ink">快速记录</h1>
          </div>
          <AuthButton />
        </div>
        <TodayTabs />
      </section>
    </AuthGuard>
  );
}
