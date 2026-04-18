'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WeekView() {
  const router = useRouter()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/summary?scope=week')
      .then((res) => {
        if (res.status === 401) router.push('/login?next=/week')
        return res.json()
      })
      .then((json) => setData(json))
  }, [router])

  return (
    <main className="centerShell">
      <section className="card wide">
        <p className="eyebrow">WEEK</p>
        <h1>주간 계획</h1>
        <p className="muted">
          매주 첫 대화에서 목표를 수집하고, 주중 새 과제가 생기면 기존 계획에 반영한다.
        </p>

        <div className="list">
          {(data?.weeklyPlans || []).map((p) => (
            <div className="listItem" key={p.id}>
              <b>{p.subject}</b>
              <span>
                {p.target_description} · 진행 {p.current_progress || 0}/{p.target_quantity || '?'} · 위험도 {p.risk_level || 'unknown'}
              </span>
            </div>
          ))}

          {data?.weeklyPlans?.length === 0 && (
            <div className="listItem">
              <b>아직 주간 계획 없음</b>
              <span>대화창에서 “이번 주 계획 세워줘” 또는 “이번 주 수학 3단원, 물리 회로 40문제”처럼 말해라.</span>
            </div>
          )}
        </div>

        <a className="primaryButton" href="/chat">AI와 주간 계획 만들기</a>
      </section>
    </main>
  )
}
