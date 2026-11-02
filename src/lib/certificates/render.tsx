import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { P, TP, VIEWBOX } from "@/components/v2/glass/logo";
import { encodeQr, qrPath } from "./qr";
import { SITE_URL, verifyUrl, type Certificate, type CertificateKind } from "./types";

/*
 * Certificate artwork, drawn with next/og (Satori): a path-traced plate on the
 * right, the type on the dark left half, a real QR code to the public check at
 * /verify/<id>. Satori only lays out flexbox and inline styles, and only reads
 * TTF fonts and PNG/JPEG images, so the assets live in assets/certificates.
 */

export const CERTIFICATE_WIDTH = 1600;
export const CERTIFICATE_HEIGHT = 1000;

const ASSETS = join(process.cwd(), "assets", "certificates");
const INK = "#0e1110";
const LIME = "#cbfb45";
const FADE = "#6c7874";
const SHADE_TEXT = "linear-gradient(152deg, #ffffff 32%, #b4bfbb 68%, #76827e 100%)";
const LIME_TEXT = "linear-gradient(135deg, #f1ffc9 6%, #cbfb45 50%, #97c823 100%)";

const FONT_FILES = [
  ["Inter-400-latin.ttf", 400],
  ["Inter-500-latin.ttf", 500],
  ["Inter-600-latin.ttf", 600],
  ["Inter-700-latin.ttf", 700],
  ["Inter-500-latin-ext.ttf", 500],
  ["Inter-600-latin-ext.ttf", 600],
  ["Inter-700-latin-ext.ttf", 700],
  ["Inter-600-cyrillic.ttf", 600],
  ["Inter-700-cyrillic.ttf", 700],
] as const;

type Font = { name: string; data: Buffer; weight: 400 | 500 | 600 | 700; style: "normal" };

let fonts: Promise<Font[]> | undefined;
const plates = new Map<CertificateKind, Promise<string>>();

function loadFonts() {
  fonts ??= Promise.all(
    FONT_FILES.map(async ([file, weight]) => ({ name: "Inter", data: await readFile(join(ASSETS, "fonts", file)), weight, style: "normal" as const })),
  );
  return fonts;
}

function loadPlate(kind: CertificateKind) {
  if (!plates.has(kind)) {
    plates.set(kind, readFile(join(ASSETS, `plate-${kind}.jpg`)).then((buf) => `data:image/jpeg;base64,${buf.toString("base64")}`));
  }
  return plates.get(kind) as Promise<string>;
}

