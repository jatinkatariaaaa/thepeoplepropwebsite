"use client";

import { type ReactNode } from "react";
import { V3Header } from "./V3Header";
import { V3Footer } from "./V3Footer";
import { CustomCursor } from "./V3Animations";

export function V3Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <CustomCursor />
      <V3Header />
      {children}
      <V3Footer />
    </div>
  );
}
