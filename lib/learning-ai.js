import OpenAI from 'openai'

const SYSTEM_PROMPT = `
너는 사용자의 학습 비서 웹앱 안에서 작동하는 AI이다.

너의 역할:
1. 사용자와 자연스럽게 대화한다.
2. 사용자의 자유로운 입력에서 학습 이벤트를 추출한다.
3. 과목, 학습 시작/종료, 소요시간, 진행량, 난도, 집중도, 효율, 주간 계획 변경을 구조화한다.
4. 데이터가 부족하면 짧게 질문한다.
5. 매번 많은 질문을 하지 않는다.
6. 특정 과목 편중이 보이면 냉정하게 지적한다.
7. 계획은 현재 시각, 누적 기록, 주간 목표 기준으로 재조정한다.

반드시 JSON만 반환한다. 설명 문장을 JSON 밖에 쓰지 마라.

반환 형식:
{
  "reply": "사용자에게 보여줄 한국어 답변",
  "events": [
    {
      "eventType": "study_start | study_end | study_pause | study_resume | daily_close | weekly_plan_create | weekly_plan_update | weekly_plan_upsert | progress_report | plan_request | account_request | unknown",
      "subject": "과목명 또는 null",
      "taskDescription": "작업 설명 또는 null",
      "quantityDone": 숫자 또는 null,
      "targetQuantity": 숫자 또는 null,
      "perceivedDifficulty": "easy | medium | hard | unknown",
      "focusLevel": "low | medium | high | unknown",
      "qualityLabel": "low | normal | high | unknown",
      "efficiencyLabel": "low | normal | high | unknown",
      "confidence": 0부터 1 사이 숫자,
      "inferredData": {}
    }
  ],
  "weeklyPlanUpdates": [
    {
      "subject": "과목명",
      "targetDescription": "목표 설명",
      "targetQuantity": 숫자 또는 null,
      "estimatedRequiredTime": 분 단위 숫자 또는 null,
      "priority": 1부터 5,
      "riskLevel": "low | medium | high | unknown"
    }
  ],
  "dailyPlanSuggestions": [
    {
      "plannedSubject": "과목명",
      "plannedDuration": 분 단위 숫자,
      "plannedTask": "할 일",
      "reason": "추천 이유"
    }
  ]
}
`

function fallbackAnalyze(message) {
  const text = message || ''
  const subjectMatch = text.match(/(수학|국어|영어|물리|화학|생명|지구|한국사|사회|과학)/)
  const subject = subjectMatch ? subjectMatch[1] : null

  let eventType = 'progress_report'
  if (text.includes('시작')) eventType = 'study_start'
  if (text.includes('끝') || text.includes('종료')) eventType = 'study_end'
  if (text.includes('오늘 마감')) eventType = 'daily_close'
  if (text.includes('이번 주') && (text.includes('추가') || text.includes('계획'))) eventType = 'weekly_plan_upsert'
  if (text.includes('계획') && !text.includes('이번 주')) eventType = 'plan_request'

  const quantityMatch = text.match(/(\d+)\s*(문제|쪽|페이지|강|개|지문)/)
  const quantity = quantityMatch ? Number(quantityMatch[1]) : null

  const hard = text.includes('어려') || text.includes('힘들') || text.includes('막힘')

  return {
    reply:
      eventType === 'study_start'
        ? `${subject || '해당 과목'} 학습 시작으로 기록했다. 끝나면 “끝”이라고 말하면 서버 현재 시각으로 소요시간을 계산하겠다.`
        : eventType === 'study_end'
          ? `학습 종료로 처리하겠다. 진행량과 난도 정보도 함께 기록했다.`
          : eventType === 'weekly_plan_upsert'
            ? `이번 주 계획 변경으로 파악했다. 주간 목표에 추가하고 남은 날짜 기준으로 재분배해야 한다.`
            : `현재 OpenAI API 사용 한도 문제 또는 API 키 문제로 고급 AI 분석은 사용할 수 없다. 대신 기본 규칙으로 입력을 기록했다. OpenAI Platform의 Billing, Usage limit, API key 상태를 확인해야 한다.`,
    events: [
      {
        eventType,
        subject,
        taskDescription: text,
        quantityDone: quantity,
        targetQuantity: quantity,
        perceivedDifficulty: hard ? 'hard' : 'unknown',
        focusLevel: 'unknown',
        qualityLabel: 'unknown',
        efficiencyLabel: hard ? 'low' : 'unknown',
        confidence: subject ? 0.75 : 0.45,
        inferredData: { raw: text },
      },
    ],
    weeklyPlanUpdates:
      eventType === 'weekly_plan_upsert'
        ? [
            {
              subject: subject || '미상',
              targetDescription: text,
              targetQuantity: quantity,
              estimatedRequiredTime: null,
              priority: 3,
              riskLevel: 'unknown',
            },
          ]
        : [],
    dailyPlanSuggestions: [],
  }
}

export async function analyzeLearningMessage({ message, context }) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalyze(message)
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_MODEL || 'gpt-5.4-mini'

    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            userMessage: message,
            serverContext: context,
          }),
        },
      ],
    })

    const raw = response.output_text || ''

    try {
      return JSON.parse(raw)
    } catch {
      const fallback = fallbackAnalyze(message)
      return {
        ...fallback,
        reply:
          'AI 응답이 JSON 형식으로 정리되지 않아 기본 규칙으로 처리했다.\n\n' +
          fallback.reply,
      }
    }
  } catch (err) {
    const msg = String(err?.message || err)

    if (msg.includes('429') || msg.includes('quota') || msg.includes('billing')) {
      const fallback = fallbackAnalyze(message)
      return {
        ...fallback,
        reply:
          'OpenAI API 사용 한도 또는 결제 설정 문제로 고급 AI 분석을 실행하지 못했다.\n\n' +
          '지금 필요한 조치:\n' +
          '1. OpenAI Platform에서 Billing 설정을 확인한다.\n' +
          '2. API 사용 한도와 결제수단을 확인한다.\n' +
          '3. Vercel의 OPENAI_API_KEY가 올바른 프로젝트의 키인지 확인한다.\n\n' +
          '일단 입력은 기본 규칙으로 기록했다.',
      }
    }

    const fallback = fallbackAnalyze(message)
    return {
      ...fallback,
      reply:
        'OpenAI API 호출 중 오류가 발생해 기본 규칙으로 처리했다.\n\n' +
        `오류: ${msg}`,
    }
  }
}
