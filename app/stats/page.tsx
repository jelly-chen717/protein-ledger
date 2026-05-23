import AuthButton from "@/components/AuthButton";
import AuthGuard from "@/components/AuthGuard";
import StatsDashboard from "@/components/StatsDashboard";

export default function StatsPage() {
  return (
    <AuthGuard>
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-leaf">统计</p>
            <h1 className="mt-1 text-3xl font-black text-ink">近期概览</h1>
          </div>
          <AuthButton />
        </div>
        <StatsDashboard />
      </section>
    </AuthGuard>
  );
}
