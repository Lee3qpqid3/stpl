import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  const now = new Date();
  const proExpiresAt = profile.pro_expires_at
    ? new Date(profile.pro_expires_at)
    : null;

  const isPro = !!proExpiresAt && proExpiresAt.getTime() > now.getTime();

  return {
    user,
    profile,
    isAdmin: profile.role === "admin",
    isPro
  };
}
