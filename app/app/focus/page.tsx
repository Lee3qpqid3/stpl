"use client";

import { useEffect, useRef, useState } from "react";
import AppNav from "@/components/AppNav";

export default function FocusPage() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [running]);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <main className="min-h-screen md:flex">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">집중모드</h1>
          <p className="mt-2 text-slate-500">
            초 단위 집중 시간을 기록합니다. 이후 워크/테스크 소요시간에 반영합니다.
          </p>

          <div className="mt-8 text-center text-5xl font-bold">
            {h}:{m}:{s}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setRunning(true)}
              className="rounded-xl bg-slate-950 px-4 py-2 text-white"
            >
              시작
            </button>
            <button
              onClick={() => setRunning(false)}
              className="rounded-xl border px-4 py-2"
            >
              일시정지
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setSeconds(0);
              }}
              className="rounded-xl border px-4 py-2"
            >
              초기화
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
