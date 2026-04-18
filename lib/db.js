import postgres from 'postgres'

let sql

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 환경변수가 없습니다.')
  }

  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 3,
    })
  }

  return sql
}

export async function ensureSchema() {
  const db = getSql()

  await db`
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
      weekday_available_time TEXT,
      weekend_available_time TEXT,
      preferred_study_time TEXT,
      sleep_pattern TEXT,
      often_delayed_subjects TEXT,
      overfocus_subjects TEXT,
      average_focus_minutes INTEGER,
      traits_json JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS weekly_plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      subject TEXT NOT NULL,
      target_description TEXT,
      target_quantity NUMERIC,
      estimated_required_time INTEGER,
      priority INTEGER DEFAULT 3,
      deadline TIMESTAMPTZ,
      current_progress NUMERIC DEFAULT 0,
      risk_level TEXT DEFAULT 'unknown',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS daily_plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      planned_subject TEXT,
      planned_start_time TIMESTAMPTZ,
      planned_end_time TIMESTAMPTZ,
      planned_duration INTEGER,
      planned_task TEXT,
      reason TEXT,
      status TEXT DEFAULT 'planned',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
      subject TEXT,
      start_time TIMESTAMPTZ,
      end_time TIMESTAMPTZ,
      duration_minutes INTEGER,
      task_description TEXT,
      quantity_done NUMERIC,
      perceived_difficulty TEXT,
      focus_level TEXT,
      quality_label TEXT,
      efficiency_label TEXT,
      source_message TEXT,
      confidence NUMERIC DEFAULT 0.5,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS extracted_learning_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
      message_id INTEGER REFERENCES conversation_messages(id) ON DELETE SET NULL,
      event_type TEXT,
      subject TEXT,
      inferred_data_json JSONB DEFAULT '{}'::jsonb,
      confidence NUMERIC DEFAULT 0.5,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS subject_stats (
      user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      total_planned_time INTEGER DEFAULT 0,
      total_actual_time INTEGER DEFAULT 0,
      average_duration_per_unit NUMERIC,
      progress_rate NUMERIC,
      delay_amount INTEGER DEFAULT 0,
      overfocus_score NUMERIC DEFAULT 0,
      underfocus_score NUMERIC DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, subject)
    )
  `
}
