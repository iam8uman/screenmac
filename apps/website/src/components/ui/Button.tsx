import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-[#2b2a33] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_2px_rgba(23,22,28,0.25)]",
  accent: "bg-accent text-white hover:bg-accent-hover shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(58,47,184,0.35)]",
  secondary: "border border-line-strong bg-paper-raised text-ink hover:border-ink/40",
  ghost: "text-ink-muted hover:text-ink hover:bg-paper-sunk",
  inverse: "bg-white text-ink hover:bg-white/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-10 px-5 text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function LinkButton({ variant, size, className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
