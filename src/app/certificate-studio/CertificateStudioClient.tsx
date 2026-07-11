"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Copy, Check, RefreshCw } from "lucide-react";
import { CERT_TYPES, DEFAULT_NAME, type CertTypeConfig } from "@/lib/certificate-types";

function buildUrl(cfg: CertTypeConfig, values: Record<string, string>) {
  const params = new URLSearchParams();
  params.set("type", cfg.key);
  if (values.name) params.set("name", values.name);
  if (cfg.amountLabel && values.amount) params.set("amount", values.amount);
  if (values.id) params.set("id", values.id);
  for (const f of cfg.fields) {
    if (values[f.id]) params.set(f.id, values[f.id]);
  }
  return `/api/cert?${params.toString()}`;
}

function makeId(cfg: CertTypeConfig) {
  return `${cfg.idPrefix}-${new Date().getFullYear()}-${Math.floor(
    10000 + Math.random() * 89999
  )}`;
}

export function CertificateStudioClient() {
  const types = Object.values(CERT_TYPES);
  const [activeKey, setActiveKey] = useState(types[0].key);
  const cfg = CERT_TYPES[activeKey];

  const [values, setValues] = useState<Record<string, string>>({
    name: DEFAULT_NAME,
  });
  // committed values drive the preview so we don't re-render the image per keystroke
  const [committed, setCommitted] = useState<Record<string, string>>({
    name: DEFAULT_NAME,
  });
  // Generated after mount to keep server and client HTML identical
  const [certId, setCertId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCertId(makeId(CERT_TYPES[activeKey]));
  }, [activeKey]);

  const previewUrl = useMemo(
    () => buildUrl(cfg, { ...committed, id: certId }),
    [cfg, committed, certId]
  );

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const apply = () => setCommitted(values);

  const switchType = (key: string) => {
    setActiveKey(key);
    setCertId(makeId(CERT_TYPES[key]));
  };

  const copyApiUrl = () => {
    const abs = `${window.location.origin}${previewUrl}`;
    navigator.clipboard.writeText(abs);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Type tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Certificate types">
        {types.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeKey === t.key}
            onClick={() => switchType(t.key)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors border ${
              activeKey === t.key
                ? "bg-[#12151a] text-[#c9f24b] border-[#12151a]"
                : "bg-white text-[#3c4350] border-[#dfe4ea] hover:border-[#12151a]/40"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#dfe4ea] bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={previewUrl}
              src={previewUrl}
              alt={`${cfg.name} certificate preview`}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={previewUrl}
              download={`TPP_${cfg.key}_${certId}.png`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#12151a] text-[#c9f24b] hover:bg-[#232a36] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </a>
            <button
              onClick={copyApiUrl}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-[#dfe4ea] bg-white text-[#3c4350] hover:border-[#12151a]/40 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#5a8a00]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy API URL"}
            </button>
            <button
              onClick={() => setCertId(makeId(cfg))}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-[#dfe4ea] bg-white text-[#3c4350] hover:border-[#12151a]/40 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New ID
            </button>
            <span className="font-mono text-xs text-[#7b8494]">{certId}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#dfe4ea] bg-white p-6 h-fit shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#7b8494]">
            Certificate Data
          </h2>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7b8494]">
              Trader Name
            </span>
            <input
              value={values.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              className="rounded-lg border border-[#dfe4ea] bg-[#f7f9fa] px-3.5 py-2.5 text-sm text-[#12151a] outline-none focus:border-[#5a8a00]"
            />
          </label>

          {cfg.amountLabel && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7b8494]">
                {cfg.amountLabel}
              </span>
              <input
                value={values.amount ?? cfg.defaultAmount ?? ""}
                onChange={(e) => set("amount", e.target.value)}
                placeholder={cfg.defaultAmount}
                className="rounded-lg border border-[#dfe4ea] bg-[#f7f9fa] px-3.5 py-2.5 text-sm text-[#12151a] outline-none focus:border-[#5a8a00]"
              />
            </label>
          )}

          {cfg.fields.map((f) => (
            <label key={f.id} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7b8494]">
                {f.label}
              </span>
              <input
                value={values[f.id] ?? f.default}
                onChange={(e) => set(f.id, e.target.value)}
                placeholder={f.default}
                className="rounded-lg border border-[#dfe4ea] bg-[#f7f9fa] px-3.5 py-2.5 text-sm text-[#12151a] outline-none focus:border-[#5a8a00]"
              />
            </label>
          ))}

          <button
            onClick={apply}
            className="mt-2 rounded-xl bg-[#c9f24b] text-[#12151a] px-5 py-3 text-sm font-bold hover:bg-[#b9e23b] transition-colors"
          >
            Update Preview
          </button>

          <p className="text-xs leading-relaxed text-[#7b8494]">
            Har trader ke liye programmatically allot karne ke liye yehi API URL
            server-side se call karo — query params me trader ka data pass hota hai.
          </p>
        </div>
      </div>
    </div>
  );
}
