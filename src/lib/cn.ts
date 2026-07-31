/**
 * Minimal className combiner — joins truthy class values with a space.
 * Kept dependency-free (no clsx / tailwind-merge) to avoid extra packages.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
