"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Download, ExternalLink, FileBadge, Handshake, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { btn, Chip, field, fieldLabel, PageTitle, Panel, PanelHead } from "@/components/dashboard/glass";
import { certificateImagePath, verifyUrl } from "@/lib/certificates/types";
import type { PartnerCollaborator } from "@/lib/partners";
import { cn } from "@/lib/utils";

type Mutation =
  | { action: "approve"; collaboratorId: string; displayName: string; affiliateEmail: string }
  | { action: "set_affiliate"; collaboratorId: string; affiliateEmail: string }
  | { action: "issue"; collaboratorId: string }
  | { action: "revoke"; collaboratorId: string; certificateId: string };

const light = cn(btn.light, btn.sm);
const primary = cn(btn.lime, btn.sm);
const utcDate = (date: string) => new Date(date).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" });

async function copyLink(url: string, label: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(label + " copied.");
  } catch {
    toast.error("Open the link to copy its address.");
  }
}

export function PartnerProgramClient({ collaborators, page, hasMore }: {
  collaborators: PartnerCollaborator[];
  page: number;
  hasMore: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [affiliateEmail, setAffiliateEmail] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const approval = useRef<{ details: string; id: string } | null>(null);

  async function mutate(payload: Mutation, message: string) {
    if (busy) return false;
    setBusy(payload.collaboratorId);
    try {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this change.");
      toast.success(message);
      if (payload.action === "approve" && page !== 1) router.replace("/admin/partners");
      router.refresh();
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Could not save this change.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function approve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = name.trim();
    const details = JSON.stringify([displayName, affiliateEmail.trim()]);
    if (approval.current?.details !== details) approval.current = { details, id: crypto.randomUUID() };
    if (await mutate({ action: "approve", collaboratorId: approval.current.id, displayName, affiliateEmail }, "Collaborator approved.")) {
      approval.current = null;
      setName("");
      setAffiliateEmail("");
    }
  }

  return (
    <div>
      <PageTitle lead="Partner Program" lede="Approve collaborators, issue verifiable partnership certificates, and link existing affiliate profiles." />
      <Panel>
        <PanelHead title="Approve collaborator" icon={Handshake} />
        <form onSubmit={approve} className="grid items-end gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label>
            <span className={fieldLabel}>Name on certificate</span>
            <input className={field()} minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            <span className={fieldLabel}>Affiliate email (optional)</span>
            <input className={field()} type="email" maxLength={254} placeholder="Existing active affiliate" value={affiliateEmail} onChange={(event) => setAffiliateEmail(event.target.value)} />
          </label>
          <button type="submit" className={btn.lime} disabled={Boolean(busy)}><Plus className="size-4" /> Approve collaborator</button>
        </form>
      </Panel>

      <Panel className="mt-5">
        <PanelHead title="Approved collaborators" icon={FileBadge} />
        {collaborators.length === 0 ? (
          <p className="p-6 text-sm text-[var(--g-muted-ink)]">{page === 1 ? "Approved collaborators will appear here." : "No collaborators on this page."}</p>
        ) : (
          <ul className="divide-y divide-black/[0.07]">
            {collaborators.map((partner) => {
              const cert = partner.certificate;
              const active = cert && !cert.revoked_at;
              return (
                <li key={partner.id} className="space-y-3 px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-[var(--g-ink)]">{partner.displayName}</h3>
                      <p className="mt-1 text-xs text-[var(--g-muted-ink)]">
                        Approved {utcDate(partner.approvedAt)}{cert ? " · Certificate issued " + utcDate(cert.issued_at) : ""}
                      </p>
                    </div>
                    <Chip tone={active ? "emerald" : cert ? "red" : "neutral"}>
                      {active ? "Active certificate" : cert ? "Revoked certificate" : "Certificate pending"}
                    </Chip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cert && <a className={light} href={verifyUrl(cert.id)} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Verify</a>}
                    {active ? (
                      <>
                        <a className={light} href={certificateImagePath(cert.id)} download={"TPP-partner-" + cert.id + ".png"}><Download className="size-4" /> PNG</a>
                        <button type="button" className={light} onClick={() => void copyLink(verifyUrl(cert.id), "Verification link")}><Link2 className="size-4" /> Copy verify link</button>
                        <button type="button" className={cn(light, "text-red-700!")} disabled={Boolean(busy)} onClick={() => {
                          if (window.confirm("Revoke this collaborator's partnership certificate?")) {
                            void mutate({ action: "revoke", collaboratorId: partner.id, certificateId: cert.id }, "Certificate revoked.");
                          }
                        }}><Ban className="size-4" /> Revoke</button>
                      </>
                    ) : (
                      <button type="button" className={primary} disabled={Boolean(busy)} onClick={() => void mutate({ action: "issue", collaboratorId: partner.id }, "Partnership certificate issued.")}>
                        <FileBadge className="size-4" /> Issue partnership certificate
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--g-muted-ink)]">
                    {partner.referralUrl ? (
                      <button type="button" className={light} onClick={() => void copyLink(partner.referralUrl!, "Referral link")}><Link2 className="size-4" /> Copy referral link</button>
                    ) : (
                      <span>{partner.hasAffiliate ? "Linked affiliate is inactive" : "No affiliate profile linked"}</span>
                    )}
                    {editing !== partner.id && (
                      <button type="button" className="px-2 py-2 text-sm font-semibold text-[var(--g-emerald)] hover:underline" onClick={() => {
                        setNewEmail("");
                        setEditing(partner.id);
                      }}>{partner.hasAffiliate ? "Change affiliate" : "Link affiliate"}</button>
                    )}
                  </div>
                  {editing === partner.id && (
                    <form className="flex flex-wrap items-end gap-2" onSubmit={async (event) => {
                      event.preventDefault();
                      if (await mutate({ action: "set_affiliate", collaboratorId: partner.id, affiliateEmail: newEmail }, "Affiliate link updated.")) setEditing(null);
                    }}>
                      <label className="w-full max-w-64">
                        <span className={fieldLabel}>Affiliate email</span>
                        <input className={field()} type="email" maxLength={254} placeholder="Existing active affiliate" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required />
                      </label>
                      <button type="submit" className={light} disabled={Boolean(busy)}>Save link</button>
                      <button type="button" className={light} onClick={() => setEditing(null)}>Cancel</button>
                      {partner.hasAffiliate && <button type="button" className={light} disabled={Boolean(busy)} onClick={async () => {
                        if (await mutate({ action: "set_affiliate", collaboratorId: partner.id, affiliateEmail: "" }, "Affiliate unlinked.")) setEditing(null);
                      }}>Unlink affiliate</button>}
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {(page > 1 || hasMore) && (
          <nav aria-label="Collaborator pages" className="flex items-center justify-end gap-3 border-t border-black/[0.07] p-4 text-sm">
            {page > 1 && <Link className={light} href={"?page=" + (page - 1)}>Previous</Link>}
            <span>Page {page}</span>
            {hasMore && <Link className={light} href={"?page=" + (page + 1)}>Next</Link>}
          </nav>
        )}
      </Panel>
    </div>
  );
}
