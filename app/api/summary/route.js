import { NextResponse } from 'next/server'
import { getSql } from '../../../lib/db'
import { requireUser } from '../../../lib/auth'

export async function GET(req) {
  try {
    const user = await requireUser()
    const db = getSql()
    const url = new URL(req.url)
    const scope = url.searchParams.get('scope') || 'today'

    const activeSession = await db`
      SELECT *
      FROM study_sessions
      WHERE user_id = ${user.id} AND status = 'active'
      ORDER BY start_time DESC
      LIMIT 1
    `

    if (scope === 'today') {
      const sessions = await db`
        SELECT *
        FROM study_sessions
        WHERE user_id = ${user.id}
        AND start_time::date = CURRENT_DATE
        ORDER BY start_time DESC
      `

      const todayMinutes = sessions.reduce((sum, s) => sum + Number(s.duration_minutes || 0), 0)

      return NextResponse.json({
        activeSession: activeSession[0] || null,
        sessions,
        todayMinutes,
      })
    }

    const weeklyPlans = await db`
      SELECT *
      FROM weekly_plans
      WHERE user_id = ${user.id}
      AND status = 'active'
      ORDER BY priority ASC, created_at DESC
    `

    return NextResponse.json({
      activeSession: activeSession[0] || null,
      weeklyPlans,
    })
  } catch (err) {
    return NextResponse.json({ error: '로그인이 필요하다.' }, { status: 401 })
  }
}
