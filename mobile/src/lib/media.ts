import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

/**
 * Image attachments for the composer. Uploads go straight to the shared
 * Supabase Storage `post-images` bucket under the user's own folder (matching
 * the website's storage RLS), then `createImagePost` records the media rows.
 *
 * Native short-video upload is intentionally not here yet — it needs a
 * Cloudflare Stream account + direct-upload endpoint (see mobile/README.md).
 */
export interface PickedImage {
  uri: string;
  base64: string;
  width?: number;
  height?: number;
}

export const MAX_IMAGES = 4;

export async function pickImages(max = MAX_IMAGES): Promise<PickedImage[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error("Photo access is needed to attach images.");
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: max,
    quality: 0.8,
    base64: true,
  });
  if (result.canceled) return [];
  return result.assets.slice(0, max).map((a) => ({
    uri: a.uri,
    base64: a.base64 ?? "",
    width: a.width,
    height: a.height,
  }));
}

/** Upload picked images to storage; returns their storage paths in order. */
export async function uploadImages(
  images: PickedImage[],
): Promise<{ paths?: { storagePath: string; width?: number; height?: number }[]; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const paths: { storagePath: string; width?: number; height?: number }[] = [];
  for (const img of images) {
    if (!img.base64) return { error: "Couldn't read one of the selected images." };
    const storagePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage
      .from("post-images")
      .upload(storagePath, decode(img.base64), { contentType: "image/jpeg", upsert: false });
    if (error) return { error: error.message };
    paths.push({ storagePath, width: img.width, height: img.height });
  }
  return { paths };
}
