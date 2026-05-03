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
  const accountStatus = String(body.accountStatus ?? "");

  if (!userId || !["active", "disabled"].includes(accountStatus)) {
    return NextResponse.json({ error: "요청 값이 올바르지 않습니다." }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "현재 로그인한 관리자 계정은 비활성화할 수 없습니다." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("user_profiles")
    .update({
      account_status: accountStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
