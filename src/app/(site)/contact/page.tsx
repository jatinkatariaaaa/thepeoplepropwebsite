import type { Metadata } from "next";
import { preload } from "react-dom";
import { ContactPage } from "@/components/v2/glass/pages/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach The People Prop support by email, Telegram or Discord, or send the team a message.",
};

export default function Page() {
  preload("/art/page-contact.webp", { as: "image", fetchPriority: "high" });
  return <ContactPage />;
}
