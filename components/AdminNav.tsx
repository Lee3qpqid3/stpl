"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

const adminLinks = [
  { href: "/admin", label: "관리자 홈" },
  { href: "/admin/users", label: "사용자 관리" },
  { href: "/admin/serials", label: "시리얼키 관리" },
  { href: "/admin/backups", label: "백업 관리" }
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 좁은 화면: 항상 보이는 축소 사이드 탭 */}
      <aside className="sticky top-0 z-40 flex h-dvh w-16 shrink-0 flex-col items-center border-r bg-slate-950 p-2 text-white md:flex lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 text-xl font-bold hover:bg-slate-800"
          aria-label="관리자 메뉴 열기"
        >
          ☰
        </button>

        <div className="mt-4 writing-mode-vertical text-xs font-semibold tracking-widest text-slate-500">
          ADMIN
        </div>
      </aside>

      {/* 좁은 화면: 메뉴 열렸을 때 오버레이 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55"
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-950 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <div className="text-lg font-bold">STPL Admin</div>
                <div className="text-xs text-slate-400">관리자 메뉴</div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
              >
                닫기
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-slate-700" />

              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-800"
              >
                사용자 앱으로 이동
              </Link>

              <div className="mt-4 border-t border-slate-700 pt-4">
                <LogoutButton />
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* 넓은 화면: 기존처럼 펼쳐진 사이드바 */}
      <aside className="hidden h-dvh w-60 shrink-0 border-r bg-slate-950 p-3 text-white lg:sticky lg:top-0 lg:block">
        <nav className="flex h-full flex-col gap-2">
          <div className="mb-3 px-3 py-2 text-lg font-bold">STPL Admin</div>

          {adminLinks.map((link) => (
            <Link
              key={link.href}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-1 border-t border-slate-700" />

          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
            href="/app"
          >
            사용자 앱으로 이동
          </Link>

          <div className="mt-auto">
            <LogoutButton />
          </div>
        </nav>
      </aside>
    </>
  );
}
