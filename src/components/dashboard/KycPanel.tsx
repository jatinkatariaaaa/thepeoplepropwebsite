"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Camera, Clock, FileImage, ShieldCheck, TriangleAlert, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Chip, Notice, Panel, PanelHead, SelectChevron, btn, field, fieldLabel, selectField, type Tone } from "./glass";

/**
 * Identity verification. Images go straight from the browser into the private
 * `kyc-documents` bucket under the trader's own folder; the API stores only
 * the paths, and admins see them through short-lived signed links.
 */

type Slot = "front" | "back" | "selfie";
type LastDoc = { status: string; rejection_reason: string | null; created_at: string } | null;

const SLOTS: { key: Slot; label: string; hint: string; icon: typeof FileImage; optional?: boolean }[] = [
  { key: "front", label: "Front of document", hint: "All four corners visible, no glare", icon: FileImage },
  { key: "back", label: "Back of document", hint: "Not needed for a passport", icon: FileImage, optional: true },
  { key: "selfie", label: "Selfie holding the document", hint: "Your face and the document both readable", icon: Camera },
];

const STATUS: Record<string, { label: string; tone: Tone; text: string }> = {
  approved: { label: "Verified", tone: "emerald", text: "Your identity is verified. Payouts can be sent to you." },
  pending: { label: "Under review", tone: "amber", text: "We are checking your documents. This usually takes less than one business day." },
  rejected: { label: "Action needed", tone: "red", text: "We could not verify the documents you sent. Please submit them again." },
};

const MAX_BYTES = 8 * 1024 * 1024;

export function KycPanel({ status, onSubmitted }: { status: string; onSubmitted: () => void }) {
  const [doc, setDoc] = useState({ documentType: "national_id", documentNumber: "", country: "" });
  const [files, setFiles] = useState<Partial<Record<Slot, File>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<LastDoc>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from("kyc_documents").select("status, rejection_reason, created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setLast((data as LastDoc) ?? null);
    })();
  }, [status]);

  const state = STATUS[status] ?? { label: "Not verified", tone: "neutral" as Tone, text: "Verify your identity once, before your first payout. It takes about two minutes." };
  const canSubmit = !status || status === "none" || status === "rejected" || status === "unverified";

  const pick = (slot: Slot, file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (file.size > MAX_BYTES) return setError("Each file must be 8 MB or smaller.");
    setFiles((f) => ({ ...f, [slot]: file }));
  };

  const submit = async () => {
    setError(null);
    if (doc.documentNumber.trim().length < 4 || doc.country.trim().length < 2) return setError("Enter the document number and the issuing country.");
    if (!files.front || !files.selfie) return setError("Add the front of your document and a selfie holding it.");
    if (doc.documentType !== "passport" && !files.back) return setError("Add the back of your document as well.");

    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Please sign in again.");
      const uid = session.user.id;
      const paths: Partial<Record<Slot, string>> = {};
      for (const slot of Object.keys(files) as Slot[]) {
        const file = files[slot]!;
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
        const path = `${uid}/${Date.now()}-${slot}.${ext}`;
        const { error: upErr } = await supabase.storage.from("kyc-documents").upload(path, file, { contentType: file.type || undefined, upsert: false });
        if (upErr) throw new Error(`Upload failed (${slot}): ${upErr.message}`);
        paths[slot] = path;
      }
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "submit_kyc", ...doc, frontPath: paths.front, backPath: paths.back ?? null, selfiePath: paths.selfie }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your documents.");
      setFiles({});
      onSubmitted();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <Panel>
      <PanelHead title="Identity verification" sub="Required once, before your first payout is sent." icon={ShieldCheck}>
        <Chip tone={state.tone}>{state.label}</Chip>
      </PanelHead>
      <div className="grid gap-5 p-5 sm:p-6 lg:p-8">
        <Notice tone={state.tone === "neutral" ? "neutral" : state.tone} icon={status === "approved" ? BadgeCheck : status === "pending" ? Clock : status === "rejected" ? TriangleAlert : ShieldCheck}>
          {state.text}
          {status === "rejected" && last?.rejection_reason ? <span className="mt-1 block font-semibold">Reason: {last.rejection_reason}</span> : null}
        </Notice>

        {canSubmit && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label>
                <span className={fieldLabel}>Document</span>
                <span className="relative block">
                  <select value={doc.documentType} onChange={(e) => setDoc({ ...doc, documentType: e.target.value })} className={cn(field(), selectField)}>
                    <option value="national_id">National ID card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving licence</option>
                  </select>
                  <SelectChevron />
                </span>
              </label>
              <label>
                <span className={fieldLabel}>Document number</span>
                <input value={doc.documentNumber} onChange={(e) => setDoc({ ...doc, documentNumber: e.target.value })} className={field()} autoComplete="off" />
              </label>
              <label>
                <span className={fieldLabel}>Issuing country</span>
                <input value={doc.country} onChange={(e) => setDoc({ ...doc, country: e.target.value })} className={field()} autoComplete="country-name" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {SLOTS.filter((s) => !(s.key === "back" && doc.documentType === "passport")).map((s) => {
                const file = files[s.key];
                return (
                  <label key={s.key} className={cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed px-4 py-6 text-center transition-colors", file ? "border-[var(--g-emerald)]/50 bg-[var(--g-emerald)]/[0.06]" : "border-black/15 bg-white/40 hover:bg-white/70")}>
                    <input type="file" accept="image/*,application/pdf" capture={s.key === "selfie" ? "user" : undefined} className="sr-only" onChange={(e) => pick(s.key, e.target.files?.[0])} />
                    <span className={cn("grid h-10 w-10 place-items-center rounded-full", file ? "bg-[var(--g-emerald)] text-white" : "bg-black/[0.05] text-[var(--g-muted-ink)]")}>{file ? <BadgeCheck className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}</span>
                    <span className="text-[13.5px] font-semibold text-[var(--g-ink)]">
                      {s.label}
                      {s.optional ? <span className="font-normal text-[var(--g-muted-ink)]"> (if any)</span> : null}
                    </span>
                    <span className="max-w-full truncate text-[12px] text-[var(--g-muted-ink)]">{file ? file.name : s.hint}</span>
                  </label>
                );
              })}
            </div>

            {error ? <Notice tone="red">{error}</Notice> : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12.5px] text-[var(--g-muted-ink)]">Files are stored privately and are only seen by our verification team. JPG, PNG, HEIC or PDF, up to 8 MB each.</p>
              <button type="button" onClick={() => void submit()} disabled={busy} className={cn(btn.ink, btn.sm)}>
                <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Submit for review"}
              </button>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
