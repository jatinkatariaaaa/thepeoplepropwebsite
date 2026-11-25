"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Light / dark switch for the dashboard. The choice lives on <html data-dash>,
 * set before first paint by DASH_THEME_SCRIPT, so there is no flash on reload.
 * The colour changes themselves are in src/app/(dashboard)/dashboard.module.css.
 */

export type DashTheme = "light" | "dark";
const KEY = "tpp-dash-theme";

/** Runs in <head> before hydration. */
export const DASH_THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="dark")document.documentElement.dataset.dash="dark"}catch(e){}`;

export function useDashTheme(): [DashTheme, (t: DashTheme) => void] {
  const [theme, setThemeState] = useState<DashTheme>("light");
  useEffect(() => {
    setThemeState(document.documentElement.dataset.dash === "dark" ? "dark" : "light");
    return () => {
      // leaving the dashboard: the public site and admin have their own themes
      delete document.documentElement.dataset.dash;
    };
  }, []);
  const setTheme = useCallback((t: DashTheme) => {
    setThemeState(t);
    if (t === "dark") document.documentElement.dataset.dash = "dark";
    else delete document.documentElement.dataset.dash;
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* private window */
    }
  }, []);
  return [theme, setTheme];
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useDashTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className={cn("grid grid-cols-2 gap-1 rounded-full bg-black/[0.045] p-1 ring-1 ring-black/[0.05]", className)}>
      {(
        [
          ["light", "Light", Sun],
          ["dark", "Dark", Moon],
        ] as const
      ).map(([key, label, Icon]) => {
        const on = theme === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setTheme(key)}
            className={cn(
              "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold transition-all",
              on ? "dash-seg-on bg-white text-[var(--g-ink)] shadow-[0_1px_2px_rgba(14,17,16,0.08)]" : "text-[var(--g-muted-ink)] hover:text-[var(--g-ink)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        );
      })}
    </div>
  );
}