/** Font size that keeps `text` within `width`, using rough Inter advance widths (in em). */
function fitSize(text: string, max: number, width: number) {
  let em = 0;
  for (const ch of text) {
    if (/[0-9$€£₹]/.test(ch)) em += 0.62;
    else if (/[,.·'’ ]/.test(ch)) em += 0.3;
    else if (/[A-ZМШЖЩ]/.test(ch)) em += 0.68;
    else em += 0.56;
  }
  return Math.min(max, Math.floor(width / Math.max(em, 1)));
}

const COPY: Record<
  CertificateKind,
  { eyebrow: (c: Certificate) => string; lead: string; fade: string; statement: (c: Certificate) => string; figureLabel: string; figure: (c: Certificate) => string }
> = {
  funded: {
    eyebrow: (c) => (c.status === "funded" ? "Funded trader" : "Evaluation passed"),
    lead: "Certificate",
    fade: "of Funding",
    statement: () => "for successfully passing The People Prop evaluation and meeting all required trading objectives.",
    figureLabel: "Funded account",
    figure: (c) => c.accountSize,
  },
  payout: {
    eyebrow: () => "Payout certificate",
    lead: "Payout",
    fade: "Certificate",
    statement: () => "for a profit payout from their funded account at The People Prop.",
    figureLabel: "Amount paid",
    figure: (c) => c.amount ?? "",
  },
  highest: {
    eyebrow: (c) => `Highest payout · ${c.period}`,
    lead: "Highest",
    fade: "Payout",
    statement: (c) => `for the largest single payout The People Prop made in ${c.period}.`,
    figureLabel: "Amount paid",
    figure: (c) => c.amount ?? "",
  },
};

function details(c: Certificate): { label: string; value: string }[] {
  const rows =
    c.kind === "funded"
      ? [
          { label: "Issued on", value: c.issuedOn },
          { label: "Status", value: c.status === "funded" ? "Funded" : "Passed" },
          { label: "Program", value: c.program ?? "" },
        ]
      : c.kind === "payout"
        ? [
            { label: "Paid on", value: c.issuedOn },
            { label: "Account", value: c.accountSize },
            { label: "Program", value: c.program ?? "" },
          ]
        : [
            { label: "Month", value: c.period ?? "" },
            { label: "Paid on", value: c.issuedOn },
            { label: "Account", value: c.accountSize },
          ];
  return rows.filter((r) => r.value);
}

function Wordmark({ height }: { height: number }) {
  const width = Math.round(height * 2.691);
  return (
    <svg width={width} height={height} viewBox={VIEWBOX}>
      <path d={TP} fill="#ffffff" />
      <path d={P} fill={LIME} />
    </svg>
  );
}

/** QR code on a white rounded tile, with the standard four-module quiet zone. */
function Qr({ url, size }: { url: string; size: number }) {
  const matrix = encodeQr(url);
  const modules = matrix.length + 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${modules} ${modules}`} shapeRendering="crispEdges">
      <rect width={modules} height={modules} rx={modules * 0.08} fill="#ffffff" />
      <path d={qrPath(matrix)} fill={INK} />
    </svg>
  );
}

function CertificateArt({ c, plate }: { c: Certificate; plate: string }) {
  const copy = COPY[c.kind];
  const figure = copy.figure(c);
  const hero = c.kind !== "funded";
  const titleSize = hero ? 74 : 88;
  const figureSize = fitSize(figure, hero ? 112 : 88, 540);
  const nameSize = fitSize(c.traderName, 60, 740);
  const host = new URL(SITE_URL).host;

  return (
    <div style={{ width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, display: "flex", position: "relative", backgroundColor: "#060a09", fontFamily: "Inter", color: "#ffffff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img src={plate} width={CERTIFICATE_WIDTH} height={CERTIFICATE_HEIGHT} style={{ position: "absolute", left: 0, top: 0 }} alt="" />
      <div style={{ position: "absolute", left: 0, top: 0, width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, backgroundImage: "linear-gradient(90deg, rgba(4,8,7,0.95) 0%, rgba(4,8,7,0.88) 32%, rgba(4,8,7,0.5) 52%, rgba(4,8,7,0) 66%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, backgroundImage: "linear-gradient(180deg, rgba(4,8,7,0.35) 0%, rgba(4,8,7,0) 18%, rgba(4,8,7,0) 64%, rgba(4,8,7,0.6) 100%)" }} />
      <div style={{ position: "absolute", left: 28, top: 28, width: CERTIFICATE_WIDTH - 56, height: CERTIFICATE_HEIGHT - 56, borderRadius: 30, border: "1.5px solid rgba(255,255,255,0.14)" }} />

      {/* header */}
      <div style={{ position: "absolute", left: 96, top: 74, width: CERTIFICATE_WIDTH - 192, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Wordmark height={34} />
          <div style={{ width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.25)", marginLeft: 20, marginRight: 20 }} />
          <div style={{ fontSize: 19, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: -0.2 }}>The People Prop</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", letterSpacing: 2.2, textTransform: "uppercase", marginRight: 12 }}>Certificate No.</div>
          <div style={{ fontSize: 19, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: 0.6 }}>{c.number}</div>
        </div>
      </div>

      {/* type column */}
      <div style={{ position: "absolute", left: 96, top: 170, width: 780, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", height: 40, paddingLeft: 16, paddingRight: 20, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: LIME, marginRight: 11 }} />
          <div style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.88)", letterSpacing: -0.1 }}>{copy.eyebrow(c)}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 30, fontSize: titleSize, fontWeight: 600, letterSpacing: -titleSize * 0.04, lineHeight: 1.0 }}>
          <div style={{ backgroundImage: SHADE_TEXT, backgroundClip: "text", color: "transparent", paddingBottom: 4 }}>{copy.lead}</div>
          <div style={{ color: FADE }}>{copy.fade}</div>
        </div>

        <div style={{ marginTop: hero ? 30 : 38, fontSize: 14, fontWeight: 500, letterSpacing: 2.6, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Proudly presented to</div>
        <div style={{ marginTop: 8, fontSize: nameSize, fontWeight: 600, letterSpacing: -nameSize * 0.03, lineHeight: 1.1, color: "#ffffff" }}>{c.traderName}</div>
        <div style={{ marginTop: 14, maxWidth: 620, fontSize: 19, fontWeight: 400, lineHeight: 1.5, color: "rgba(255,255,255,0.62)" }}>{copy.statement(c)}</div>
      </div>

      {/* figure, details and verification */}
      <div style={{ position: "absolute", left: 96, bottom: 78, width: 744, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 540 }}>
          <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 2.6, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{copy.figureLabel}</div>
          <div style={{ marginTop: 4, fontSize: figureSize, fontWeight: 700, letterSpacing: -figureSize * 0.035, lineHeight: 1.05, backgroundImage: LIME_TEXT, backgroundClip: "text", color: "transparent", paddingBottom: 6 }}>{figure}</div>
          <div style={{ marginTop: 14, width: 540, height: 1, backgroundColor: "rgba(255,255,255,0.14)" }} />
          <div style={{ display: "flex", marginTop: 16 }}>
            {details(c).map((row) => (
              <div key={row.label} style={{ display: "flex", flexDirection: "column", marginRight: 40 }}>
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2.2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{row.label}</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: -0.2 }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Qr url={verifyUrl(c.id)} size={156} />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: "#ffffff", letterSpacing: -0.1 }}>Scan to verify</div>
          <div style={{ marginTop: 3, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{host}</div>
        </div>
      </div>
    </div>
  );
}

/** PNG response for a certificate. */
export async function renderCertificate(c: Certificate) {
  const [fontList, plate] = await Promise.all([loadFonts(), loadPlate(c.kind)]);
  return new ImageResponse(<CertificateArt c={c} plate={plate} />, {
    width: CERTIFICATE_WIDTH,
    height: CERTIFICATE_HEIGHT,
    fonts: fontList,
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
