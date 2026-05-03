"use client";

import { useState } from "react";
import AppNav from "@/components/AppNav";

export default function SettingsPage() {
  const [serialKey, setSerialKey] = useState("");
  const [message, setMessage] = useState("");

  async function redeemSerial() {
    setMessage("등록 중...");

    const response = await fetch("/api/serials/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serialKey
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "등록 실패");
      return;
    }

    setMessage(
      `등록 완료. ${result.durationDays}일이 추가되었습니다. 새 만료일: ${result.proExpiresAt}`
    );
    setSerialKey("");
  }

  return (
    <main className="min-h-screen md:flex">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">설정</h1>

          <div className="mt-6 rounded-2xl border p-4">
            <h2 className="font-semibold">시리얼키 등록</h2>
            <p className="mt-1 text-sm text-slate-500">
              예: Kf8e-983L-3JUi-IOpd
            </p>
            <input
              className="mt-4 w-full rounded-xl border p-3"
              value={serialKey}
              onChange={(event) => setSerialKey(event.target.value)}
              placeholder="시리얼키 입력"
            />
            <button
              onClick={redeemSerial}
              className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-white"
            >
              등록하기
            </button>
            {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
          </div>

          <div className="mt-6 rounded-2xl border p-4">
            <h2 className="font-semibold">기본 설정</h2>
            <p className="mt-2 text-sm text-slate-500">
              한 주의 시작, 다크/라이트 모드, 백업 관리는 다음 단계에서 연결합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
