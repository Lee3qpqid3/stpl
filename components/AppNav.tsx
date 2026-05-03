import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AppNav() {
  return (
    <aside className="w-full border-b bg-white p-3 md:sticky md:top-0 md:h-dvh md:w-56 md:border-b-0 md:border-r">
      <nav className="flex flex-wrap gap-2 md:flex-col">
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" href="/app">
          홈
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" href="/app/weekly">
          주간 계획
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" href="/app/daily">
          일간 계획
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" href="/app/analysis">
          분석
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" href="/app/focus">
          집중모드
        </Link>
        <Link className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" href="/app/settings">
          설정
        </Link>

        <div className="w-full md:mt-auto">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}
