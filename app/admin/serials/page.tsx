"use client";

import { useState } from "react";
import AdminNav from "@/components/AdminNav";

export default function AdminSerialsPage() {
  const [durationDays, setDurationDays] = useState(30);
  const [count, setCount] = useState(1);
  const [memo, setMemo] = useState("");
  const [serials, setSerials] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function createSerials() {
    setMessage("생성 중...");

    const response = await fetch("/api/admin/create-serials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        durationDays,
        count,
        memo
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "생성 실패");
      return;
    }

    setSerials(result.serials);
    setMessage("생성 완료");
  }

  return (
    <main className="min-h-screen md:flex">
      <AdminNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">시리얼키 관리</h1>

          <div className="mt-6 grid gap-3 md:max-w-xl">
            <input
              className="rounded-xl border p-3"
              type="number"
              min={1}
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
              placeholder="기간"
            />
            <input
              className="rounded-xl border p-3"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              placeholder="생성 개수"
            />
            <input
              className="rounded-xl border p-3"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="메모"
            />
            <button
              onClick={createSerials}
              className="rounded-xl bg-slate-950 px-4 py-3 text-white"
            >
              랜덤 시리얼키 생성
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

          {serials.length > 0 && (
            <div className="mt-6 rounded-2xl border p-4">
              <h2 className="font-semibold">생성된 시리얼키</h2>
              <ul className="mt-3 space-y-2 font-mono text-sm">
                {serials.map((serial) => (
                  <li key={serial}>{serial}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
