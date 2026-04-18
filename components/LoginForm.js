'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/chat'

  const [username, setUsername] = useState('user')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `로그인 실패: ${res.status}`)
        return
      }

      router.push(next)
    } catch {
      setError('로그인 요청이 실패했다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="centerShell">
      <section className="card narrow">
        <p className="eyebrow">ADMIN LOGIN</p>
        <h1>로그인</h1>
        <p className="muted">
          회원가입은 열지 않는다. 초기 계정은 ID: <b>user</b>, PW: <b>1234</b> 이다.
        </p>

        <form onSubmit={login} className="form">
          <label>아이디</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="1234"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>자동 로그인 유지</span>
          </label>

          {error && <p className="errorText">{error}</p>}

          <button className="primaryButton full" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>
    </main>
  )
}
