import { NextResponse } from 'next/server'
import { getSql } from '../../../../lib/db'
import { hashPassword, requireUser, verifyPassword } from '../../../../lib/auth'

export async function POST(req) {
  const user = await requireUser()
  const db = getSql()
  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: '비밀번호를 다시 확인해라.' }, { status: 400 })
  }

  const rows = await db`SELECT * FROM app_users WHERE id = ${user.id} LIMIT 1`
  const fullUser = rows[0]

  if (!verifyPassword(currentPassword, fullUser.password_hash)) {
    return NextResponse.json({ error: '현재 비밀번호가 틀렸다.' }, { status: 401 })
  }

  await db`
    UPDATE app_users
    SET password_hash = ${hashPassword(newPassword)}, updated_at = NOW()
    WHERE id = ${user.id}
  `

  return NextResponse.json({ ok: true, message: '비밀번호가 변경되었다.' })
}
