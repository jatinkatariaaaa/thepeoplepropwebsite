"use client";

import { useState, useEffect, useRef, use } from "react";
import { format } from "date-fns";
import { ArrowLeft, Send, Clock, User, ShieldAlert, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    try {
      // Use existing API to fetch all tickets and filter
      const res = await fetch(`/api/admin/tickets?limit=100`);
      const data = await res.json();
      const t = data.tickets?.find((x: any) => x.id === ticketId);
      if (t) setTicket(t);
      else router.push("/admin/tickets");
    } catch (e) {
      toast.error("Failed to load ticket details");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTicket(), fetchMessages()]);
    setLoading(false);
    scrollToBottom();
  };

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setReplyText("");
      await fetchMessages();
      if (ticket.status === "open") await fetchTicket(); // Status might have changed to in_progress
      scrollToBottom();
      toast.success("Reply sent");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTicket({ ...ticket, status });
      toast.success("Status updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTicket({ ...ticket, priority });
      toast.success("Priority updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-[var(--ink-400)]">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets" className="p-2 bg-white border border-[var(--dash-hairline)] rounded-xl hover:bg-[var(--dash-canvas)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--ink-600)]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--ink-950)]">{ticket.subject}</h1>
            <p className="text-[13px] text-[var(--ink-500)]">Ticket #{ticket.id.split("-")[0]}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Chat Thread */}
        <div className="flex-1 flex flex-col dash-card overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--ink-400)] space-y-3">
                <Inbox className="w-12 h-12 opacity-20" />
                <p>No messages yet. Reply to start the conversation.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isAdmin = msg.sender_role === "admin";
                return (
                  <div key={idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      isAdmin 
                        ? "bg-[var(--ink-950)] text-white rounded-tr-sm" 
                        : "bg-[var(--dash-canvas)] text-[var(--ink-950)] border border-[var(--dash-hairline)] rounded-tl-sm"
                    }`}>
                      <div className="flex justify-between items-center mb-1 gap-4">
                        <span className={`text-[11px] font-bold ${isAdmin ? "text-[var(--ink-400)]" : "text-[var(--ink-500)]"}`}>
                          {msg.sender?.display_name || msg.sender?.email || "Admin"}
                        </span>
                        <span className={`text-[10px] ${isAdmin ? "text-[var(--ink-400)]" : "text-[var(--ink-400)]"}`}>
                          {format(new Date(msg.created_at), "HH:mm, MMM dd")}
                        </span>
                      </div>
                      <div className="text-[14px] whitespace-pre-wrap">{msg.message}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
            <div className="flex gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="flex-1 rounded-xl border border-[var(--dash-hairline)] p-3 text-sm focus:outline-none focus:border-[var(--ink-950)] resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="self-end p-3 bg-[var(--accent)] text-[var(--ink-950)] rounded-xl hover:bg-[#bbf034] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-[var(--ink-400)] mt-2 ml-1">Press Enter to send, Shift+Enter for new line.</p>
          </div>
        </div>

        {/* Right Panel - Ticket Details */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 overflow-y-auto">
          {/* User Info */}
          <div className="dash-card p-5">
            <h3 className="text-[13px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-4">User Details</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--dash-canvas)] rounded-full flex items-center justify-center border border-[var(--dash-hairline)]">
                <User className="w-5 h-5 text-[var(--ink-600)]" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-[var(--ink-950)] truncate">{ticket.user?.display_name || "Unknown"}</p>
                <p className="text-[12px] text-[var(--ink-500)] truncate">{ticket.user_email}</p>
              </div>
            </div>
            {ticket.user_id && (
              <Link href="/admin/users" className="block text-center w-full py-2 bg-[var(--dash-canvas)] rounded-lg text-[13px] font-bold text-[var(--ink-600)] hover:text-[var(--ink-950)] transition-colors">
                View Full Profile
              </Link>
            )}
          </div>

          {/* Ticket Settings */}
          <div className="dash-card p-5">
            <h3 className="text-[13px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-4">Ticket Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-600)] mb-1">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className={`w-full rounded-lg border p-2 text-sm font-semibold outline-none ${
                    ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    ticket.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-white border-[var(--dash-hairline)] text-[var(--ink-950)]'
                  }`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-600)] mb-1">Priority</label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handleUpdatePriority(e.target.value)}
                  className={`w-full rounded-lg border p-2 text-sm font-semibold outline-none ${
                    ticket.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                    ticket.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-white border-[var(--dash-hairline)] text-[var(--ink-950)]'
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[var(--dash-hairline)]">
                <div className="flex items-center gap-2 text-[12px] text-[var(--ink-500)] mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created: {format(new Date(ticket.created_at), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[var(--ink-500)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Updated: {format(new Date(ticket.updated_at), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
