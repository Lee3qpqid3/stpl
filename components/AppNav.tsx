"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

const appLinks = [
  { href: "/app", label: "홈" },
  { href: "/app/weekly", label: "주간 계획" },
  { href: "/app/daily", label: "일간 계획" },
  { href: "/app/analysis", label: "분석" },
  { href: "/app/focus", label: "집중모드" },
  { href: "/app/settings", label: "설정" }
];

export default function AppNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 좁은 화면: 항상 보이는 축소 사이드 탭 */}
      <aside className="sticky top-0 z-40 flex h-dvh w-16 shrink-0 flex-col items-center border-r bg-white p-2 md:flex lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl border text-xl font-bold hover:bg-slate-50"
          aria-label="메뉴 열기"
        >
          ☰
        </button>

        <div className="mt-4 writing-mode-vertical text-xs font-semibold tracking-widest text-slate-400">
          STPL
        </div>
      </aside>

      {/* 좁은 화면: 메뉴 열렸을 때 오버레이 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45"
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="text-lg font-bold">STPL</div>
                <div className="text-xs text-slate-500">사용자 메뉴</div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
              >
                닫기
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-2">
              {appLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-4 border-t pt-4">
                <LogoutButton />
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* 넓은 화면: 기존처럼 펼쳐진 사이드바 */}
      <aside className="hidden h-dvh w-56 shrink-0 border-r bg-white p-3 lg:sticky lg:top-0 lg:block">
        <nav className="flex h-full flex-col gap-2">
          <div className="mb-3 px-3 py-2 text-lg font-bold">STPL</div>

          {appLinks.map((link) => (
            <Link
              key={link.href}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-auto">
            <LogoutButton />
          </div>
        </nav>
      </aside>
    </>
  );
}
