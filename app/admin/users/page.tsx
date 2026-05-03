"use client";

import { useState } from "react";

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
    <div className="rounded-3xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      <p className="mt-2 text-sm text-slate-500">
        웹에서는 회원가입을 제공하지 않으며, 관리자가 이 화면에서 계정을 생성합니다.
      </p>

      <div className="mt-6 grid gap-3 md:max-w-xl">
        <label className="text-sm font-medium">사용자 이름</label>
        <input
          className="rounded-xl border p-3"
          placeholder="예: 테스트사용자"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <label className="text-sm font-medium">이메일</label>
        <input
          className="rounded-xl border p-3"
          placeholder="user@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className="text-sm font-medium">초기 비밀번호</label>
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
  );
}
