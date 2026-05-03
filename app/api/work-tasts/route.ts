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
    .from("work_tasks")
    .select(
      `
      *,
      subjects(
        id,
        name,
        categories(
          id,
          name,
          color
        )
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    workTasks: data ?? []
  });
}

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();

  const subjectId = String(body.subjectId ?? "").trim();
  const type = String(body.type ?? "").trim();
  const title = String(body.title ?? "").trim();
  const aliasesText = String(body.aliasesText ?? "").trim();
  const classification = String(body.classification ?? "").trim();
  const progressFormula = String(body.progressFormula ?? "").trim();
  const estimatedSecondsRaw = body.estimatedSeconds;
  const deadlineRaw = String(body.deadline ?? "").trim();

  if (!subjectId) {
    return NextResponse.json({ error: "서브젝트를 선택해야 합니다." }, { status: 400 });
  }

  if (!["work", "task"].includes(type)) {
    return NextResponse.json({ error: "유형은 work 또는 task여야 합니다." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "워크/테스크 이름이 필요합니다." }, { status: 400 });
  }

  const estimatedSeconds =
    estimatedSecondsRaw === "" || estimatedSecondsRaw === null || estimatedSecondsRaw === undefined
      ? null
      : Number(estimatedSecondsRaw);

  if (
    estimatedSeconds !== null &&
    (!Number.isInteger(estimatedSeconds) || estimatedSeconds < 0)
  ) {
    return NextResponse.json(
      { error: "예상 소요 시간은 0초 이상의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  if (deadlineRaw && Number.isNaN(deadline?.getTime())) {
    return NextResponse.json({ error: "마감일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const aliases = aliasesText
    ? aliasesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const supabaseAdmin = createAdminClient();

  const { data: subject } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("user_id", session.user.id)
    .single();

  if (!subject) {
    return NextResponse.json(
      { error: "선택한 서브젝트를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("work_tasks")
    .insert({
      user_id: session.user.id,
      subject_id: subjectId,
      type,
      title,
      aliases,
      classification: classification || null,
      estimated_seconds: estimatedSeconds,
      progress_formula: progressFormula || null,
      deadline: deadline ? deadline.toISOString() : null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    workTask: data
  });
}
