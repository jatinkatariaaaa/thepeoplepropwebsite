"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export function AdminFaqsClient({ initialFaqs }: { initialFaqs: any[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ question: "", answer: "", category: "General", sort_order: 0, is_active: true });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSave() {
    try {
      if (editingId) {
        const { error } = await supabase.from("tpp_faqs").update(form).eq("id", editingId);
        if (error) throw error;
        setFaqs(faqs.map(f => f.id === editingId ? { ...f, ...form } : f));
        setEditingId(null);
      } else {
        const { data, error } = await supabase.from("tpp_faqs").insert([form]).select().single();
        if (error) throw error;
        setFaqs([...faqs, data].sort((a, b) => a.sort_order - b.sort_order));
        setIsAdding(false);
      }
      setForm({ question: "", answer: "", category: "General", sort_order: 0, is_active: true });
    } catch (err) {
      console.error(err);
      alert("Failed to save FAQ");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const { error } = await supabase.from("tpp_faqs").delete().eq("id", id);
      if (error) throw error;
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setForm({ question: "", answer: "", category: "General", sort_order: faqs.length + 1, is_active: true });
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-[#cbfb45] text-black px-4 py-2 rounded-none font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-none border border-[var(--dash-hairline)] shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit FAQ" : "Add New FAQ"}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input 
                type="text" 
                value={form.question} 
                onChange={(e) => setForm({...form, question: e.target.value})}
                className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea 
                value={form.answer} 
                onChange={(e) => setForm({...form, answer: e.target.value})}
                className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 h-24"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={form.category} 
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input 
                  type="number" 
                  value={form.sort_order} 
                  onChange={(e) => setForm({...form, sort_order: parseInt(e.target.value)})}
                  className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-4 py-2 border rounded-none font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white rounded-none font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--dash-canvas)] border-b border-[var(--dash-hairline)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
              <th className="px-6 py-4 font-medium">Order</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Question</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dash-hairline)]">
            {faqs.map(faq => (
              <tr key={faq.id} className="hover:bg-[var(--dash-canvas)] transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">{faq.sort_order}</td>
                <td className="px-6 py-4 text-sm font-medium">{faq.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{faq.question}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => {
                    setForm({ question: faq.question, answer: faq.answer, category: faq.category, sort_order: faq.sort_order, is_active: faq.is_active });
                    setEditingId(faq.id);
                    setIsAdding(false);
                  }} className="text-gray-500 hover:text-black">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(faq.id)} className="text-red-400 hover:text-[var(--dash-negative)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No FAQs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
