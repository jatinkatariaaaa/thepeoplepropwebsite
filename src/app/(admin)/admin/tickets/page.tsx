import type { Metadata } from "next";
import { SupportDesk } from "./SupportDesk";

export const metadata: Metadata = { title: "Support desk" };

export default function AdminTicketsPage() {
  return <SupportDesk />;
}
