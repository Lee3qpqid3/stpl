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
  let attempts = 0;
  const maxAttempts = count * 20;

  while (created.length < count && attempts < maxAttempts) {
    attempts += 1;

    const raw = generateSerialRaw();
    const display = formatSerialKey(raw);

    const { data: existing } = await supabaseAdmin
      .from("serial_keys")
      .select("id")
      .eq("key_raw", raw)
      .maybeSingle();

    if (existing) {
      continue;
    }

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

  if (created.length < count) {
    return NextResponse.json(
      {
        error: "시리얼키 생성 중 중복이 반복되어 요청 개수를 모두 생성하지 못했습니다.",
        serials: created
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    serials: created
  });
}
