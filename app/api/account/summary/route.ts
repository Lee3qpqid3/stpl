import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

function getRemainingText(proExpiresAt: string | null) {
  if (!proExpiresAt) {
    return "남은 Pro 기간 없음";
  }

  const now = new Date();
  const expires = new Date(proExpiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Pro 기간 만료";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${days}일 ${hours}시간 ${minutes}분 남음`;
}

export async function GET() {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: serials, error } = await supabaseAdmin
    .from("serial_keys")
    .select("key_display, duration_days, used_at, status, activation_start_at, activation_end_at")
    .eq("used_by_user_id", session.user.id)
    .is("deleted_at", null)
    .order("used_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    name: session.profile.name,
    role: session.profile.role,
    isPro: session.isPro,
    proExpiresAt: session.profile.pro_expires_at,
    remainingText: getRemainingText(session.profile.pro_expires_at),
    usedSerials: (serials ?? []).map((serial) => ({
      keyDisplay: serial.key_display,
      durationDays: serial.duration_days,
      usedAt: serial.used_at,
      status: serial.status,
      activationStartAt: serial.activation_start_at,
      activationEndAt: serial.activation_end_at
    }))
  });
}
