"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuthCache } from "@/lib/authCache";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/today";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const signUp = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (signUp.error) {
        setMessage(signUp.error.message);
        return;
      }
      saveAuthCache(signUp.data.user?.email);
      router.replace(next);
      return;
    }
    setLoading(false);
    saveAuthCache(data.user.email);
    router.replace(next);
  }

  return (
    <form onSubmit={submit} className="panel space-y-4">
      <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" required />
      <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码（至少 6 位）" required minLength={6} />
      <button className="primary-button w-full" disabled={loading}>{loading ? "处理中..." : "登录 / 注册"}</button>
      {message ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
    </form>
  );
}
