import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

export interface ProfileView {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string | null;
  steamVerified: boolean;
}

function mapProfile(row: Record<string, unknown>): ProfileView {
  return {
    id: row.id as string,
    username: (row.username as string) ?? null,
    displayName: (row.display_name as string) ?? (row.username as string) ?? "Member",
    avatarUrl: (row.avatar_url as string) ?? null,
    bio: (row.bio as string) ?? null,
    role: (row.role as string) ?? null,
    steamVerified: ((row.verification_status as string) ?? "none") !== "none",
  };
}

const COLS = "id, username, display_name, avatar_url, bio, role, verification_status";

export async function getProfile(id: string): Promise<ProfileView | null> {
  const { data } = await supabase.from("profiles").select(COLS).eq("id", id).maybeSingle();
  return data ? mapProfile(data as Record<string, unknown>) : null;
}

export async function searchProfiles(q: string, limit = 20): Promise<ProfileView[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const { data } = await supabase
    .from("profiles")
    .select(COLS)
    .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
    .limit(limit);
  return (data ?? []).map((r) => mapProfile(r as Record<string, unknown>));
}

export async function updateProfile(input: {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
}): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const displayName = input.displayName.trim();
  if (!displayName) return { error: "Display name is required." };
  if (displayName.length > 50) return { error: "Display name is too long." };

  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Username must be 3–20 chars: lowercase letters, numbers or underscores." };
  }

  const patch: Record<string, unknown> = {
    display_name: displayName,
    username,
    bio: input.bio.trim().slice(0, 300),
  };
  if (input.avatarUrl) patch.avatar_url = input.avatarUrl;

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) {
    if ((error as { code?: string }).code === "23505") return { error: "That username is already taken." };
    return { error: error.message };
  }
  return {};
}

/** Pick a square photo and upload it to the avatars bucket; returns its public URL. */
export async function pickAndUploadAvatar(): Promise<{ url?: string; error?: string; canceled?: boolean }> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { error: "Photo access is needed to change your avatar." };

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });
  if (res.canceled) return { canceled: true };
  const asset = res.assets[0];
  if (!asset?.base64) return { error: "Couldn't read the selected image." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const path = `${user.id}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, decode(asset.base64), { contentType: "image/jpeg", upsert: true });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl };
}
