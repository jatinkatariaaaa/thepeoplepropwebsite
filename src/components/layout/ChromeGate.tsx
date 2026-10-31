"use client";

import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/login", "/dashboard", "/admin", "/v2"];

/** Renders children only on routes where the global chrome should appear. */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return null;
  }
  return <>{children}</>;
}
