"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function AppNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white p-3 md:hidden">
        <div className="font-semibold">STPL</div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
        >
          메뉴
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">STPL 메뉴</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
              >
                닫기
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
                href="/app"
              >
                홈
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
                href="/app/weekly"
              >
                주간 계획
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
                href="/app/daily"
              >
                일간 계획
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
                href="/app/analysis"
              >
                분석
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
                href="/app/focus"
              >
                집중모드
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
                href="/app/settings"
              >
                설정
              </Link>

              <div className="mt-4 border-t pt-4">
                <LogoutButton />
              </div>
            </nav>
          </aside>
        </div>
      )}

      <aside className="hidden border-r bg-white p-3 md:sticky md:top-0 md:block md:h-dvh md:w-56">
        <nav className="flex h-full flex-col gap-2">
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
            href="/app"
          >
            홈
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
            href="/app/weekly"
          >
            주간 계획
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
            href="/app/daily"
          >
            일간 계획
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
            href="/app/analysis"
          >
            분석
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
            href="/app/focus"
          >
            집중모드
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
            href="/app/settings"
          >
            설정
          </Link>

          <div className="mt-auto">
            <LogoutButton />
          </div>
        </nav>
      </aside>
    </>
  );
}
