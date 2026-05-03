"use client";

import { useState } from "react";
import AdminNav from "@/components/AdminNav";

export default function AdminUsersPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function createUser() {
    setMessage("생성 중...");

    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        name
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "생성 실패");
      return;
    }

    setMessage("계정 생성 완료");
    setEmail("");
    setPassword("");
    setName("");
  }

  return (
    <main className="min-h-screen md:flex">
      <AdminNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">사용자 관리</h1>

          <div className="mt-6 grid gap-3 md:max-w-xl">
            <input
              className="rounded-xl border p-3"
              placeholder="사용자 이름"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="rounded-xl border p-3"
              placeholder="이메일"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="rounded-xl border p-3"
              placeholder="초기 비밀번호"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              onClick={createUser}
              className="rounded-xl bg-slate-950 px-4 py-3 text-white"
            >
              계정 생성
            </button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
