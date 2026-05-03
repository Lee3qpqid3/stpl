import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AdminHomePage() {
  const session = await getCurrentUserProfile();

  if (!session) {
    redirect("/login");
  }

  if (!session.isAdmin) {
    redirect("/app");
  }

  return (
    <main className="min-h-screen md:flex">
      <AdminNav />
      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">관리자 홈</h1>
          <p className="mt-2 text-slate-600">
            사용자 계정, 시리얼키, 백업을 관리합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
