"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-slate-950 p-3 text-white md:hidden">
        <div className="font-semibold">STPL Admin</div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
        >
          메뉴
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-950 p-4 text-white shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">관리자 메뉴</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
              >
                닫기
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
                href="/admin"
              >
                관리자 홈
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
                href="/admin/users"
              >
                사용자 관리
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
                href="/admin/serials"
              >
                시리얼키 관리
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
                href="/admin/backups"
              >
                백업 관리
              </Link>

              <div className="my-2 border-t border-slate-700" />

              <Link
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
                href="/app"
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

      <aside className="hidden border-r bg-slate-950 p-3 text-white md:sticky md:top-0 md:block md:h-dvh md:w-60">
        <nav className="flex h-full flex-col gap-2">
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
            href="/admin"
          >
            관리자 홈
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
            href="/admin/users"
          >
            사용자 관리
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
            href="/admin/serials"
          >
            시리얼키 관리
          </Link>
          <Link
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-slate-800"
            href="/admin/backups"
          >
            백업 관리
          </Link>

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
