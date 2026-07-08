"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ShoppingCart, Eye, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?limit=100${statusFilter ? `&status=${statusFilter}` : ""}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          payment_status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success(`Order marked as ${newStatus}`);
      setIsRefundModalOpen(false);
      setIsModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "order_id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono text-[12px] font-bold text-[var(--ink-950)]">{row.original.order_id}</span>
      ),
    },
    {
      accessorKey: "user_email",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)] text-[13px]">{row.original.user?.display_name || "Guest"}</p>
          <p className="text-[11px] text-[var(--ink-500)]">{row.original.user_email}</p>
        </div>
      ),
    },
    {
      accessorKey: "program_key",
      header: "Program",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-[var(--ink-950)] text-[12px] uppercase">{row.original.program_key}</p>
          <p className="text-[11px] text-[var(--ink-500)]">Size: ${row.original.account_size?.toLocaleString()}</p>
        </div>
      ),
    },
    {
      accessorKey: "price_amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-bold text-[var(--ink-950)]">
          ${row.original.price_amount?.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.payment_status;
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
            s === "paid" ? "bg-emerald-50 text-emerald-700" :
            s === "refunded" ? "bg-red-50 text-red-700" :
            s === "failed" ? "bg-rose-50 text-rose-700" :
            "bg-amber-50 text-amber-700"
          }`}>
            {s}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => <span className="text-[12px]">{format(new Date(row.original.created_at), "MMM dd, yyyy")}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedOrder(row.original); setIsModalOpen(true); }}
            className="p-1.5 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-ink-100 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
          <ShoppingCart className="w-6 h-6" /> Orders & Purchases
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Manage challenge purchases, check statuses, and process manual refunds.</p>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[{ label: "All", value: "" }, { label: "Paid", value: "paid" }, { label: "Pending", value: "pending" }, { label: "Refunded", value: "refunded" }, { label: "Failed", value: "failed" }].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.value 
                ? "bg-[var(--ink-950)] text-white" 
                : "bg-white border border-[var(--dash-hairline)] text-[var(--ink-500)] hover:text-[var(--ink-950)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminTable data={orders} columns={columns} loading={loading} />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[var(--dash-hairline)] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)]">${selectedOrder.price_amount?.toFixed(2)}</h2>
                <p className="text-sm font-mono text-[var(--ink-500)]">{selectedOrder.order_id}</p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                selectedOrder.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" :
                selectedOrder.payment_status === "refunded" ? "bg-red-50 text-red-700" :
                "bg-amber-50 text-amber-700"
              }`}>
                {selectedOrder.payment_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-[var(--ink-400)] uppercase">Customer</p>
                <p className="font-semibold text-sm mt-1">{selectedOrder.user?.display_name || "Guest"}</p>
                <p className="text-sm text-[var(--ink-600)]">{selectedOrder.user_email}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--ink-400)] uppercase">Date</p>
                <p className="font-semibold text-sm mt-1">{format(new Date(selectedOrder.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--ink-400)] uppercase">Program</p>
                <p className="font-semibold text-sm mt-1 uppercase">{selectedOrder.program_key}</p>
                <p className="text-sm text-[var(--ink-600)]">Size: ${selectedOrder.account_size?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--ink-400)] uppercase">Platform</p>
                <p className="font-semibold text-sm mt-1">{selectedOrder.platform || "TradeLocker"}</p>
              </div>
            </div>

            {selectedOrder.applied_coupon && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex justify-between items-center text-sm">
                <span className="font-bold text-amber-800">Coupon Used:</span>
                <span className="font-mono font-bold text-amber-600">{selectedOrder.applied_coupon}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[var(--dash-hairline)]">
              {selectedOrder.payment_status === "paid" && (
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Mark Refunded
                </button>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Confirm Refund"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink-600)]">
            Are you sure you want to mark order <strong className="font-mono">{selectedOrder?.order_id}</strong> as refunded?
          </p>
          <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-xs font-semibold">
            Note: This action only updates the status in the database. You must process the actual refund manually via your payment gateway (e.g., Stripe, Confirmo).
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsRefundModalOpen(false)} className="px-4 py-2 text-[var(--ink-500)] font-semibold">Cancel</button>
            <button onClick={() => handleStatusChange("refunded")} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Confirm Refund</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
