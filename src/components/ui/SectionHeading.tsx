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
        "relative max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {/* Background Blue Glow & Grain Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[180%] -z-10 pointer-events-none select-none">
        {/* The Blue Glow */}
        <div 
          className="absolute inset-0 blur-[60px] md:blur-[80px]"
          style={{
            background: invert 
              ? "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.25) 0%, transparent 60%)"
              : "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.12) 0%, transparent 60%)"
          }}
        />
        {/* The Grain Overlay */}
        <div 
          className={cn(
            "absolute inset-0 mix-blend-overlay",
            invert ? "opacity-[0.15]" : "opacity-[0.08]"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>
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