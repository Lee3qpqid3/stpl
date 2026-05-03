import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-3xl bg-white p-4 shadow sm:p-6">
      <h1 className="text-2xl font-bold">관리자 홈</h1>
      <p className="mt-2 text-slate-600">
        사용자 계정, 시리얼키, 백업을 관리합니다.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Link
          href="/admin/users"
          className="rounded-2xl border p-4 hover:bg-slate-50"
        >
          <h2 className="font-semibold">사용자 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            사용자 계정을 생성하고 관리합니다.
          </p>
        </Link>

        <Link
          href="/admin/serials"
          className="rounded-2xl border p-4 hover:bg-slate-50"
        >
          <h2 className="font-semibold">시리얼키 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            기간을 설정하여 랜덤 시리얼키를 생성합니다.
          </p>
        </Link>

        <Link
          href="/admin/backups"
          className="rounded-2xl border p-4 hover:bg-slate-50"
        >
          <h2 className="font-semibold">백업 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            사용자별 백업을 확인하고 관리합니다.
          </p>
        </Link>

        <Link
          href="/app"
          className="rounded-2xl border p-4 hover:bg-slate-50"
        >
          <h2 className="font-semibold">사용자 앱으로 이동</h2>
          <p className="mt-1 text-sm text-slate-500">
            관리자 계정으로 사용자 앱 화면을 확인합니다.
          </p>
        </Link>
      </div>
    </div>
  );
}
