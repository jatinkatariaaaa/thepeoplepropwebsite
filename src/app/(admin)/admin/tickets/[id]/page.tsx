import type { Metadata } from "next";
import { SupportDesk } from "../SupportDesk";

export const metadata: Metadata = { title: "Support desk" };

/** A ticket's own address (from notifications and links): the desk with that ticket open. */
export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportDesk initialId={id} />;
}
