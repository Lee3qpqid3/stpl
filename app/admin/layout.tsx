import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserProfile();

  if (!session) {
    redirect("/login");
  }

  if (!session.isAdmin) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      <AdminNav />
      <section className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
        {children}
      </section>
    </main>
  );
}
