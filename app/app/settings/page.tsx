"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";

type AccountSummary = {
  name: string;
  role: string;
  isPro: boolean;
  proExpiresAt: string | null;
  remainingText: string;
  usedSerials: {
    keyDisplay: string;
    durationDays: number;
    usedAt: string | null;
    status: string;
  }[];
};

export default function SettingsPage() {
  const [serialKey, setSerialKey] = useState("");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<AccountSummary | null>(null);

  async function loadSummary() {
    const response = await fetch("/api/account/summary");
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "계정 정보 불러오기 실패");
      return;
    }

    setSummary(result);
  }

  useEffect(() => {
    loadSummary();
  }, []);

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
      `등록 완료. ${result.durationDays}일이 추가되었습니다. 새 만료일: ${new Date(
        result.proExpiresAt
      ).toLocaleString("ko-KR")}`
    );
    setSerialKey("");
    await loadSummary();
  }

  return (
    <main className="min-h-screen md:flex">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">설정</h1>

          <div className="mt-6 rounded-2xl border p-4">
            <h2 className="font-semibold">계정 정보</h2>

            {summary ? (
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <p>이름: {summary.name}</p>
                <p>권한: {summary.role}</p>
                <p>현재 등급: {summary.isPro ? "Pro" : "일반"}</p>
                <p>
                  Pro 만료일:{" "}
                  {summary.proExpiresAt
                    ? new Date(summary.proExpiresAt).toLocaleString("ko-KR")
                    : "-"}
                </p>
                <p>남은 기간: {summary.remainingText}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">계정 정보를 불러오는 중입니다.</p>
            )}
          </div>

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
            <h2 className="font-semibold">등록한 시리얼키</h2>

            {summary && summary.usedSerials.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="p-3">시리얼키</th>
                      <th className="p-3">기간</th>
                      <th className="p-3">등록일</th>
                      <th className="p-3">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.usedSerials.map((serial) => (
                      <tr key={serial.keyDisplay} className="border-b">
                        <td className="p-3 font-mono">{serial.keyDisplay}</td>
                        <td className="p-3">{serial.durationDays}일</td>
                        <td className="p-3">
                          {serial.usedAt
                            ? new Date(serial.usedAt).toLocaleString("ko-KR")
                            : "-"}
                        </td>
                        <td className="p-3">{serial.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                아직 등록한 시리얼키가 없습니다.
              </p>
            )}
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
