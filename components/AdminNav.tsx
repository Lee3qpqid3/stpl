import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminNav() {
  return (
    <aside className="flex w-full flex-row gap-2 overflow-x-auto border-b bg-slate-950 p-3 text-white md:min-h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-800" href="/admin">
        관리자 홈
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-800" href="/admin/users">
        사용자 관리
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-800" href="/admin/serials">
        시리얼키 관리
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-800" href="/admin/backups">
        백업 관리
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-800" href="/app">
        사용자 앱
      </Link>
      <div className="md:mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}
