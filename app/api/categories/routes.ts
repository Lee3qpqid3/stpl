import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    categories: data ?? []
  });
}

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const color = String(body.color ?? "#A7C7E7").trim();

  if (!name) {
    return NextResponse.json({ error: "카테고리 이름이 필요합니다." }, { status: 400 });
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return NextResponse.json(
      { error: "색상은 #A7C7E7 같은 6자리 HEX 코드여야 합니다." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      user_id: session.user.id,
      name,
      color
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    category: data
  });
}
