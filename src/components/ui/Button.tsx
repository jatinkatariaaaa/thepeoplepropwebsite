"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "secondary" | "ghost" | "outline" | "success";
type Size = "sm" | "md" | "lg";
type Shape = "pill" | "square";

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap " +
  "transition-all duration-200 ease-out " +
  "disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper " +
  "focus-visible:ring-[var(--accent)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-700)] " +
    "shadow-[0_8px_24px_-10px_rgba(37,99,235,0.50)] hover:shadow-[0_12px_30px_-10px_rgba(37,99,235,0.65)] " +
    "active:scale-[0.98]",
  dark:
    "bg-[var(--ink-950)] text-white hover:bg-[var(--ink-900)] " +
    "shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)] " +
    "active:scale-[0.98]",
  secondary:
    "bg-[var(--paper-2)] text-[var(--ink-950)] border border-[var(--border)] " +
    "hover:bg-white hover:border-[var(--border-strong)]",
  outline:
    "bg-white text-[var(--ink-950)] border border-[var(--border-strong)] " +
    "hover:border-[var(--ink-950)] hover:shadow-[0_0_0_1px_var(--ink-950)]",
  ghost:
    "text-[var(--ink-700)] hover:text-[var(--ink-950)] hover:bg-[var(--ink-50)]",
  success:
    "bg-[var(--success)] text-white hover:bg-[var(--success-700)] " +
    "shadow-[0_8px_24px_-10px_rgba(5,150,105,0.45)] active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[14px]",
  lg: "h-[52px] px-7 text-[15px]",
};

const shapes: Record<Shape, string> = {
  pill: "rounded-full",
  square: "rounded-xl",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type LinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
    href: string;
    external?: boolean;
  };

export type ButtonOrLinkProps = ButtonProps | LinkProps;

export function Button(props: ButtonOrLinkProps) {
  const {
    variant = "primary",
    size = "md",
    shape = "pill",
    className,
    fullWidth,
    children,
  } = props;

  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    shapes[shape],
    fullWidth && "w-full",
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const {
      href,
      external,
      variant: _v,
      size: _s,
      shape: _sh,
      className: _c,
      fullWidth: _f,
      children: _ch,
      ...rest
    } = props;
    void _v;
    void _s;
    void _sh;
    void _c;
    void _f;
    void _ch;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    shape: _sh,
    className: _c,
    fullWidth: _f,
    children: _ch,
    ...buttonRest
  } = props as ButtonProps;
  void _v;
  void _s;
  void _sh;
  void _c;
  void _f;
  void _ch;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}