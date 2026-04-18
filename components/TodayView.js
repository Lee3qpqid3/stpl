'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const SUBJECT_COLORS = {
  수학: '#5b8cff',
  국어: '#ff7a90',
  영어: '#56d6a0',
  물리: '#ffbd59',
  화학: '#b779ff',
  생명: '#4dd4ff',
  지구: '#9bd35a',
  한국사: '#f97316',
  사회: '#ec4899',
  과학: '#38bdf8',
  미상: '#94a3b8',
}

function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || '#94a3b8'
}

function minutesBySubject(sessions = []) {
  const map = {}

  for (const s of sessions) {
    const subject = s.subject || '미상'
    const minutes = Number(s.duration_minutes || 0)
    if (!map[subject]) map[subject] = 0
    map[subject] += minutes
  }

  return Object.entries(map)
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
}

function progressBySubject(sessions = []) {
  const map = {}

  for (const s of sessions) {
    const subject = s.subject || '미상'
    const quantity = Number(s.quantity_done || 0)
    if (!map[subject]) map[subject] = 0
    map[subject] += quantity
  }

  return Object.entries(map)
    .map(([subject, quantity]) => ({ subject, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
}

function PieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.minutes, 0)

  if (!total) {
    return (
      <div className="emptyChart">
        아직 오늘 기록된 시간이 없다.
      </div>
    )
  }

  let cumulative = 0

  const gradient = items
    .map((item) => {
      const start = (cumulative / total) * 100
      cumulative += item.minutes
      const end = (cumulative / total) * 100
      return `${getSubjectColor(item.subject)} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="pieWrap">
      <div
        className="pieChart"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="legend">
        {items.map((item) => (
          <div className="legendItem" key={item.subject}>
            <span
              className="legendDot"
              style={{ background: getSubjectColor(item.subject) }}
            />
            <span>{item.subject}</span>
            <b>{item.minutes}분</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ items, valueKey, unit }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 0)

  if (!max) {
    return (
      <div className="emptyChart">
        아직 표시할 데이터가 없다.
      </div>
    )
  }

  return (
    <div className="barChart">
      {items.map((item) => {
        const value = Number(item[valueKey] || 0)
        const width = Math.max(6, (value / max) * 100)

        return (
          <div className="barRow" key={item.subject}>
            <div className="barLabel">{item.subject}</div>
            <div className="barTrack">
              <div
                className="barFill"
                style={{
                  width: `${width}%`,
                  background: getSubjectColor(item.subject),
                }}
              />
            </div>
            <div className="barValue">
              {value}
              {unit}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getTimePosition(dateValue) {
  if (!dateValue) return 0
  const date = new Date(dateValue)
  const kst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const minutes = kst.getHours() * 60 + kst.getMinutes()
  return Math.min(100, Math.max(0, (minutes / 1440) * 100))
}

function TodayGantt({ sessions = [], activeSession }) {
  const rows = [...sessions]
    .filter((s) => s.start_time || s.created_at)
    .sort((a, b) => new Date(a.start_time || a.created_at) - new Date(b.start_time || b.created_at))

  if (activeSession) {
    const exists = rows.some((s) => s.id === activeSession.id)
    if (!exists) rows.push(activeSession)
  }

  if (rows.length === 0) {
    return (
      <div className="emptyChart">
        아직 오늘 간트차트에 표시할 세션이 없다.
      </div>
    )
  }

  return (
    <div className="ganttBox">
      <div className="ganttScale">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>

      {rows.map((s) => {
        const start = getTimePosition(s.start_time || s.created_at)
        const end = s.end_time ? getTimePosition(s.end_time) : Math.min(100, start + 6)
        const width = Math.max(3, end - start)

        return (
          <div className="ganttRow" key={s.id}>
            <div className="ganttLabel">{s.subject || '미상'}</div>
            <div className="ganttTrack">
              <div
                className="ganttBar"
                style={{
                  left: `${start}%`,
                  width: `${width}%`,
                  background: getSubjectColor(s.subject || '미상'),
                }}
                title={s.task_description || s.source_message || ''}
              >
                {s.status === 'active' ? '진행 중' : `${s.duration_minutes || 0}분`}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeekTodoGantt({ plans = [] }) {
  if (plans.length === 0) {
    return (
      <div className="emptyChart">
        아직 이번 주 할 일이 없다. 대화창에서 이번 주 목표를 먼저 입력해라.
      </div>
    )
  }

  return (
    <div className="weekGantt">
      {plans.map((p, index) => {
        const target = Number(p.target_quantity || 0)
        const current = Number(p.current_progress || 0)
        const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0
        const color = getSubjectColor(p.subject || '미상')

        return (
          <div className="weekTask" key={p.id}>
            <div className="weekTaskTop">
              <b>{p.subject}</b>
              <span>{p.target_description || '목표 설명 없음'}</span>
            </div>

            <div className="weekTaskTrack">
              <div
                className="weekTaskFill"
                style={{
                  width: `${Math.max(3, progress)}%`,
                  background: color,
                }}
              />
            </div>

            <div className="weekTaskMeta">
              <span>
                진행 {current}/{target || '?'}
              </span>
              <span>
                위험도 {p.risk_level || 'unknown'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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

  const subjectMinutes = useMemo(
    () => minutesBySubject(data?.sessions || []),
    [data]
  )

  const subjectProgress = useMemo(
    () => progressBySubject(data?.sessions || []),
    [data]
  )

  return (
    <main className="centerShell dashboardShell">
      <section className="card wide dashboardCard">
        <p className="eyebrow">TODAY DASHBOARD</p>
        <h1>오늘 계획</h1>
        <p className="muted">
          한국 날짜 기준: {data?.koreaToday || '불러오는 중'}
        </p>

        <div className="row">
          <a
