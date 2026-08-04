import { createClient } from "@/lib/supabase/client";

export const MAX_IMAGES = 4;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadedImage {
  storagePath: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface PendingImage {
  file: File;
  alt: string;
  width?: number;
  height?: number;
}

export type UploadResult =
  | { ok: true; media: UploadedImage[] }
  | { ok: false; error: string };

/**
 * Uploads images directly from the browser to Supabase Storage under
 * `post-images/{userId}/{postId}/{uuid}.{ext}`. The bucket enforces MIME + size
 * limits server-side; RLS restricts writes to the user's own folder.
 */
export async function uploadPostImages(
  postId: string,
  items: PendingImage[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadResult> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Uploads aren't available in demo mode." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to upload." };

  const media: UploadedImage[] = [];
  let done = 0;

  for (const item of items) {
    const ext = (item.file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${postId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, item.file, { contentType: item.file.type, upsert: false });

    if (error) return { ok: false, error: error.message };

    media.push({
      storagePath: path,
      alt: item.alt.trim(),
      width: item.width,
      height: item.height,
    });
    done += 1;
    onProgress?.(done, items.length);
  }

  return { ok: true, media };
}
