"use client";

import { useState } from "react";

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

  async function copySerial(serial: string) {
    await navigator.clipboard.writeText(serial);
    setMessage(`복사 완료: ${serial}`);
  }

  async function copyAllSerials() {
    const text = serials.join("\n");
    await navigator.clipboard.writeText(text);
    setMessage("생성된 시리얼키 전체를 복사했습니다.");
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">시리얼키 관리</h1>
      <p className="mt-2 text-sm text-slate-500">
        시리얼키 문자는 항상 서버에서 랜덤으로 생성됩니다. 관리자는 기간과 생성 개수만 설정합니다.
      </p>

      <div className="mt-6 grid gap-4 md:max-w-xl">
        <div>
          <label className="text-sm font-medium">기간</label>
          <p className="mt-1 text-xs text-slate-500">
            이 시리얼키를 등록한 사용자에게 추가할 Pro 이용 기간입니다. 단위는 일입니다.
          </p>
          <input
            className="mt-2 w-full rounded-xl border p-3"
            type="number"
            min={1}
            value={durationDays}
            onChange={(event) => setDurationDays(Number(event.target.value))}
            placeholder="예: 30"
          />
        </div>

        <div>
          <label className="text-sm font-medium">생성 개수</label>
          <p className="mt-1 text-xs text-slate-500">
            같은 기간을 가진 시리얼키를 몇 개 생성할지 정합니다.
          </p>
          <input
            className="mt-2 w-full rounded-xl border p-3"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            placeholder="예: 1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">메모</label>
          <p className="mt-1 text-xs text-slate-500">
            관리자 확인용 메모입니다. 사용자는 볼 수 없습니다.
          </p>
          <input
            className="mt-2 w-full rounded-xl border p-3"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="예: 테스트용, 5월 배포용"
          />
        </div>

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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-semibold">생성된 시리얼키</h2>
            <button
              onClick={copyAllSerials}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            >
              전체 복사
            </button>
          </div>

          <ul className="mt-3 space-y-2 font-mono text-sm">
            {serials.map((serial) => (
              <li
                key={serial}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
              >
                <span className="break-all">{serial}</span>
                <button
                  onClick={() => copySerial(serial)}
                  className="shrink-0 rounded-lg border bg-white px-3 py-1 text-xs hover:bg-slate-100"
                >
                  복사
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
