import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUserProfile } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentUserProfile();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!session.isPro) {
    return NextResponse.json(
      { error: "AI 기능은 Pro 계정에서만 사용할 수 있습니다." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const message = String(body.message ?? "").trim();

  if (!message) {
    return NextResponse.json({ error: "메시지가 필요합니다." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey
  });

  const response = await openai.responses.create({
    model: "gpt-5.5-mini",
    input: [
      {
        role: "system",
        content:
          "너는 STPL의 AI 계획 도우미다. 사용자의 자연어를 분석하되, 데이터베이스 반영 전에는 반드시 반영 예정안을 제시해야 한다."
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  return NextResponse.json({
    ok: true,
    text: response.output_text
  });
}
