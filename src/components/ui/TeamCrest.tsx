import Image from "next/image";
import { cn } from "@/lib/cn";

const CREST_COLORS = [
  "#1f2937",
  "#0b3d2e",
  "#3b1d5e",
  "#5c1a1a",
  "#153e5c",
  "#4a3b0b",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function crestInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

interface TeamCrestProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

/** Team crest. Falls back to an initials badge with a lime edge when no crest. */
export function TeamCrest({ name, src, size = 40, className }: TeamCrestProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} crest`}
        width={size}
        height={size}
        className={cn("rounded-md object-cover bg-surface", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  const color = CREST_COLORS[hashString(name) % CREST_COLORS.length]!;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-bold uppercase text-white ring-1 ring-inset ring-white/10 select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: Math.round(size * 0.36),
      }}
    >
      {crestInitials(name)}
    </span>
  );
}
