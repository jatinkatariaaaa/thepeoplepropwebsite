"use client";

import { useCallback, useEffect, useState } from "react";

type Item={id:string;user_id:string;amount:number;destination:string;method:string;created_at:string};
export function AffiliateWithdrawalQueue() {
  const [items,setItems]=useState<Item[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const load=useCallback(async()=>{
    const response=await fetch("/api/admin/affiliate-withdrawals",{cache:"no-store"});
    const data=await response.json(); if(!response.ok)throw new Error(data.error); setItems(data.requests);
  },[]);
  useEffect(()=>{void load().catch(e=>setError(e.message));},[load]);
  async function review(id:string,status:string) {
    setBusy(true);setError("");
    try {
      const result=await fetch("/api/admin/affiliate-withdrawals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,note:notes[id]})});
      const data=await result.json();if(!result.ok) throw new Error(data.error);await load();
    } catch(e){setError(e instanceof Error?e.message:"Could not review request.");}finally{setBusy(false);}
  }
  return <section className="mb-6 space-y-4 rounded-xl border bg-white p-5"><h2 className="font-semibold">Affiliate withdrawal requests</h2>
    {error && <p role="alert">{error}</p>}{!items.length&&!error&&<p>No pending requests.</p>}
    {items.map(item=><article key={item.id} className="space-y-2 border-t pt-3"><p><strong>${Number(item.amount).toFixed(2)}</strong> · {item.method.replace("usdt_","USDT ").toUpperCase()} · {new Date(item.created_at).toLocaleDateString()}</p>
      <p className="break-all">Affiliate {item.user_id}</p><p className="break-all">Destination {item.destination}</p>
      <label className="block text-sm">Transfer reference for a completed payment, or reason for rejection
        <input className="block w-full rounded-lg border p-2" maxLength={250} value={notes[item.id]||""} onChange={e=>setNotes({...notes,[item.id]:e.target.value})}/></label>
      <div className="flex gap-3"><button disabled={busy||(notes[item.id]?.trim().length||0)<3} className="rounded border px-3 py-2" onClick={()=>review(item.id,"paid")}>Record completed payment</button>
        <button disabled={busy||(notes[item.id]?.trim().length||0)<3} className="rounded border px-3 py-2" onClick={()=>review(item.id,"rejected")}>Reject and release balance</button></div>
    </article>)}</section>;
}
