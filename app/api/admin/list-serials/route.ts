import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUserProfile();

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: serials, error: serialError } = await supabaseAdmin
    .from("serial_keys")
    .select(
      "id, key_display, duration_days, status, created_at, used_at, used_by_user_id, memo, activation_start_at, activation_end_at, disabled_at"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (serialError) {
    return NextResponse.json({ error: serialError.message }, { status: 400 });
  }

  const safeSerials = serials ?? [];

  const userIds = Array.from(
    new Set(
      safeSerials
        .map((serial) => serial.used_by_user_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  let userNameMap = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name")
      .in("id", userIds);

    userNameMap = new Map((users ?? []).map((user) => [user.id, user.name]));
  }

  const result = safeSerials.map((serial) => ({
    id: serial.id,
    keyDisplay: serial.key_display,
    durationDays: serial.duration_days,
    status: serial.status,
    createdAt: serial.created_at,
    usedAt: serial.used_at,
    usedByUserId: serial.used_by_user_id,
    usedByUserName: serial.used_by_user_id
      ? userNameMap.get(serial.used_by_user_id) ?? "이름 없음"
      : "-",
    memo: serial.memo,
    activationStartAt: serial.activation_start_at,
    activationEndAt: serial.activation_end_at,
    disabledAt: serial.disabled_at
  }));

  return NextResponse.json({
    count: result.length,
    serials: result
  });
}
