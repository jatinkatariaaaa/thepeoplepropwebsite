"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * next/link with one change: links into the signed-in areas prefetch when the visitor shows intent
 * (hover, touch or keyboard focus) instead of as soon as they appear on screen.
 *
 * Those routes are dynamic and have a loading.js boundary, so Next.js prefetches them by rendering the
 * shared layout on the server, and keeps the result for only 30 seconds (Next.js prefetching guide). The
 * dashboard sidebar alone links to about a dozen of them, so every dashboard view made a dozen server
 * renders and proxy runs (each with Supabase calls), and the "Start" buttons on the public pages made a
 * signed-out visitor's browser render /dashboard/new-challenge and then /login. On Vercel that was most of
 * the Fluid Active CPU in November 2026.
 *
 * Intent still comes before the click, so navigation keeps its head start, and every other link (static
 * pages, anchors, external sites) prefetches exactly as before. An explicit `prefetch` prop always wins.
 */
const SIGNED_IN_AREAS = ["/dashboard", "/admin", "/partner-desk", "/login", "/complete-profile"];

type Props = ComponentProps<typeof NextLink>;

function leadsToSignedInArea(href: Props["href"]): boolean {
  const path = (typeof href === "string" ? href : href.pathname ?? "").split(/[?#]/)[0];
  return SIGNED_IN_AREAS.some((area) => path === area || path.startsWith(`${area}/`));
}

export default function Link({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: Props) {
  const [intent, setIntent] = useState(false);

  if (prefetch !== undefined || !leadsToSignedInArea(props.href)) {
    return <NextLink {...props} prefetch={prefetch} onMouseEnter={onMouseEnter} onTouchStart={onTouchStart} onFocus={onFocus} />;
  }

  return (
    <NextLink
      {...props}
      // false until intent, then null: the default prefetch, as in the Next.js hover-prefetch example
      prefetch={intent ? null : false}
      onMouseEnter={(event) => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
    />
  );
}
