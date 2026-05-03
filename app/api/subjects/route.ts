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
    .from("subjects")
    .select(
      `
      *,
      categories(
        id,
        name,
        color
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    subjects: data ?? []
  });
}

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const categoryId = String(body.categoryId ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "서브젝트 이름이 필요합니다." },
      { status: 400 }
    );
  }

  if (!categoryId) {
    return NextResponse.json(
      { error: "카테고리를 선택해야 합니다." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  const { data: category, error: categoryError } = await supabaseAdmin
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("user_id", session.user.id)
    .single();

  if (categoryError || !category) {
    return NextResponse.json(
      { error: "선택한 카테고리를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const { data: existingSubjects, error: existingError } = await supabaseAdmin
    .from("subjects")
    .select("id, name")
    .eq("user_id", session.user.id)
    .eq("category_id", categoryId);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  const duplicated = (existingSubjects ?? []).some(
    (subject) => subject.name.trim().toLowerCase() === name.toLowerCase()
  );

  if (duplicated) {
    return NextResponse.json(
      { error: "이 카테고리 안에 이미 같은 이름의 서브젝트가 있습니다." },
      { status: 409 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("subjects")
    .insert({
      user_id: session.user.id,
      category_id: categoryId,
      name
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    subject: data
  });
}
