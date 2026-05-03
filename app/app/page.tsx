import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AppHomePage() {
  const session = await getCurrentUserProfile();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen md:flex">
      <AppNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">STPL 홈</h1>
          <p className="mt-2 text-slate-600">
            {session.profile.name}님, 환영합니다.
          </p>
          <p className="mt-2">
            현재 등급:{" "}
            <strong>{session.isPro ? "Pro" : "일반"}</strong>
          </p>

          {!session.isPro && (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              일반 계정은 AI 기능을 사용할 수 없습니다. 설정에서 시리얼키를 등록하면
              Pro 기능을 사용할 수 있습니다.
            </div>
          )}

          {session.isPro && (
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
              Pro 계정입니다. AI 채팅, AI 계획 생성, AI 분석 기능을 사용할 수 있습니다.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
