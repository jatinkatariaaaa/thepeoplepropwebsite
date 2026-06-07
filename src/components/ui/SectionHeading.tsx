import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg" | "xl";
  invert?: boolean;
}

const sizes = {
  md: "text-[2rem] md:text-[2.5rem] lg:text-[2.75rem]",
  lg: "text-[2.4rem] md:text-[3.25rem] lg:text-[3.75rem]",
  xl: "text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]",
} as const;

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  size = "lg",
  invert = false,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className={cn("flex", align === "center" ? "justify-center" : "justify-start")}>
          <div
            className={cn(
              "inline-flex items-center gap-2 mb-6 rounded-md px-3 py-1.5 border shadow-sm",
              invert 
                ? "bg-white/10 border-white/20 text-white" 
                : "bg-white/80 backdrop-blur-md border-[var(--border)] text-[var(--ink-700)]"
            )}
          >
            <span className="text-[11px] font-bold tracking-widest uppercase">
              {eyebrow}
            </span>
          </div>
        </div>
      )}
      <h2
        className={cn(
          "font-medium leading-[1.02] tracking-[-0.03em]",
          sizes[size],
          invert ? "text-white" : "text-[var(--ink-950)]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-base md:text-lg leading-relaxed max-w-2xl",
            invert ? "text-white/65" : "text-[var(--ink-500)]",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}