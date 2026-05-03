import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";
import { isValidSerialFormat, normalizeSerialInput } from "@/lib/serial";

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const serialKey = String(body.serialKey ?? "");

  if (!isValidSerialFormat(serialKey)) {
    return NextResponse.json(
      { error: "시리얼키 형식이 올바르지 않습니다. 예: Kf8e-983L-3JUi-IOpd" },
      { status: 400 }
    );
  }

  const keyRaw = normalizeSerialInput(serialKey);
  const supabaseAdmin = createAdminClient();

  const { data: serial, error: serialError } = await supabaseAdmin
    .from("serial_keys")
    .select("*")
    .eq("key_raw", keyRaw)
    .single();

  if (serialError || !serial) {
    return NextResponse.json({ error: "존재하지 않는 시리얼키입니다." }, { status: 404 });
  }

  if (serial.status === "used") {
    return NextResponse.json({ error: "이미 사용된 시리얼키입니다." }, { status: 400 });
  }

  if (serial.status === "disabled") {
    return NextResponse.json({ error: "사용할 수 없는 시리얼키입니다." }, { status: 400 });
  }

  const now = new Date();
  const currentExpiresAt = session.profile.pro_expires_at
    ? new Date(session.profile.pro_expires_at)
    : null;

  const baseDate =
    currentExpiresAt && currentExpiresAt.getTime() > now.getTime()
      ? currentExpiresAt
      : now;

  const newExpiresAt = new Date(
    baseDate.getTime() + serial.duration_days * 24 * 60 * 60 * 1000
  );

  const { error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .update({
      pro_expires_at: newExpiresAt.toISOString(),
      updated_at: now.toISOString()
    })
    .eq("id", session.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: updateSerialError } = await supabaseAdmin
    .from("serial_keys")
    .update({
      status: "used",
      used_at: now.toISOString(),
      used_by_user_id: session.user.id
    })
    .eq("id", serial.id);

  if (updateSerialError) {
    return NextResponse.json({ error: updateSerialError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    durationDays: serial.duration_days,
    proExpiresAt: newExpiresAt.toISOString()
  });
}
