import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";
import { formatSerialKey, generateSerialRaw } from "@/lib/serial";

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await request.json();
  const durationDays = Number(body.durationDays);
  const count = Number(body.count);
  const memo = String(body.memo ?? "");

  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    return NextResponse.json({ error: "기간은 1일 이상이어야 합니다." }, { status: 400 });
  }

  if (!Number.isInteger(count) || count <= 0 || count > 100) {
    return NextResponse.json({ error: "생성 개수는 1~100개여야 합니다." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();
  const created: string[] = [];

  while (created.length < count) {
    const raw = generateSerialRaw();
    const display = formatSerialKey(raw);

    const { error } = await supabaseAdmin.from("serial_keys").insert({
      key_raw: raw,
      key_display: display,
      duration_days: durationDays,
      status: "unused",
      created_by_admin_id: session.user.id,
      memo
    });

    if (!error) {
      created.push(display);
    }
  }

  return NextResponse.json({
    ok: true,
    serials: created
  });
}
