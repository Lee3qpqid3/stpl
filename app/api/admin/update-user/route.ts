import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await request.json();
  const userId = String(body.userId ?? "");
  const name = String(body.name ?? "").trim();
  const newPassword = String(body.newPassword ?? "");

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }

  if (!name && !newPassword) {
    return NextResponse.json(
      { error: "수정할 이름 또는 새 비밀번호가 필요합니다." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  if (name) {
    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "새 비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
