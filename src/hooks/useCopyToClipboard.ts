"use client";

import { useCallback, useState } from "react";

export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
          throw new Error("Clipboard not available");
        }
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Copy failed");
        return false;
      }
    },
    [resetMs],
  );

  return { copied, error, copy };
}
