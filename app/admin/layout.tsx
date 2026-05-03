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
    <main className="min-h-screen md:flex">
      <AdminNav />
      <section className="flex-1 p-6">{children}</section>
    </main>
  );
}
