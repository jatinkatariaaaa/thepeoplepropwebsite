/**
 * Support tickets, shared by the trader's Support page and the admin Support desk.
 * Safe to import from client components.
 *
 * A ticket is a conversation: the trader opens it, the team answers from Admin → Support,
 * and every reply shows up on the other side (database triggers keep last_sender, the unread
 * flags and the notifications in step; see supabase/migrations/20261126190723_support_desk.sql).
 */

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type Sender = "user" | "admin";

export const TICKET_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
export const TICKET_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const isTicketStatus = (v: unknown): v is TicketStatus => typeof v === "string" && (TICKET_STATUSES as string[]).includes(v);
export const isTicketPriority = (v: unknown): v is TicketPriority => typeof v === "string" && (TICKET_PRIORITIES as string[]).includes(v);

export type TicketRow = {
  id: string;
  user_id: string | null;
  user_email: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  last_sender: Sender | null;
  user_unread: boolean | null;
  admin_unread: boolean | null;
};

export type TicketMessage = {
  id: string;
  sender_role: Sender;
  message: string;
  created_at: string;
  /** admin replies: the team member's first name, when known */
  sender_name?: string | null;
};

/** One line in the admin inbox. */
export type DeskTicket = TicketRow & {
  user_name: string | null;
  preview: string | null;
};

export type DeskView = "needs_reply" | "waiting" | "active" | "resolved" | "closed" | "all";

export const DESK_VIEWS: { key: DeskView; label: string; hint: string }[] = [
  { key: "needs_reply", label: "Needs reply", hint: "The trader wrote last" },
  { key: "waiting", label: "Answered", hint: "We replied, waiting on the trader" },
  { key: "active", label: "All open", hint: "Open or in progress" },
  { key: "resolved", label: "Resolved", hint: "" },
  { key: "closed", label: "Closed", hint: "" },
  { key: "all", label: "All", hint: "" },
];

export const isDeskView = (v: unknown): v is DeskView => typeof v === "string" && DESK_VIEWS.some((d) => d.key === v);

/** The trader behind a ticket, as the desk's side panel shows them. */
export type DeskUser = {
  id: string;
  name: string | null;
  email: string | null;
  joined: string | null;
  kyc: string | null;
  status: string | null;
  accounts: number;
  tickets: number;
};

export const MAX_MESSAGE = 5000;
export const MAX_SUBJECT = 160;

export function timeAgo(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return "";
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  if (m < 43200) return `${Math.round(m / 1440)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
