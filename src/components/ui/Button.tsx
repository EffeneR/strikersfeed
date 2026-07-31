import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-black hover:bg-accent-hover",
  secondary: "bg-surface text-ink hover:bg-surface-hover border border-line",
  outline: "border border-line text-ink hover:bg-surface-hover bg-transparent",
  ghost: "text-ink hover:bg-surface-hover bg-transparent",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  "aria-label"?: string;
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

/** Button that renders a native <button>, or a Next <Link> when `href` is set. */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = buttonClasses(variant, size, className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} aria-label={props["aria-label"]}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
