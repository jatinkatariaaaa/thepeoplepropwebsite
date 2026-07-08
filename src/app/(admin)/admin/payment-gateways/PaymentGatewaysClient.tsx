"use client";

import { useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import { CreditCard, Bitcoin, Banknote, Check, X, Key, Webhook, ToggleLeft, ToggleRight, Settings, Save, TriangleAlert as AlertTriangle, Globe, DollarSign, Percent, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Gateway {
  id: string;
  gateway: string;
  is_active: boolean;
  is_sandbox: boolean;
  api_key: string | null;
  secret_key: string | null;
  webhook_secret: string | null;
  webhook_url: string | null;
  supported_currencies: string[];
  supported_methods: string[];
  fee_percentage: number;
  min_amount: number;
  max_amount: number;
  config: any;
  created_at: string;
  updated_at: string;
}

interface PaymentGatewaysClientProps {
  initialGateways: Gateway[];
}

const gatewayMeta: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  stripe: {
    label: "Stripe",
    icon: CreditCard,
    color: "#635BFF",
    desc: "Credit & debit card processing via Stripe",
  },
  crypto: {
    label: "Crypto",
    icon: Bitcoin,
    color: "#F59E0B",
    desc: "Bitcoin, Ethereum, and USDT payments",
  },
  manual: {
    label: "Manual",
    icon: Banknote,
    color: "#64748B",
    desc: "Bank transfers and wire payments",
  },
};

export function PaymentGatewaysClient({ initialGateways }: PaymentGatewaysClientProps) {
  const [gateways, setGateways] = useState<Gateway[]>(initialGateways);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const openEditModal = (gateway: Gateway) => {
    setEditingGateway({ ...gateway });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingGateway) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatewayId: editingGateway.id,
          is_active: editingGateway.is_active,
          is_sandbox: editingGateway.is_sandbox,
          api_key: editingGateway.api_key,
          secret_key: editingGateway.secret_key,
          webhook_secret: editingGateway.webhook_secret,
          webhook_url: editingGateway.webhook_url,
          supported_currencies: editingGateway.supported_currencies,
          supported_methods: editingGateway.supported_methods,
          fee_percentage: editingGateway.fee_percentage,
          min_amount: editingGateway.min_amount,
          max_amount: editingGateway.max_amount,
          config: editingGateway.config,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(`${gatewayMeta[editingGateway.gateway]?.label || editingGateway.gateway} settings updated`);
      setGateways((prev) =>
        prev.map((g) => (g.id === editingGateway.id ? { ...g, ...editingGateway } : g))
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const updateEditingField = (field: keyof Gateway, value: any) => {
    if (!editingGateway) return;
    setEditingGateway({ ...editingGateway, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Gateway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {gateways.map((gateway) => {
          const meta = gatewayMeta[gateway.gateway] || gatewayMeta.manual;
          const Icon = meta.icon;
          const isLive = !gateway.is_sandbox;

          return (
            <div
              key={gateway.id}
              className={`rounded-none border transition-all overflow-hidden ${
                gateway.is_active
                  ? "border-[var(--dash-hairline)] bg-white shadow-sm"
                  : "border-[var(--dash-hairline)] bg-[var(--dash-canvas)] opacity-70"
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--dash-hairline)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-none flex items-center justify-center text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--ink-950)]">{meta.label}</h3>
                      <p className="text-xs text-[var(--ink-500)]">{meta.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLive ? "bg-[#a7f0ba] text-[#0e6027]" : "bg-[#fcf4d6] text-[#8e6a00]"
                      }`}
                    >
                      {isLive ? "Live" : "Sandbox"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        gateway.is_active ? "bg-[#a7f0ba] text-[#0e6027]" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {gateway.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                    <p className="dash-overline mb-1 text-[10px]">Fee</p>
                    <p className="font-semibold text-[var(--ink-950)]">{gateway.fee_percentage}%</p>
                  </div>
                  <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                    <p className="dash-overline mb-1 text-[10px]">Min / Max</p>
                    <p className="font-semibold text-[var(--ink-950)] text-sm">${gateway.min_amount} / ${gateway.max_amount}</p>
                  </div>
                </div>

                <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                  <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-2">Supported Currencies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(gateway.supported_currencies || []).map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-white border border-[var(--dash-hairline)] rounded-full text-xs font-medium text-[var(--ink-600)]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                  <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-2">Payment Methods</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(gateway.supported_methods || []).map((m) => (
                      <span key={m} className="px-2 py-0.5 bg-white border border-[var(--dash-hairline)] rounded-full text-xs font-medium text-[var(--ink-600)] capitalize">
                        {m.replace("crypto_", "").replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* API Key Status */}
                <div className="flex items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                  <Key className={`w-4 h-4 ${gateway.api_key ? "text-[var(--dash-positive)]" : "text-red-400"}`} />
                  <span className={`text-xs font-medium ${gateway.api_key ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]"}`}>
                    {gateway.api_key ? "API Key configured" : "API Key missing"}
                  </span>
                </div>

                {/* Webhook Status */}
                <div className="flex items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                  <Webhook className={`w-4 h-4 ${gateway.webhook_url ? "text-[var(--dash-positive)]" : "text-[var(--ink-400)]"}`} />
                  <span className={`text-xs font-medium ${gateway.webhook_url ? "text-[var(--dash-positive)]" : "text-[var(--ink-400)]"}`}>
                    {gateway.webhook_url ? "Webhook configured" : "No webhook URL"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
                <button
                  onClick={() => openEditModal(gateway)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 carbon-btn-primary"
                >
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingGateway(null); }}
        title={`Configure ${editingGateway ? gatewayMeta[editingGateway.gateway]?.label || editingGateway.gateway : ""}`}
        size="lg"
      >
        {editingGateway && (
          <div className="space-y-5">
            {/* Status Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => updateEditingField("is_active", !editingGateway.is_active)}
                className={`p-4 rounded-none border cursor-pointer transition-all ${
                  editingGateway.is_active
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[var(--dash-hairline)] bg-[var(--dash-canvas)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--ink-950)]">Active</span>
                  {editingGateway.is_active ? (
                    <ToggleRight className="w-6 h-6 text-[var(--dash-positive)]" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-[var(--ink-400)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--ink-500)]">Enable this gateway for payments</p>
              </div>

              <div
                onClick={() => updateEditingField("is_sandbox", !editingGateway.is_sandbox)}
                className={`p-4 rounded-none border cursor-pointer transition-all ${
                  !editingGateway.is_sandbox
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[var(--dash-hairline)] bg-[var(--dash-canvas)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--ink-950)]">Live Mode</span>
                  {!editingGateway.is_sandbox ? (
                    <ToggleRight className="w-6 h-6 text-[var(--dash-positive)]" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-[var(--ink-400)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--ink-500)]">Use production environment</p>
              </div>
            </div>

            {/* API Keys */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--ink-950)] flex items-center gap-2">
                <Key className="w-4 h-4" /> API Configuration
              </h4>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-600">API Key (Public)</label>
                <div className="relative">
                  <input
                    type={showSecrets["api_key"] ? "text" : "password"}
                    value={editingGateway.api_key || ""}
                    onChange={(e) => updateEditingField("api_key", e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                    placeholder="pk_live_..."
                  />
                  <button
                    onClick={() => toggleSecretVisibility("api_key")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)] hover:text-[var(--ink-700)]"
                  >
                    {showSecrets["api_key"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-600">Secret Key</label>
                <div className="relative">
                  <input
                    type={showSecrets["secret_key"] ? "text" : "password"}
                    value={editingGateway.secret_key || ""}
                    onChange={(e) => updateEditingField("secret_key", e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                    placeholder="sk_live_..."
                  />
                  <button
                    onClick={() => toggleSecretVisibility("secret_key")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)] hover:text-[var(--ink-700)]"
                  >
                    {showSecrets["secret_key"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Webhook */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--ink-950)] flex items-center gap-2">
                <Webhook className="w-4 h-4" /> Webhook Configuration
              </h4>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-600">Webhook URL</label>
                <input
                  type="text"
                  value={editingGateway.webhook_url || ""}
                  onChange={(e) => updateEditingField("webhook_url", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                  placeholder="https://your-domain.com/api/webhook/..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-600">Webhook Secret</label>
                <div className="relative">
                  <input
                    type={showSecrets["webhook_secret"] ? "text" : "password"}
                    value={editingGateway.webhook_secret || ""}
                    onChange={(e) => updateEditingField("webhook_secret", e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                    placeholder="whsec_..."
                  />
                  <button
                    onClick={() => toggleSecretVisibility("webhook_secret")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)] hover:text-[var(--ink-700)]"
                  >
                    {showSecrets["webhook_secret"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Fee & Limits */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--ink-950)] flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Fees & Limits
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-600">Fee %</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
                    <input
                      type="number"
                      step="0.01"
                      value={editingGateway.fee_percentage}
                      onChange={(e) => updateEditingField("fee_percentage", parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-600">Min Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
                    <input
                      type="number"
                      value={editingGateway.min_amount}
                      onChange={(e) => updateEditingField("min_amount", parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-600">Max Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
                    <input
                      type="number"
                      value={editingGateway.max_amount}
                      onChange={(e) => updateEditingField("max_amount", parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Currencies */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--ink-950)] flex items-center gap-2">
                <Globe className="w-4 h-4" /> Supported Currencies
              </h4>
              <input
                type="text"
                value={(editingGateway.supported_currencies || []).join(", ")}
                onChange={(e) =>
                  updateEditingField(
                    "supported_currencies",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full px-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                placeholder="USD, EUR, GBP"
              />
            </div>

            {/* Security Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-none border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Security Notice</p>
                <p className="text-sm text-amber-700 mt-1">
                  API keys and secrets are stored in the database. Ensure your Supabase project has proper access controls. Never expose secret keys in client-side code.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingGateway(null); }}
                className="rounded-none px-4 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 font-bold text-white carbon-btn-primary disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
