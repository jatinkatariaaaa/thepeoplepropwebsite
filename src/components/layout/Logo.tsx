import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWord = true,
  invert = false,
}: {
  className?: string;
  showWord?: boolean;
  invert?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="The People Prop home"
      className={cn(
        "inline-flex items-center gap-2.5 group",
        className,
      )}
    >
      <img
        src="/images/logo.webp"
        alt="The People Prop Logo"
        width={28}
        height={28}
        className="shrink-0 rounded-lg object-contain"
      />
      {showWord && (
        <span
          className={cn(
            "font-medium text-[14px] tracking-[0.02em]",
            invert ? "text-white" : "text-[var(--ink-950)]",
          )}
        >
          The People Prop
        </span>
      )}
    </Link>
  );
}