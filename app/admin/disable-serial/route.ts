import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

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

  if (serial.status === "used") {
    return NextResponse.json(
      { error: "이미 사용된 시리얼키는 비활성화할 수 없습니다." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("serial_keys")
    .update({
      status: "disabled"
    })
    .eq("id", serialId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
