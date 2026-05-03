"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("로그인 중...");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage("로그인 실패: " + error.message);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={login}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold">STPL 로그인</h1>
        <p className="mt-2 text-sm text-slate-500">
          회원가입은 제공하지 않습니다. 관리자에게 발급받은 계정으로 로그인하세요.
        </p>

        <label className="mt-6 block text-sm font-medium">이메일</label>
        <input
          className="mt-2 w-full rounded-xl border p-3"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="mt-4 block text-sm font-medium">비밀번호</label>
        <input
          className="mt-2 w-full rounded-xl border p-3"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button className="mt-6 w-full rounded-xl bg-slate-950 p-3 font-semibold text-white">
          로그인
        </button>

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </form>
    </main>
  );
}
