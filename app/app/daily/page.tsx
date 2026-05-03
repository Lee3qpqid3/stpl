import AppNav from "@/components/AppNav";

export default function DailyPage() {
  return (
    <main className="flex min-h-screen">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">일간 계획</h1>
          <p className="mt-2 text-slate-500">
            오늘 계획과 시간 블록 보기를 구현할 화면입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
