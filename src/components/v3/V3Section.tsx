"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "lime" | "cream";

export function V3Section({
  children,
  variant = "cream",
  className,
  id,
  noPad,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  id?: string;
  noPad?: boolean;
}) {
  if (variant === "cream") {
    return (
      <section id={id} className={cn("w-full py-16 lg:py-24", className)}>
        <div className={cn(!noPad && "w-full px-5 lg:px-10")}>{children}</div>
      </section>
    );
  }

  const bg =
    variant === "dark"
      ? "bg-[#0c0c0c]"
      : "bg-[#cbfb45]";
  const radius =
    "rounded-[2rem] lg:rounded-[3.5rem]";

  return (
    <section id={id} className={cn("w-full pb-16 lg:pb-24", className)}>
      <div className="px-[5px] py-[5px]">
        <div
          className={cn(
            radius,
            bg,
            "px-[15px] py-20 lg:px-[35px] xl:py-28",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
