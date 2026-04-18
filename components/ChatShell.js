'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function buildStarterMessage({ weekData, todayData }) {
  const plans = weekData?.weeklyPlans || []
  const activeSession = todayData?.activeSession || null
  const todayMinutes = todayData?.todayMinutes || 0

  if (plans.length > 0) {
    const planLines = plans
      .slice(0, 5)
      .map((p) => {
        const quantityText = p.target_quantity ? ` ${p.target_quantity}` : ''
        return `- ${p.subject}: ${p.target_description || '목표 미상'}${quantityText}`
      })
      .join('\n')

    const firstPlan = plans[0]

    return (
      `현재 저장된 이번 주 계획을 확인했다.\n\n` +
      `이번 주 범위: ${weekData.weekStart} ~ ${weekData.weekEnd}\n` +
      `오늘 누적 학습 시간: ${todayMinutes}분\n` +
      `현재 진행 중인 세션: ${activeSession ? `${activeSession.subject} 진행 중` : '없음'}\n\n` +
      `이번 주 주요 계획:\n${planLines}\n\n` +
      `오늘은 우선 ${firstPlan.subject}부터 시작하는 것이 좋다. ` +
      `지금 바로 시작하려면 “${firstPlan.subject} 시작”이라고 입력해라. ` +
      `이미 다른 과목을 먼저 하고 싶다면 그렇게 말해도 된다. 단, 주간 목표 기준으로 편중 여부는 내가 바로 지적하겠다.`
    )
  }

  return (
    '학습 비서 대화창이다. 아직 저장된 주간 계획이 없다. ' +
    '“이번 주에 수학 미분 문제 40문제, 국어 문학 작품 3개, 영어 독해 6지문을 해야 한다.”처럼 말하면 ' +
    '그 내용을 주간 계획으로 저장하고, 이후 오늘 계획에 반영하겠다.'
  )
}

export default function ChatShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('message') || ''

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const sentInitial = useRef(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function boot() {
      const meRes = await fetch('/api/auth/me', { cache: 'no-store' })
      const meData = await meRes.json()

      if (!meData.user) {
        router.push('/login?next=/chat')
        return
      }

      const msgRes = await fetch('/api/messages', { cache: 'no-store' })
      const msgData = await msgRes.json()

      if (msgRes.ok && msgData.messages?.length > 0) {
        setMessages(
          msgData.messages.map((m) => ({
            role: m.role,
            content: m.content,
          }))
        )
        setLoaded(true)
        return
      }

      const [weekRes, todayRes] = await Promise.all([
        fetch('/api/summary?scope=week', { cache: 'no-store' }),
        fetch('/api/summary?scope=today', { cache: 'no-store' }),
      ])

      const weekData = weekRes.ok ? await weekRes.json() : null
      const todayData = todayRes.ok ? await todayRes.json() : null

      setMessages([
        {
          role: 'assistant',
          content: buildStarterMessage({ weekData, todayData }),
        },
      ])

      setLoaded(true)
    }

    boot()
  }, [router])

  useEffect(() => {
    if (!loaded) return
    if (sentInitial.current) return
    if (!initialMessage) return

    sentInitial.current = true
    sendMessage(initialMessage)
  }, [loaded, initialMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const userText = text.trim()
    if (!userText) return

    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.status === 401) {
      router.push('/login?next=/chat')
      return
    }

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            `${data.error || '처리 중 오류가 발생했다.'}\n\n상세 오류: ${data.detail || '상세 정보 없음'}`,
        },
      ])
      return
    }

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: data.reply },
    ])
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <main className="chatLayout fixedChatLayout">
      <aside className="sidebar">
        <p className="eyebrow">STPL</p>
        <h2>학습 비서</h2>
        <p className="muted">
          대화는 저장되고, 학습 세션·주간 목표·진행상황으로 구조화된다.
        </p>

        <nav className="sideNav">
          <a href="/">메인</a>
          <a href="/chat">대화창</a>
          <a href="/today">오늘 계획</a>
          <a href="/week">주간 계획</a>
          <a href="/settings">설정</a>
        </nav>
      </aside>

      <section className="chatMain fixedChatMain">
        <div className="chatTop">
          <p className="eyebrow">AI COACH</p>
          <h1>대화형 학습 관리자</h1>
        </div>

        <div className="messages scrollMessages">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <span>{m.role === 'user' ? '나' : 'AI'}</span>
              <p>{m.content}</p>
            </div>
          ))}

          {loading && (
            <div className="bubble assistant">
              <span>AI</span>
              <p>분석 중...</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            rows={3}
            placeholder="예: 수학 시작 / 끝. 12문제 풀었고 어려웠음 / 오늘 마감 / 이번 주 물리 회로 문제 40개 추가"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="primaryButton" type="submit" disabled={loading}>
            보내기
          </button>
        </form>
      </section>
    </main>
  )
}
