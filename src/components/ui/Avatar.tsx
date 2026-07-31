import Image from "next/image";
import { cn } from "@/lib/cn";

const AVATAR_COLORS = [
  "#3b5bdb",
  "#2f9e44",
  "#e8590c",
  "#9c36b5",
  "#0ca678",
  "#c92a2a",
  "#1098ad",
  "#f08c00",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
}

/**
 * Account avatar. Uses a supplied image when present, otherwise renders a
 * deterministic initials tile so no real photos are required in Phase 1.
 */
export function Avatar({ name, src, size = 40, className, rounded = "full" }: AvatarProps) {
  const radius = rounded === "full" ? "rounded-full" : "rounded-lg";
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} avatar`}
        width={size}
        height={size}
        className={cn(radius, "object-cover bg-surface", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  const color = AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length]!;
  return (
    <span
      aria-hidden="true"
      className={cn(
        radius,
        "inline-flex shrink-0 items-center justify-center font-semibold text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: Math.round(size * 0.4),
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
