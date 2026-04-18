'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
      } else {
        setMessages([
          {
            role: 'assistant',
            content:
              '학습 비서 대화창이다. “수학 시작”, “끝. 12문제 풀었고 어려웠음”, “이번 주 물리 회로 40문제 추가”처럼 자유롭게 입력해라. 기본 데이터가 부족하면 짧게 질문하겠다.',
          },
        ])
      }

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
            placeholder="예: 수학 시작 / 끝. 12문제 풀었고 어려웠음 / 오늘 마감 / 이번 주 물리 회로 40문제 추가"
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
