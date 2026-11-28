"use client";

import Link from "@/components/IntentLink";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { KeyRound, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { btn, Chip, Empty, field, fieldLabel, PageTitle, Panel, PanelHead } from "@/components/dashboard/glass";
import { formatPercent, percentToBps, STAFF_RIGHTS, type StaffMember, type StaffPermission } from "@/lib/staff-access";
import { cn } from "@/lib/utils";

const rights = Object.entries(STAFF_RIGHTS) as [StaffPermission, string][];
const smallButton = cn(btn.light, btn.sm);

export function StaffAccessClient({ members, page, hasMore }: { members: StaffMember[]; page: number; hasMore: boolean }) {
  const router = useRouter();
  const editor = useRef<HTMLFormElement>(null);
  const [member, setMember] = useState<StaffMember | null>(null);
  const [email, setEmail] = useState("");
  const [rank, setRank] = useState("");
  const [share, setShare] = useState("0");
  const [permissions, setPermissions] = useState<StaffPermission[]>([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const commissionBps = percentToBps(share);

  function load(person: StaffMember | null) {
    setMember(person);
    setEmail(person?.email ?? "");
    setRank(person?.rank ?? "");
    setShare(formatPercent(person?.commission_bps ?? 0));
    setPermissions(person?.permissions ?? []);
    setActive(person?.active ?? true);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (commissionBps === null) {
      setError("Enter a sale share from 0 to 100 with up to two decimal places.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const identity = member ? { userId: member.user_id, updatedAt: member.updated_at } : { email };
      const response = await fetch("/api/admin/staff-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...identity, rank, commissionBps, permissions, active }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) router.refresh();
        throw new Error(result.error || "Staff access could not be saved.");
      }
      toast.success(member ? "Staff access updated." : "Staff access granted.");
      load(null);
      if (page !== 1) router.replace("/admin/staff-access");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Staff access could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle lead="Staff access" lede="Set each employee or partner's rank, partner desk permissions and share of paid sales." />
      <Panel>
        <PanelHead icon={KeyRound} title={member ? "Edit staff access" : "Grant staff access"} />
        <form ref={editor} onSubmit={save} className="scroll-mt-20 space-y-6 p-5 sm:p-6">
          <fieldset disabled={saving} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel}>{member ? "Staff account" : "Website sign-in email"}</span>
                <input className={field()} type={member ? "text" : "email"} required={!member} disabled={Boolean(member)}
                  value={member ? (member.email || member.user_id) : email}
                  onChange={e => setEmail(e.target.value)} maxLength={254} autoComplete="off" />
              </label>
              <label>
                <span className={fieldLabel}>Rank or job title</span>
                <input className={field()} placeholder="e.g. Regional partner" name="rank" value={rank}
                  onChange={e => setRank(e.target.value)} maxLength={60} required />
              </label>
            </div>
            <fieldset>
              <legend className={fieldLabel}>Partner desk permissions</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {rights.map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 p-3 text-sm">
                    <input type="checkbox" className="size-4 shrink-0 accent-emerald-700" checked={permissions.includes(key)}
                      onChange={e => setPermissions(e.target.checked ? [...permissions, key] : permissions.filter(item => item !== key))} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel}>Partner commission pool (%)</span>
                <input className={field()} type="number" inputMode="decimal" min="0" max="100" step="0.01" value={share}
                  onChange={e => setShare(e.target.value)} required />
              </label>
              <p className="self-end text-sm leading-relaxed text-[var(--g-muted-ink)]" aria-live="polite">
                {commissionBps !== null && <>Firm share per eligible sale <strong>{formatPercent(10000 - commissionBps)}%</strong>. </>}
                Promoter commissions come from the partner pool.
              </p>
            </div>
            {member && <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 accent-emerald-700" checked={active} onChange={e => setActive(e.target.checked)} />
              <span><strong>Active staff access</strong><span className="mt-1 block text-[var(--g-muted-ink)]">Switch off to suspend this staff grant and future sales commissions from its links.</span></span>
            </label>}
          </fieldset>
          {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={btn.ink} disabled={saving}>{saving ? "Saving…" : member ? "Save changes" : "Grant access"}</button>
            {member && <button type="button" className={smallButton} disabled={saving} onClick={() => load(null)}>Cancel</button>}
          </div>
        </form>
      </Panel>
      <Panel className="mt-6">
        <PanelHead title="Staff directory" icon={Users} />
        {members.length === 0 ? <Empty title="No staff on this page" /> : (
          <ul className="divide-y divide-black/[0.07]">
            {members.map(person => (
              <li key={person.user_id} className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-all font-semibold">{person.name || person.email || person.user_id}</h3>
                    <Chip tone={person.active ? "emerald" : "neutral"}>{person.active ? "Active" : "Suspended"}</Chip>
                  </div>
                  {person.name && person.email && <p className="mt-1 break-all text-xs text-[var(--g-muted-ink)]">{person.email}</p>}
                  <p className="mt-2 text-sm">{person.rank} · {formatPercent(person.commission_bps)}% pool · {person.permissions.length} permissions</p>
                </div>
                <button className={smallButton} type="button" disabled={saving}
                  onClick={() => {
                    load(person);
                    editor.current?.scrollIntoView({ block: "start" });
                    editor.current?.querySelector<HTMLInputElement>("input[name=rank]")?.focus({ preventScroll: true });
                  }} aria-label={"Edit access for " + (person.email || person.name || person.user_id)}>
                  <Pencil className="size-4" /> Edit access
                </button>
              </li>
            ))}
          </ul>
        )}
        {(page > 1 || hasMore) && <nav aria-label="Staff directory pages" className="flex items-center justify-end gap-3 border-t border-black/10 p-4 text-sm">
          {page > 1 && <Link href={"?page=" + (page - 1)} className={smallButton}>Previous</Link>}
          <span>Page {page}</span>
          {hasMore && <Link href={"?page=" + (page + 1)} className={smallButton}>Next</Link>}
        </nav>}
      </Panel>
    </div>
  );
}
