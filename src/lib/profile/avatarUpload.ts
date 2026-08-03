import { createClient } from "@/lib/supabase/client";

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
export const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type AvatarUploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Uploads an avatar to `avatars/{userId}/{uuid}.{ext}` and returns its public URL. */
export async function uploadAvatar(file: File): Promise<AvatarUploadResult> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Uploads aren't available in demo mode." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
