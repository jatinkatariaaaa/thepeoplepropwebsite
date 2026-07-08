"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketEmail, setNewTicketEmail] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets?limit=100${statusFilter ? `&status=${statusFilter}` : ""}`);
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleCreateTicket = async () => {
    if (!newTicketEmail || !newTicketSubject) return toast.error("Please fill all fields");
    
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: newTicketEmail,
          subject: newTicketSubject,
          priority: newTicketPriority,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Ticket created successfully");
      setIsNewTicketModalOpen(false);
      setNewTicketEmail("");
      setNewTicketSubject("");
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="font-semibold text-[var(--ink-950)]">{row.original.subject}</div>
      ),
    },
    {
      accessorKey: "user_email",
      header: "User",
      cell: ({ row }) => (
        <div className="text-[13px] text-[var(--ink-500)]">{row.original.user_email}</div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const p = row.original.priority;
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
            p === "urgent" ? "bg-red-100 text-red-700" :
            p === "high" ? "bg-amber-100 text-amber-700" :
            p === "medium" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {p}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
            s === "open" ? "bg-blue-50 text-blue-700" :
            s === "in_progress" ? "bg-amber-50 text-amber-700" :
            s === "resolved" ? "bg-emerald-50 text-emerald-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {s.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => <span className="text-[12px]">{format(new Date(row.original.created_at), "MMM dd, yyyy HH:mm")}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link 
          href={`/admin/tickets/${row.original.id}`}
          className="text-[13px] font-bold text-[var(--ink-950)] hover:underline"
        >
          View Ticket
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> Support Tickets
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Manage user support requests and inquiries.</p>
        </div>
        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[{ label: "All", value: "" }, { label: "Open", value: "open" }, { label: "In Progress", value: "in_progress" }, { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" }].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.value 
                ? "bg-[var(--ink-950)] text-white" 
                : "bg-white border border-[var(--border)] text-[var(--ink-500)] hover:text-[var(--ink-950)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminTable data={tickets} columns={columns} loading={loading} />

      <AdminModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Create New Ticket"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">User Email</label>
            <input
              type="email"
              value={newTicketEmail}
              onChange={(e) => setNewTicketEmail(e.target.value)}
              className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Subject</label>
            <input
              type="text"
              value={newTicketSubject}
              onChange={(e) => setNewTicketSubject(e.target.value)}
              className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
              placeholder="Ticket subject"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Priority</label>
            <select
              value={newTicketPriority}
              onChange={(e) => setNewTicketPriority(e.target.value)}
              className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)] bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsNewTicketModalOpen(false)} className="px-4 py-2 text-[var(--ink-500)] font-semibold">Cancel</button>
            <button onClick={handleCreateTicket} className="px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold">Create Ticket</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
