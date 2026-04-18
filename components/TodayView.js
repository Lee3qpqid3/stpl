'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TodayView() {
  const router = useRouter()
  const [data, setData] = useState(null)

  async function load() {
    const res = await fetch('/api/summary?scope=today', {
      cache: 'no-store',
    })

    if (res.status === 401) {
      router.push('/login?next=/today')
      return
    }

    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <main className="centerShell">
      <section className="card wide">
        <p className="eyebrow">TODAY</p>
        <h1>오늘 계획</h1>
        <p className="muted">
          한국 날짜 기준: {data?.koreaToday || '불러오는 중'}
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

        <div className="row">
          <button className="ghostButton" onClick={load}>새로고침</button>
          <a className="primaryButton" href="/chat">대화로 계획 조정하기</a>
        </div>

        <h2>오늘 학습 세션</h2>
        <div className="list">
          {(data?.sessions || []).map((s) => (
            <div className="listItem" key={s.id}>
              <b>{s.subject || '과목 미상'} · {s.status}</b>
              <span>
                {s.duration_minutes || 0}분 · {s.quantity_done || '-'} · {s.perceived_difficulty || '난도 미상'}
              </span>
              <span>{s.task_description || s.source_message || '상세 기록 없음'}</span>
            </div>
          ))}

          {data?.sessions?.length === 0 && (
            <div className="listItem">
              <b>아직 오늘 세션 없음</b>
              <span>대화창에서 “수학 시작” 후 “끝. 12문제 풀었고 어려웠음”을 입력해라.</span>
            </div>
          )}
        </div>

        <h2>추출된 학습 이벤트</h2>
        <div className="list">
          {(data?.events || []).map((e) => (
            <div className="listItem" key={e.id}>
              <b>{e.event_type} · {e.subject || '과목 없음'}</b>
              <span>confidence: {e.confidence}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
