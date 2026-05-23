import Link from "next/link";

export default function HomeOverview() {
  return (
    <section className="flex flex-1 flex-col justify-center py-12">
      <div className="space-y-8">
        <div>
          <p className="text-sm font-bold text-leaf">Protein Ledger</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink">今天训练了吗？<br />有没有好好吃饭</h1>
        </div>
        <div className="grid gap-3">
          <Link className="primary-button flex items-center justify-center" href="/today">开始记录</Link>
          <Link className="secondary-button flex items-center justify-center" href="/stats">查看统计</Link>
        </div>
      </div>
    </section>
  );
}
