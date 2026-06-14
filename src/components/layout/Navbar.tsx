"use client";

import { usePathname } from "next/navigation";
import { V3Header } from "@/components/v3/V3Header";

export function Navbar() {
  const pathname = usePathname();
  if (pathname === "/referral" || pathname.startsWith("/admin")) {
    return null;
  }

  return <V3Header />;
}