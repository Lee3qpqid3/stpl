'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TodayView() {
  const router = useRouter()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/summary?scope=today')
      .then((res) => {
        if (res.status === 401) router.push('/login?next=/today')
        return res.json()
      })
      .then((json) => setData(json))
  }, [router])

  return (
    <main className="centerShell">
      <section className="card wide">
        <p className="eyebrow">TODAY</p>
        <h1>오늘 계획</h1>
        <p className="muted">
          AI 대화에서 추출한 오늘 학습 기록과 활성 세션을 기준으로 보여준다.
        </p>

        <div className="statGrid">
          <div className="statBox">
            <h3>오늘 총 학습</h3>
            <p>{data?.todayMinutes ?? 0}분</p>
          </div>
          <div className="statBox">
            <h3>활성 세션</h3>
            <p>{data?.activeSession ? `${data.activeSession.subject} 진행 중` : '없음'}</p>
          </div>
          <div className="statBox">
            <h3>오늘 세션 수</h3>
            <p>{data?.sessions?.length ?? 0}개</p>
          </div>
        </div>

        <h2>오늘 기록</h2>
        <div className="list">
          {(data?.sessions || []).map((s) => (
            <div className="listItem" key={s.id}>
              <b>{s.subject || '과목 미상'}</b>
              <span>{s.duration_minutes || 0}분 · {s.task_description || '상세 기록 없음'}</span>
            </div>
          ))}
        </div>

        <a className="primaryButton" href="/chat">대화로 계획 조정하기</a>
      </section>
    </main>
  )
}
