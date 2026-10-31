"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Edit2, Check, X } from "lucide-react";

export function AdminStatsClient({ initialStats }: { initialStats: any[] }) {
  const [stats, setStats] = useState(initialStats);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSave(id: string) {
    try {
      const { error } = await supabase.from("tpp_stats").update({ value: editValue }).eq("id", id);
      if (error) throw error;
      setStats(stats.map(s => s.id === id ? { ...s, value: editValue } : s));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save stat");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--paper-2)] border-b border-[var(--border)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
            <th className="px-6 py-4 font-medium">Stat Name</th>
            <th className="px-6 py-4 font-medium">Value</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {stats.map(stat => (
            <tr key={stat.id} className="hover:bg-[var(--paper-2)] transition-colors">
              <td className="px-6 py-4 font-medium text-[var(--ink-950)]">
                {stat.label} <span className="text-xs text-gray-400 font-mono ml-2">({stat.key_name})</span>
              </td>
              <td className="px-6 py-4">
                {editingId === stat.id ? (
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full border rounded p-1"
                    autoFocus
                  />
                ) : (
                  <span className="font-bold text-lg">{stat.value}</span>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {editingId === stat.id ? (
                  <>
                    <button onClick={() => handleSave(stat.id)} className="text-green-600 hover:text-green-700">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => {
                    setEditValue(stat.value);
                    setEditingId(stat.id);
                  }} className="text-gray-500 hover:text-black">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {stats.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No stats found. Run the SQL script to initialize them.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
