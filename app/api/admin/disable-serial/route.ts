import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";
import { recomputeUserProPeriods } from "@/lib/pro";

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await request.json();
  const serialId = String(body.serialId ?? "");

  if (!serialId) {
    return NextResponse.json({ error: "serialId가 필요합니다." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: serial, error: readError } = await supabaseAdmin
    .from("serial_keys")
    .select("*")
    .eq("id", serialId)
    .single();

  if (readError || !serial) {
    return NextResponse.json({ error: "시리얼키를 찾을 수 없습니다." }, { status: 404 });
  }

  if (serial.status === "disabled") {
    return NextResponse.json(
      { error: "이미 비활성화된 시리얼키입니다." },
      { status: 400 }
    );
  }

  const now = new Date();

  const updatePayload: Record<string, string | null> = {
    status: "disabled",
    disabled_at: now.toISOString()
  };

  if (
    serial.status === "used" &&
    serial.activation_start_at &&
    serial.activation_end_at
  ) {
    const end = new Date(serial.activation_end_at);

    if (end.getTime() > now.getTime()) {
      updatePayload.activation_end_at = now.toISOString();
    }
  }

  const { error } = await supabaseAdmin
    .from("serial_keys")
    .update(updatePayload)
    .eq("id", serialId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let newProExpiresAt: string | null = null;

  if (serial.used_by_user_id) {
    try {
      newProExpiresAt = await recomputeUserProPeriods(
        supabaseAdmin,
        serial.used_by_user_id
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Pro 기간 재계산 중 오류가 발생했습니다."
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    previousStatus: serial.status,
    newProExpiresAt
  });
}
