import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AppNav() {
  return (
    <aside className="flex w-full flex-row gap-2 overflow-x-auto border-b bg-white p-3 md:min-h-screen md:w-56 md:flex-col md:border-b-0 md:border-r">
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/app">
        홈
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/app/weekly">
        주간 계획
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/app/daily">
        일간 계획
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/app/analysis">
        분석
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/app/focus">
        집중모드
      </Link>
      <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/app/settings">
        설정
      </Link>
      <div className="md:mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}
