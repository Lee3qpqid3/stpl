import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminNav() {
  return (
    <aside className="w-full border-b bg-slate-950 p-3 text-white md:sticky md:top-0 md:h-dvh md:w-60 md:border-b-0 md:border-r">
      <nav className="flex flex-wrap gap-2 md:flex-col">
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800" href="/admin">
          관리자 홈
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800" href="/admin/users">
          사용자 관리
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800" href="/admin/serials">
          시리얼키 관리
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800" href="/admin/backups">
          백업 관리
        </Link>

        <div className="hidden border-t border-slate-700 md:my-1 md:block" />

        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-800" href="/app">
          사용자 앱으로 이동
        </Link>

        <div className="w-full md:mt-auto">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}
