"use client";

import { type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { V3Footer } from "./V3Footer";
import { CustomCursor } from "@/components/ui/Animations";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="page-wrapper min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <CustomCursor />
      <Navbar />
      {children}
      <V3Footer />
    </div>
  );
}
