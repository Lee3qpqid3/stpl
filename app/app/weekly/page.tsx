import AppNav from "@/components/AppNav";

export default function WeeklyPage() {
  return (
    <main className="min-h-screen md:flex">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">주간 계획</h1>
          <p className="mt-2 text-slate-500">
            카테고리, 서브젝트, 워크/테스크 기반 주간 계획 화면입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
