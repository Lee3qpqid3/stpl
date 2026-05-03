import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUserProfile();

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const emailMap = new Map(
    authData.users.map((user) => [user.id, user.email ?? ""])
  );

  const users = profileData.map((profile) => {
    const proExpiresAt = profile.pro_expires_at
      ? new Date(profile.pro_expires_at)
      : null;

    const isPro =
      !!proExpiresAt && proExpiresAt.getTime() > new Date().getTime();

    return {
      id: profile.id,
      email: emailMap.get(profile.id) ?? "",
      name: profile.name,
      role: profile.role,
      accountStatus: profile.account_status,
      proExpiresAt: profile.pro_expires_at,
      isPro,
      createdAt: profile.created_at,
      memo: profile.memo
    };
  });

  return NextResponse.json({ users });
}
