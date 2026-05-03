import AppNav from "@/components/AppNav";

export default function AnalysisPage() {
  return (
    <main className="flex min-h-screen">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">분석</h1>
          <p className="mt-2 text-slate-500">
            원 그래프, 꺾은선 그래프, 막대 그래프, 표, AI 분석을 구현할 화면입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
