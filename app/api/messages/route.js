import { NextResponse } from 'next/server'
import { getSql } from '../../../lib/db'
import { requireUser } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireUser()
    const db = getSql()

    const messages = await db`
      SELECT id, role, content, created_at
      FROM conversation_messages
      WHERE user_id = ${user.id}
      ORDER BY created_at ASC
      LIMIT 80
    `

    return NextResponse.json({ messages })
  } catch (err) {
    return NextResponse.json(
      { error: '로그인이 필요하다.', detail: String(err?.message || err) },
      { status: 401 }
    )
  }
}
