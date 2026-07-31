"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, ImageIcon, ListChecks, Swords, X } from "lucide-react";
import { CURRENT_USER_ID, getUser } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/components/providers/SessionProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createImagePost, createTextPost } from "@/lib/posts/actions";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  uploadPostImages,
} from "@/lib/posts/imageUpload";
import { cn } from "@/lib/cn";

const MAX = 280;

const OPTIONS = [
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "clip", label: "Clip", icon: Clapperboard },
  { key: "poll", label: "Poll", icon: ListChecks },
  { key: "match", label: "Match", icon: Swords },
] as const;

interface ImageDraft {
  id: string;
  file: File;
  previewUrl: string;
  alt: string;
  width?: number;
  height?: number;
}

function readDimensions(url: string): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = url;
  });
}

/**
 * Post composer.
 * - Supabase mode: creates real DB posts. Text-only → createTextPost. With
 *   images → direct-upload to Supabase Storage then createImagePost. Draft text
 *   + images are preserved on error; reset only on confirmed success.
 * - Demo mode: text posts insert a session-local post; image uploads are
 *   unavailable (they need a signed-in account).
 */
export function PostComposer({ onDemoPost }: { onDemoPost: (text: string) => void }) {
  const router = useRouter();
  const { displayName } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ done: number; total: number } | null>(
    null,
  );

  const useRealAuth = isSupabaseConfigured();
  const me = getUser(CURRENT_USER_ID);
  const avatarName = displayName ?? me?.displayName ?? "You";

  const remaining = MAX - text.length;
  const tooLong = remaining < 0;
  const canPost =
    (text.trim().length > 0 || images.length > 0) && !tooLong && !submitting;

  const openImagePicker = () => {
    if (images.length >= MAX_IMAGES) {
      setNote(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const onOptionClick = (key: string, label: string) => {
    if (key === "image") {
      if (useRealAuth) {
        openImagePicker();
      } else {
        setNote("Image uploads need a signed-in account — available in real (Supabase) mode.");
      }
      return;
    }
    setNote(`${label} attachments arrive in a later slice — text posts work now.`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file
    setError(null);
    const errors: string[] = [];
    const additions: ImageDraft[] = [];

    for (const file of files) {
      if (images.length + additions.length >= MAX_IMAGES) {
        errors.push(`Up to ${MAX_IMAGES} images.`);
        break;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported format.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        errors.push(`${file.name}: over 10 MB.`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      const dims = await readDimensions(previewUrl);
      additions.push({ id: crypto.randomUUID(), file, previewUrl, alt: "", ...dims });
    }

    if (additions.length) setImages((prev) => [...prev, ...additions]);
    if (errors.length) setError(errors.join(" "));
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const setImageAlt = (id: string, alt: string) =>
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, alt } : i)));

  const resetAfterSuccess = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
    setText("");
    setNote(null);
    setUploadStatus(null);
    setSubmitting(false);
    router.refresh();
  };

  const submit = async () => {
    if (!canPost) return;
    setError(null);

    if (!useRealAuth) {
      if (text.trim()) onDemoPost(text.trim());
      setText("");
      setNote(null);
      return;
    }

    setSubmitting(true);

    // Image post
    if (images.length > 0) {
      const postId = crypto.randomUUID();
      setUploadStatus({ done: 0, total: images.length });
      const up = await uploadPostImages(
        postId,
        images.map((i) => ({ file: i.file, alt: i.alt, width: i.width, height: i.height })),
        (done, total) => setUploadStatus({ done, total }),
      );
      if (!up.ok) {
        setError(up.error);
        setUploadStatus(null);
        setSubmitting(false);
        return; // preserve draft + images
      }
      const res = await createImagePost({ id: postId, body: text.trim(), media: up.media });
      if (!res.ok) {
        setError(res.error ?? "Couldn't post.");
        setUploadStatus(null);
        setSubmitting(false);
        return;
      }
      resetAfterSuccess();
      return;
    }

    // Text post
    const res = await createTextPost({ body: text.trim() });
    if (res.demo) {
      onDemoPost(text.trim());
      setText("");
      setSubmitting(false);
      return;
    }
    if (!res.ok) {
      setError(res.error ?? "Couldn't post. Please try again.");
      setSubmitting(false);
      return;
    }
    setText("");
    setNote(null);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="border-b border-line px-4 py-3">
      <div className="flex gap-3">
        <Avatar name={avatarName} src={me?.avatarUrl || undefined} size={44} />
        <div className="min-w-0 flex-1">
          <label htmlFor="composer" className="sr-only">
            What&apos;s happening in Strikers Club?
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit();
            }}
            rows={2}
            placeholder="What's happening in Strikers Club?"
            className="w-full resize-none bg-transparent pt-2 text-[15px] text-ink outline-none placeholder:text-ink-muted"
          />

          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img) => (
                <div key={img.id}>
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-line">
                    {/* Local object-URL preview — plain img is correct here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    value={img.alt}
                    onChange={(e) => setImageAlt(img.id, e.target.value)}
                    placeholder="Alt text (optional)"
                    aria-label="Image alt text"
                    className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink outline-none placeholder:text-ink-muted focus:border-accent"
                  />
                </div>
              ))}
            </div>
          )}

          {note && <p className="mt-2 text-xs text-ink-muted">{note}</p>}
          {error && (
            <p role="alert" className="mt-2 text-xs text-live">
              {error}
            </p>
          )}
          {uploadStatus && (
            <p className="mt-2 text-xs text-ink-muted" aria-live="polite">
              Uploading {uploadStatus.done} of {uploadStatus.total}…
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handleFileSelect}
          />

          <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
            <div className="-ml-1.5 flex items-center gap-0.5">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    aria-label={opt.label}
                    onClick={() => onOptionClick(opt.key, opt.label)}
                    className="flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-xs tabular-nums",
                  tooLong ? "text-live" : remaining <= 20 ? "text-ink" : "text-ink-muted",
                )}
                aria-live="polite"
              >
                {remaining}
              </span>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canPost}
                className="inline-flex h-9 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent"
              >
                {submitting ? (uploadStatus ? "Uploading…" : "Posting…") : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
