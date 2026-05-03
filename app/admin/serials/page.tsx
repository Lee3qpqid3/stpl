"use client";

import { useEffect, useState } from "react";

type SerialKey = {
  id: string;
  keyDisplay: string;
  durationDays: number;
  status: string;
  createdAt: string;
  usedAt: string | null;
  usedByUserId: string | null;
  usedByUserName: string;
  memo: string | null;
};

export default function AdminSerialsPage() {
  const [durationDays, setDurationDays] = useState(30);
  const [count, setCount] = useState(1);
  const [memo, setMemo] = useState("");
  const [serials, setSerials] = useState<SerialKey[]>([]);
  const [createdSerials, setCreatedSerials] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function loadSerials() {
    const response = await fetch("/api/admin/list-serials");
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "시리얼키 목록 불러오기 실패");
      return;
    }

    setSerials(result.serials);
  }

  useEffect(() => {
    loadSerials();
  }, []);

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

    setCreatedSerials(result.serials);
    setMessage("생성 완료");
    await loadSerials();
  }

  async function copySerial(serial: string) {
    await navigator.clipboard.writeText(serial);
    setMessage(`복사 완료: ${serial}`);
  }

  async function copyAllCreatedSerials() {
    const text = createdSerials.join("\n");
    await navigator.clipboard.writeText(text);
    setMessage("생성된 시리얼키 전체를 복사했습니다.");
  }

  async function disableSerial(serialId: string) {
    const ok = window.confirm("이 시리얼키를 비활성화할까요?");

    if (!ok) return;

    const response = await fetch("/api/admin/disable-serial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serialId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "비활성화 실패");
      return;
    }

    setMessage("시리얼키를 비활성화했습니다.");
    await loadSerials();
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">시리얼키 관리</h1>
      <p className="mt-2 text-sm text-slate-500">
        시리얼키 문자는 항상 서버에서 랜덤으로 생성됩니다. 관리자는 기간과 생성 개수만 설정합니다.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <h2 className="font-semibold">시리얼키 생성</h2>

        <div className="mt-4 grid gap-4 md:max-w-xl">
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
      </div>

      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

      {createdSerials.length > 0 && (
        <div className="mt-6 rounded-2xl border p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-semibold">방금 생성된 시리얼키</h2>
            <button
              onClick={copyAllCreatedSerials}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            >
              전체 복사
            </button>
          </div>

          <ul className="mt-3 space-y-2 font-mono text-sm">
            {createdSerials.map((serial) => (
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

      <div className="mt-6 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">시리얼키 목록</h2>
          <button
            onClick={loadSerials}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            새로고침
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-3">시리얼키</th>
                <th className="p-3">기간</th>
                <th className="p-3">상태</th>
                <th className="p-3">사용자</th>
                <th className="p-3">생성일</th>
                <th className="p-3">사용일</th>
                <th className="p-3">메모</th>
                <th className="p-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {serials.map((serial) => (
                <tr key={serial.id} className="border-b">
                  <td className="p-3 font-mono">
                    <button
                      onClick={() => copySerial(serial.keyDisplay)}
                      className="rounded-lg border px-2 py-1 hover:bg-slate-50"
                    >
                      {serial.keyDisplay}
                    </button>
                  </td>
                  <td className="p-3">{serial.durationDays}일</td>
                  <td className="p-3">{serial.status}</td>
                  <td className="p-3">{serial.usedByUserName}</td>
                  <td className="p-3">
                    {new Date(serial.createdAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="p-3">
                    {serial.usedAt
                      ? new Date(serial.usedAt).toLocaleString("ko-KR")
                      : "-"}
                  </td>
                  <td className="p-3">{serial.memo ?? "-"}</td>
                  <td className="p-3">
                    {serial.status === "unused" ? (
                      <button
                        onClick={() => disableSerial(serial.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        비활성화
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {serials.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={8}>
                    시리얼키 목록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
