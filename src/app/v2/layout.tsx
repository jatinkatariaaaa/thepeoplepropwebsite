"use client";

import { useEffect } from "react";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  /* Hide the root-level Navbar & Footer when V2 is active */
  useEffect(() => {
    document.body.classList.add("v2-active");
    return () => {
      document.body.classList.remove("v2-active");
    };
  }, []);

  return <div className="v2-root">{children}</div>;
}
