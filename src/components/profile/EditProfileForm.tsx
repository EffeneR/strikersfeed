"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { updateProfile } from "@/lib/profile/actions";
import {
  ACCEPTED_AVATAR_TYPES,
  MAX_AVATAR_BYTES,
  uploadAvatar,
} from "@/lib/profile/avatarUpload";
import { Avatar } from "@/components/ui/Avatar";

interface Initial {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

export function EditProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const shownAvatar = previewUrl ?? (avatarUrl || null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError("Avatar must be JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Avatar must be under 2 MB.");
      return;
    }
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    let nextAvatarUrl = avatarUrl;
    if (avatarFile) {
      const up = await uploadAvatar(avatarFile);
      if (!up.ok) {
        setError(up.error);
        setSaving(false);
        return;
      }
      nextAvatarUrl = up.url;
    }

    const res = await updateProfile({
      displayName,
      username,
      bio,
      avatarUrl: avatarFile ? nextAvatarUrl : undefined,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't save your profile.");
      return;
    }
    setAvatarUrl(nextAvatarUrl);
    setAvatarFile(null);
    setPreviewUrl(null);
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-1 ring-line"
          aria-label="Change avatar"
        >
          {shownAvatar ? (
            // Preview may be a blob URL — plain img handles both cases.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <Avatar name={displayName || "You"} size={80} rounded="full" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" />
          </span>
        </button>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
          >
            Change photo
          </button>
          <p className="mt-1 text-xs text-ink-muted">JPG, PNG or WebP, up to 2 MB.</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={onFile}
        />
      </div>

      <Field label="Display name" htmlFor="displayName">
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          required
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </Field>

      <Field label="Username" htmlFor="username" hint="Lowercase letters, numbers and underscores.">
        <div className="flex items-center rounded-lg border border-line bg-surface focus-within:border-accent">
          <span className="pl-3 text-sm text-ink-muted">@</span>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            className="w-full bg-transparent px-2 py-2.5 text-sm text-ink outline-none"
          />
        </div>
      </Field>

      <Field label="Bio" htmlFor="bio">
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-live">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-accent">Profile saved.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
