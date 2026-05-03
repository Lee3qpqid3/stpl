import AdminNav from "@/components/AdminNav";

export default function AdminBackupsPage() {
  return (
    <main className="min-h-screen md:flex">
      <AdminNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">백업 관리</h1>
          <p className="mt-2 text-slate-500">
            사용자별 최대 15개 백업 목록과 복원 기능을 구현할 화면입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
