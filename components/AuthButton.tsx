"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAuthCache, getAuthCache } from "@/lib/authCache";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const cached = getAuthCache();
    if (cached?.email) {
      setEmail(cached.email);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? ""));
  }, [supabase.auth]);

  async function signOut() {
    setLoading(true);
    clearAuthCache();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-w-0 items-center justify-end gap-2">
      {email ? <span className="hidden max-w-52 truncate text-xs text-slate-500 sm:block">已登录：{email}</span> : null}
      <button type="button" onClick={signOut} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-ink shadow-soft ring-1 ring-line active:scale-[0.99] disabled:opacity-60">
        <LogOut aria-hidden className="h-4 w-4" />退出
      </button>
    </div>
  );
}
