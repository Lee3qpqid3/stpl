import type { SupabaseClient } from "@supabase/supabase-js";

type SerialRow = {
  id: string;
  duration_days: number;
  used_at: string | null;
  activation_start_at: string | null;
  activation_end_at: string | null;
};

export async function recomputeUserProPeriods(
  supabaseAdmin: SupabaseClient,
  userId: string
) {
  const now = new Date();

  const { data, error } = await supabaseAdmin
    .from("serial_keys")
    .select(
      "id, duration_days, used_at, activation_start_at, activation_end_at"
    )
    .eq("used_by_user_id", userId)
    .eq("status", "used")
    .is("deleted_at", null)
    .order("activation_start_at", { ascending: true, nullsFirst: false })
    .order("used_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  const serials = (data ?? []) as SerialRow[];

  let cursor = new Date(now);
  let latestFutureEnd: Date | null = null;

  for (const serial of serials) {
    const existingStart = serial.activation_start_at
      ? new Date(serial.activation_start_at)
      : null;

    const existingEnd = serial.activation_end_at
      ? new Date(serial.activation_end_at)
      : null;

    if (existingEnd && existingEnd.getTime() <= now.getTime()) {
      continue;
    }

    if (
      existingStart &&
      existingEnd &&
      existingStart.getTime() <= now.getTime() &&
      existingEnd.getTime() > now.getTime()
    ) {
      cursor = existingEnd;
      latestFutureEnd = existingEnd;
      continue;
    }

    const newStart = new Date(cursor);
    const newEnd = new Date(
      newStart.getTime() + serial.duration_days * 24 * 60 * 60 * 1000
    );

    const { error: updateError } = await supabaseAdmin
      .from("serial_keys")
      .update({
        activation_start_at: newStart.toISOString(),
        activation_end_at: newEnd.toISOString()
      })
      .eq("id", serial.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    cursor = newEnd;
    latestFutureEnd = newEnd;
  }

  const newProExpiresAt =
    latestFutureEnd && latestFutureEnd.getTime() > now.getTime()
      ? latestFutureEnd.toISOString()
      : now.toISOString();

  const { error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .update({
      pro_expires_at: newProExpiresAt,
      updated_at: now.toISOString()
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return newProExpiresAt;
}
