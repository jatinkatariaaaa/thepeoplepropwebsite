import type { Metadata } from "next";
import { preload } from "react-dom";
import { PressPage } from "@/components/v2/glass/pages/press-page";

export const metadata: Metadata = {
  title: "Press & brand",
  description: "Facts, a ready-to-use description, the logo and the colours of The People Prop, plus the address for media enquiries.",
};

export default function Page() {
  preload("/art/page-press.webp", { as: "image", fetchPriority: "high" });
  return <PressPage />;
}
