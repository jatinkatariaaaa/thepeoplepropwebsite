"use client";

import { useCallback, useEffect, useState } from "react";
import { Panel, PanelHead, field, fieldLabel, btn } from "./glass";

const networks = { usdt_trc20:"USDT (TRC20)", usdt_erc20:"USDT (ERC20)", usdt_bep20:"USDT (BEP20)" };
type Withdrawal = {id:string; amount:number; method:keyof typeof networks; status:string; created_at:string; payment_reference:string|null; rejection_reason:string|null};
type Wallet = {available:number; active:boolean; requests:Withdrawal[]};
const money = (amount:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(amount);

export function AffiliateWithdrawal() {
  const [wallet,setWallet] = useState<Wallet|null>(null);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [key,setKey] = useState("");
  const [amount,setAmount] = useState("");
  const [method,setMethod] = useState("usdt_trc20");
  const [destination,setDestination] = useState("");
  const load = useCallback(async () => {
    const res = await fetch("/api/affiliate-withdrawals",{cache:"no-store"});
    if (res.status===403) {setWallet(null);return;}
    const data=await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load withdrawals.");
    setWallet(data);
  },[]);
  useEffect(() => {void load().catch(e=>setError(e.message));},[load]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    const id = key || crypto.randomUUID(); setKey(id);
    try {
      const res=await fetch("/api/affiliate-withdrawals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,amount,method,destination})});
      const data=await res.json(); if (!res.ok) throw new Error(data.error || "Could not submit withdrawal.");
      setAmount(""); setDestination(""); setKey(""); await load();
    } catch (e) {setError(e instanceof Error?e.message:"Could not submit withdrawal.");} finally {setBusy(false);}
  }
  if (!wallet && !error) return null;
  return <Panel><PanelHead title="Commission withdrawals" sub="Request payment from your available affiliate balance."/>
    <div className="space-y-4 p-5">{error && <p role="alert">{error}</p>}
      {wallet && <><p>Available to request <strong>{money(wallet.available)}</strong></p>
      {wallet.active && wallet.available>0 && !wallet.requests.some(r=>r.status==="pending") &&
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><label className={fieldLabel}>Amount (USD)<input className={field()} type="number" min="0.01" max={wallet.available} step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)}/></label>
          <label className={fieldLabel}>Payment network<select className={field()} value={method} onChange={e=>setMethod(e.target.value)}>{Object.entries(networks).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
          <label className={fieldLabel+" sm:col-span-2"}>Destination wallet<input className={field()} required maxLength={80} value={destination} onChange={e=>setDestination(e.target.value)}/></label>
          <button className={btn.ink} disabled={busy}>{busy?"Submitting…":"Request commission payout"}</button>
        </form>}
      {wallet.requests.map(r=><div key={r.id} className="border-t py-2 text-sm"><strong>{money(r.amount)}</strong> · {networks[r.method]} · {r.status} · {new Date(r.created_at).toLocaleDateString()}
        {r.payment_reference && <p className="break-all">Payment reference {r.payment_reference}</p>}{r.rejection_reason && <p>Reason for rejection: {r.rejection_reason}</p>}</div>)}</>}
    </div></Panel>;
}
