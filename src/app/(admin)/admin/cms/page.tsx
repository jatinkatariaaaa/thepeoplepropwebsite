"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, Edit, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminCmsPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<any>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages.filter((p: any) => p.page_key !== "announcement"));
        setAnnouncement(data.pages.find((p: any) => p.page_key === "announcement"));
      }
    } catch (e) {
      toast.error("Failed to load CMS pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const toggleAnnouncement = async () => {
    if (!announcement) return;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: "announcement",
          is_published: !announcement.is_published,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnnouncement({ ...announcement, is_published: !announcement.is_published });
      toast.success(announcement.is_published ? "Announcement disabled" : "Announcement enabled");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
          <FileText className="w-6 h-6" /> Content Management System
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Manage website pages, legal documents, and announcements.</p>
      </div>

      {/* Announcement Bar Widget */}
      {announcement && (
        <div className="mb-8 bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${announcement.is_published ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>
              {announcement.is_published ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-[var(--ink-950)] text-lg">Top Announcement Bar</h3>
              <p className="text-[13px] text-[var(--ink-500)] max-w-lg truncate">
                {announcement.content?.text || "No announcement text configured yet."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAnnouncement}
              className={`px-4 py-2 font-semibold rounded-xl transition-colors ${
                announcement.is_published 
                  ? "bg-red-50 text-red-600 hover:bg-red-100" 
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {announcement.is_published ? "Disable" : "Enable"}
            </button>
            <Link 
              href={`/admin/cms/announcement`}
              className="px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] text-[var(--ink-950)] font-semibold rounded-xl hover:bg-[var(--border)] transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit Content
            </Link>
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-[var(--ink-950)] mb-4">Website Pages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Link
            key={page.page_key}
            href={`/admin/cms/${page.page_key}`}
            className="group block bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm hover:shadow-md transition-all hover:border-[var(--ink-300)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[var(--paper-2)] rounded-xl group-hover:bg-[var(--accent)] group-hover:text-[var(--ink-950)] transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                page.is_published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}>
                {page.is_published ? "Published" : "Draft"}
              </span>
            </div>
            
            <h3 className="font-bold text-[var(--ink-950)] text-lg mb-1">{page.title}</h3>
            <p className="text-[12px] font-mono text-[var(--ink-400)] mb-4">/{page.page_key}</p>
            
            <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-[12px] text-[var(--ink-500)]">
              <span>Last updated</span>
              <span className="font-semibold">{format(new Date(page.updated_at), "MMM dd, yyyy")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
