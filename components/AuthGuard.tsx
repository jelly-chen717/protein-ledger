"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthCache, hasValidAuthCache, saveAuthCache } from "@/lib/authCache";
import { createClient } from "@/lib/supabase/client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [showChecking, setShowChecking] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => mounted && setShowChecking(true), 400);
    async function checkUser() {
      if (hasValidAuthCache()) {
        window.clearTimeout(timer);
        setReady(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      window.clearTimeout(timer);
      if (!session?.user) {
        clearAuthCache();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      saveAuthCache(session.user.email);
      setReady(true);
    }
    checkUser();
    return () => { mounted = false; window.clearTimeout(timer); };
  }, [pathname, router, supabase]);

  if (!ready) return showChecking ? <p className="panel text-sm text-slate-500">正在确认登录状态...</p> : null;
  return children;
}
