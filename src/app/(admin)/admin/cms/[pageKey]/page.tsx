"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe } from "lucide-react";
import { toast } from "sonner";

export default function CmsEditorPage({ params }: { params: Promise<{ pageKey: string }> }) {
  const resolvedParams = use(params);
  const pageKey = resolvedParams.pageKey;
  const router = useRouter();

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [contentObj, setContentObj] = useState<any>({});
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch("/api/admin/cms");
        const data = await res.json();
        const p = data.pages?.find((x: any) => x.page_key === pageKey);
        
        if (p) {
          setPage(p);
          setTitle(p.title || "");
          setMetaTitle(p.meta_title || "");
          setMetaDesc(p.meta_description || "");
          setContentObj(p.content || {});
          setIsPublished(p.is_published);
        } else {
          toast.error("Page not found");
          router.push("/admin/cms");
        }
      } catch (e) {
        toast.error("Failed to load page");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageKey, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: pageKey,
          title,
          meta_title: metaTitle,
          meta_description: metaDesc,
          content: contentObj,
          is_published: isPublished,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Page saved successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-[var(--ink-400)]">Loading editor...</div>;
  if (!page) return null;

  const isAnnouncement = pageKey === "announcement";

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 bg-white border border-[var(--dash-hairline)] rounded-none hover:bg-[var(--dash-canvas)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--ink-600)]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--ink-950)]">Edit {page.title}</h1>
            <p className="text-[13px] text-[var(--ink-500)] font-mono">/{pageKey}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? "bg-emerald-500" : "bg-gray-300"}`}>
              <input type="checkbox" className="sr-only" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? "translate-x-6" : "translate-x-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[var(--ink-950)]">{isPublished ? "Published" : "Draft"}</span>
          </label>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 carbon-btn-primary disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {!isAnnouncement && (
            <div className="dash-card p-5">
              <h2 className="text-lg font-bold text-[var(--ink-950)] mb-4">Page Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Page Title (H1)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-3 text-sm outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="dash-card p-5">
            <h2 className="text-lg font-bold text-[var(--ink-950)] mb-4">Content Builder</h2>
            
            {isAnnouncement ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Announcement Text</label>
                  <input
                    type="text"
                    value={contentObj.text || ""}
                    onChange={(e) => setContentObj({ ...contentObj, text: e.target.value })}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-3 text-sm outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)]"
                    placeholder="E.g., Huge 20% OFF Sale ends Friday!"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Action Link (Optional)</label>
                  <input
                    type="text"
                    value={contentObj.link || ""}
                    onChange={(e) => setContentObj({ ...contentObj, link: e.target.value })}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-3 text-sm outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)]"
                    placeholder="https://..."
                  />
                </div>
              </div>
            ) : pageKey === "homepage" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Hero Title</label>
                  <input
                    type="text"
                    value={contentObj.hero_title || ""}
                    onChange={(e) => setContentObj({ ...contentObj, hero_title: e.target.value })}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-3 text-sm outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Hero Subtitle</label>
                  <textarea
                    value={contentObj.hero_subtitle || ""}
                    onChange={(e) => setContentObj({ ...contentObj, hero_subtitle: e.target.value })}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-3 text-sm outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)] min-h-[100px]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--ink-500)] mb-2">Use Markdown to format the content of this page.</p>
                <textarea
                  value={contentObj.markdown || ""}
                  onChange={(e) => setContentObj({ ...contentObj, markdown: e.target.value })}
                  className="w-full border border-[var(--dash-hairline)] rounded-none p-4 text-sm font-mono outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)] min-h-[400px]"
                  placeholder="# Heading 1&#10;Paragraph text here..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - SEO */}
        {!isAnnouncement && (
          <div className="space-y-6">
            <div className="dash-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-[var(--ink-600)]" />
                <h2 className="text-lg font-bold text-[var(--ink-950)]">SEO Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[var(--ink-950)] mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-2.5 text-sm outline-none focus:border-[var(--ink-950)]"
                    placeholder="Usually same as Title"
                  />
                  <p className="text-[11px] text-[var(--ink-400)] mt-1">{metaTitle.length} / 60 characters</p>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[var(--ink-950)] mb-1">Meta Description</label>
                  <textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    className="w-full border border-[var(--dash-hairline)] rounded-none p-2.5 text-sm outline-none focus:border-[var(--ink-950)] min-h-[100px] resize-none"
                    placeholder="Brief description for search engines..."
                  />
                  <p className="text-[11px] text-[var(--ink-400)] mt-1">{metaDesc.length} / 160 characters</p>
                </div>
              </div>
              
              <div className="mt-6 rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4 border border-[var(--dash-hairline)]">
                <p className="text-[11px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-2">Google Preview</p>
                <p className="text-[18px] text-[#1a0dab] truncate font-sans">{metaTitle || title || "Page Title"}</p>
                <p className="text-[13px] text-[#006621] truncate mb-1">thepeopleprop.live/{pageKey}</p>
                <p className="text-[13px] text-[#545454] line-clamp-2">{metaDesc || "No description provided for this page yet."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
