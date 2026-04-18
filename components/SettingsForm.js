'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsForm() {
  const router = useRouter()
  const [me, setMe] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) router.push('/login?next=/settings')
        else setMe(data.user)
      })
  }, [router])

  async function changePassword(e) {
    e.preventDefault()
    setMessage('')

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    setMessage(data.message || data.error || '처리됨')
    if (res.ok) {
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <main className="centerShell">
      <section className="card narrow">
        <p className="eyebrow">SETTINGS</p>
        <h1>나의 계정 설정</h1>
        <p className="muted">로그인 계정: {me?.username || '확인 중'}</p>

        <div className="row">
          <a className="ghostButton" href="/chat">대화창으로 돌아가기</a>
          <a className="ghostButton" href="/today">오늘 계획</a>
          <a className="ghostButton" href="/week">주간 계획</a>
        </div>

        <form className="form" onSubmit={changePassword}>
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label>새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {message && <p className="muted">{message}</p>}

          <button className="primaryButton full" type="submit">비밀번호 변경</button>
        </form>

        <button className="ghostButton full" onClick={logout}>로그아웃</button>
      </section>
    </main>
  )
}
