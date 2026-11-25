import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { P, TP, VIEWBOX } from "@/components/v2/glass/logo";
import { encodeQr, qrPath } from "./qr";
import { SITE_URL, verifyUrl, type Certificate, type CertificateKind } from "./types";

/*
 * Certificate artwork, drawn with next/og (Satori): a path-traced 3D plate on the right
 * (a different object for each type), the type on the dark left half with a fine
 * security print, and a real QR code to the public check at /verify/<id>. Satori lays
 * out flexbox and inline styles only and reads TTF fonts and PNG/JPEG images, so the
 * assets live in assets/certificates.
 */

export const CERTIFICATE_WIDTH = 1600;
export const CERTIFICATE_HEIGHT = 1000;

const ASSETS = join(process.cwd(), "assets", "certificates");
const LIME = "#cbfb45";
const SILVER = "linear-gradient(160deg, #ffffff 28%, #c9d2ce 68%, #8f9b97 100%)";
const VOLT = "linear-gradient(135deg, #f4ffd6 0%, #cbfb45 46%, #9bcb26 100%)";
const MUTED = "rgba(255,255,255,0.5)";
const FADE = "#6f7c77";

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

/** One 3D plate per certificate type: bars, rosette, trophy, podium, stars. */
const PLATE: Record<CertificateKind, string> = {
  phase_pass: "plate-phase.jpg",
  funded: "plate-funded.jpg",
  payout: "plate-payout.jpg",
  highest_payout: "plate-highest.jpg",
  award: "plate-award.jpg",
};

function loadFonts() {
  fonts ??= Promise.all(FONT_FILES.map(async ([file, weight]) => ({ name: "Inter", data: await readFile(join(ASSETS, "fonts", file)), weight, style: "normal" as const })));
  return fonts;
}

function loadPlate(kind: CertificateKind) {
  if (!plates.has(kind)) plates.set(kind, readFile(join(ASSETS, PLATE[kind])).then((buf) => `data:image/jpeg;base64,${buf.toString("base64")}`));
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

/** Fine wave lines, like the guilloche on printed certificates. */
const WAVES = (() => {
  const out: string[] = [];
  for (let i = 0; i < 30; i++) {
    const amp = 22 + (i % 5) * 7;
    const freq = 0.0038 + (i % 3) * 0.0007;
    const base = 70 + i * 30;
    const phase = i * 0.47;
    let d = "";
    for (let x = -20; x <= CERTIFICATE_WIDTH + 20; x += 16) {
      const y = base + amp * Math.sin(x * freq + phase) + 10 * Math.sin(x * freq * 2.6 + phase * 1.8);
      d += `${x === -20 ? "M" : "L"}${x},${y.toFixed(1)} `;
    }
    out.push(d);
  }
  return out;
})();

type Copy = {
  eyebrow: string;
  lead: string;
  fade: string | null;
  statement: string;
  figureLabel: string | null;
  figure: string | null;
  details: { label: string; value: string | null }[];
};

/** Keeps names like "1-Step" on one line: Satori breaks lines at hyphens. */
const keep = (text: string | null) => (text ? text.replace(/-/g, "\u2011") : text);
/** Keeps "The People Prop" together at the end of a sentence. */
const tidy = (text: string) => text.replace(/The People Prop/g, "The\u00a0People\u00a0Prop");

function copyFor(c: Certificate): Copy {
  const program = keep(c.program);
  switch (c.kind) {
    case "phase_pass":
      return {
        eyebrow: ["Evaluation milestone", program].filter(Boolean).join(" · "),
        lead: c.phase ?? "Evaluation",
        fade: "Passed",
        statement: `for passing ${c.phase ?? "the evaluation"}${program ? ` of the ${program}` : ""}${c.accountSize ? ` on a ${c.accountSize} account` : ""}, reaching the profit target within every risk rule.`,
        figureLabel: c.accountSize ? "Account size" : null,
        figure: c.accountSize,
        details: [
          { label: "Passed on", value: c.issuedOn },
          { label: "Program", value: program },
        ],
      };
    case "funded":
      return {
        eyebrow: ["Funded trader", program].filter(Boolean).join(" · "),
        lead: "Certificate",
        fade: "of Funding",
        statement:
          c.program === "Instant Funded"
            ? `for receiving ${c.accountSize ? `a ${c.accountSize}` : "an"} Instant Funded account at The People Prop.`
            : `for earning ${c.accountSize ? `a ${c.accountSize}` : "a"} funded account at The People Prop by completing the ${program ?? "evaluation"}.`,
        figureLabel: c.accountSize ? "Funded account" : null,
        figure: c.accountSize,
        details: [
          { label: "Funded on", value: c.issuedOn },
          { label: "Program", value: program },
        ],
      };
    case "payout":
      return {
        eyebrow: ["Verified payout", program].filter(Boolean).join(" · "),
        lead: "Payout",
        fade: "Certificate",
        statement: `for a profit payout from their ${c.accountSize ? `${c.accountSize} ` : ""}funded account at The People Prop.`,
        figureLabel: "Amount paid",
        figure: c.amount,
        details: [
          { label: "Paid on", value: c.issuedOn },
          { label: "Account", value: c.accountSize },
        ],
      };
    case "highest_payout":
      return {
        eyebrow: `Highest payout · ${c.period ?? ""}`,
        lead: "Highest",
        fade: "Payout",
        statement: `for the largest single payout The People Prop made in ${c.period ?? "the period"}.`,
        figureLabel: "Amount paid",
        figure: c.amount,
        details: [
          { label: "Paid on", value: c.issuedOn },
          { label: "Account", value: c.accountSize },
        ],
      };
    case "award": {
      const title = c.title || "Award";
      const named = /award$/i.test(title.trim());
      return {
        eyebrow: ["Award", program].filter(Boolean).join(" · "),
        lead: title,
        fade: named ? null : "Award",
        statement: c.statement || "in recognition of outstanding trading at The People Prop.",
        figureLabel: c.highlightValue ? c.highlightLabel || "Highlight" : null,
        figure: c.highlightValue,
        details: [
          { label: "Awarded on", value: c.issuedOn },
          { label: "Program", value: program },
        ],
      };
    }
  }
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
      <path d={qrPath(matrix)} fill="#0b0f0e" />
    </svg>
  );
}

function Fill({ style }: { style: Record<string, string | number> }) {
  return <div style={{ position: "absolute", left: 0, top: 0, width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, display: "flex", ...style }} />;
}

/** A diagonal band across the card: REVOKED for withdrawn certificates, PREVIEW for drafts. */
function Band({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 2100, height: 150, transform: "rotate(-18deg)", backgroundColor: color, color: "#ffffff", fontSize: 92, fontWeight: 700, letterSpacing: 26, opacity: 0.9 }}>{text}</div>
    </div>
  );
}

/** Small L-shaped accents on the frame corners. */
function Corners() {
  const arm = 34;
  const at = 28;
  const line = (style: Record<string, number | string>) => <div style={{ position: "absolute", display: "flex", backgroundColor: LIME, opacity: 0.85, ...style }} />;
  return (
    <>
      {line({ left: at, top: at + 14, width: 2, height: arm })}
      {line({ left: at + 14, top: at, width: arm, height: 2 })}
      {line({ right: at, top: at + 14, width: 2, height: arm })}
      {line({ right: at + 14, top: at, width: arm, height: 2 })}
      {line({ left: at, bottom: at + 14, width: 2, height: arm })}
      {line({ left: at + 14, bottom: at, width: arm, height: 2 })}
      {line({ right: at, bottom: at + 14, width: 2, height: arm })}
      {line({ right: at + 14, bottom: at, width: arm, height: 2 })}
    </>
  );
}

function CertificateArt({ c, plate, preview }: { c: Certificate; plate: string; preview: boolean }) {
  const base = copyFor(c);
  const copy = { ...base, statement: tidy(base.statement) };
  const award = c.kind === "award";
  const titleSize = award ? fitSize(copy.lead, 84, 760) : 88;
  const nameSize = fitSize(c.traderName, 60, 760);
  const figureSize = copy.figure ? fitSize(copy.figure, 104, 500) : 0;
  const host = new URL(SITE_URL).host;
  const details = copy.details.filter((d) => d.value);

  return (
    <div style={{ width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, display: "flex", position: "relative", backgroundColor: "#060a09", fontFamily: "Inter", color: "#ffffff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img src={plate} width={CERTIFICATE_WIDTH} height={CERTIFICATE_HEIGHT} style={{ position: "absolute", left: 0, top: 0 }} alt="" />
      <Fill style={{ backgroundImage: "linear-gradient(90deg, rgba(4,8,7,0.96) 0%, rgba(4,8,7,0.9) 34%, rgba(4,8,7,0.52) 53%, rgba(4,8,7,0) 67%)" }} />
      <Fill style={{ backgroundImage: "linear-gradient(180deg, rgba(4,8,7,0.4) 0%, rgba(4,8,7,0) 18%, rgba(4,8,7,0) 62%, rgba(4,8,7,0.66) 100%)" }} />
      {/* fine security print over the type side */}
      <svg width={900} height={CERTIFICATE_HEIGHT} viewBox={`0 0 900 ${CERTIFICATE_HEIGHT}`} style={{ position: "absolute", left: 0, top: 0 }}>
        {WAVES.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#cbfb45" strokeOpacity={i % 3 === 0 ? 0.05 : 0.028} strokeWidth={1.1} />
        ))}
      </svg>
      <Fill style={{ backgroundImage: "radial-gradient(circle at 6% 4%, rgba(29,102,86,0.4) 0%, rgba(29,102,86,0) 40%)" }} />

      {/* frame */}
      <div style={{ position: "absolute", left: 28, top: 28, width: CERTIFICATE_WIDTH - 56, height: CERTIFICATE_HEIGHT - 56, borderRadius: 30, border: "1.5px solid rgba(255,255,255,0.15)", display: "flex" }} />
      <Corners />

      {/* header */}
      <div style={{ position: "absolute", left: 96, top: 74, width: CERTIFICATE_WIDTH - 192, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Wordmark height={34} />
          <div style={{ width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.25)", marginLeft: 20, marginRight: 20 }} />
          <div style={{ fontSize: 19, fontWeight: 500, color: "rgba(255,255,255,0.84)", letterSpacing: -0.2 }}>The People Prop</div>
        </div>
        {c.isTest ? (
          <div style={{ display: "flex", alignItems: "center", height: 40, paddingLeft: 16, paddingRight: 18, borderRadius: 999, backgroundColor: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.6)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", letterSpacing: 2.4 }}>{"TEST CERTIFICATE · NOT VALID"}</div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", height: 40, paddingLeft: 16, paddingRight: 18, borderRadius: 999, backgroundColor: "rgba(4,8,7,0.55)", border: "1px solid rgba(255,255,255,0.16)" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: 2.2, textTransform: "uppercase", marginRight: 10 }}>Certificate No.</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.94)", letterSpacing: 0.6 }}>{c.number}</div>
          </div>
        )}
      </div>

      {/* type column */}
      <div style={{ position: "absolute", left: 96, top: 166, width: 800, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", height: 40, paddingLeft: 16, paddingRight: 20, borderRadius: 999, backgroundColor: "rgba(203,251,69,0.08)", border: "1px solid rgba(203,251,69,0.3)" }}>
          <div style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: LIME, marginRight: 11 }} />
          <div style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.9)", letterSpacing: -0.1 }}>{copy.eyebrow}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: titleSize, fontWeight: 600, letterSpacing: -titleSize * 0.04, lineHeight: 1.0 }}>
          <div style={{ display: "flex", backgroundImage: SILVER, backgroundClip: "text", color: "transparent", paddingBottom: 4 }}>{copy.lead}</div>
          {copy.fade ? <div style={{ display: "flex", color: FADE }}>{copy.fade}</div> : null}
        </div>

        <div style={{ marginTop: 32, fontSize: 14, fontWeight: 500, letterSpacing: 2.8, textTransform: "uppercase", color: MUTED }}>Proudly presented to</div>
        <div style={{ marginTop: 8, fontSize: nameSize, fontWeight: 600, letterSpacing: -nameSize * 0.03, lineHeight: 1.1, color: "#ffffff" }}>{c.traderName}</div>
        <div style={{ marginTop: 14, width: 120, height: 3, borderRadius: 3, backgroundImage: "linear-gradient(90deg, #cbfb45 0%, rgba(203,251,69,0) 100%)", display: "flex" }} />
        <div style={{ marginTop: 16, maxWidth: 640, fontSize: 19, fontWeight: 400, lineHeight: 1.5, color: "rgba(255,255,255,0.64)" }}>{copy.statement}</div>
      </div>

      {/* figure, details and verification */}
      <div style={{ position: "absolute", left: 96, bottom: 80, width: 780, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 540 }}>
          {copy.figure ? (
            <div style={{ display: "flex", flexDirection: "column", width: 540 }}>
              <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 2.8, textTransform: "uppercase", color: MUTED }}>{copy.figureLabel}</div>
              <div style={{ display: "flex", marginTop: 4, fontSize: figureSize, fontWeight: 700, letterSpacing: -figureSize * 0.035, lineHeight: 1.05, backgroundImage: VOLT, backgroundClip: "text", color: "transparent", paddingBottom: 6 }}>{copy.figure}</div>
            </div>
          ) : null}
          <div style={{ marginTop: 14, width: 540, height: 1, backgroundColor: "rgba(255,255,255,0.15)", display: "flex" }} />
          <div style={{ display: "flex", marginTop: 16 }}>
            {details.map((row, i) => (
              <div key={row.label} style={{ display: "flex", flexDirection: "column", paddingLeft: i === 0 ? 0 : 24, marginLeft: i === 0 ? 0 : 24, borderLeft: i === 0 ? "0px solid transparent" : "1px solid rgba(255,255,255,0.14)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2.4, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{row.label}</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: -0.2 }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", padding: 6, borderRadius: 18, backgroundColor: "rgba(203,251,69,0.16)", border: "1px solid rgba(203,251,69,0.4)" }}>
            <Qr url={verifyUrl(c.id)} size={150} />
          </div>
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: "#ffffff", letterSpacing: -0.1 }}>Scan to verify</div>
          <div style={{ marginTop: 3, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{host}</div>
        </div>
      </div>

      {c.isTest ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", transform: "rotate(-18deg)", fontSize: 360, fontWeight: 700, letterSpacing: 40, color: "rgba(251,191,36,0.09)" }}>TEST</div>
        </div>
      ) : null}
      {c.status === "revoked" ? (
        <>
          <Fill style={{ backgroundColor: "rgba(6,11,9,0.55)" }} />
          <Band text="REVOKED" color="rgba(220,38,38,0.9)" />
        </>
      ) : preview ? (
        <Band text="PREVIEW" color="rgba(203,251,69,0.28)" />
      ) : null}
    </div>
  );
}

/** PNG response for a certificate. `preview` stamps it for admin drafts and is never cached. */
export async function renderCertificate(c: Certificate, { preview = false }: { preview?: boolean } = {}) {
  const [fontList, plate] = await Promise.all([loadFonts(), loadPlate(c.kind)]);
  return new ImageResponse(<CertificateArt c={c} plate={plate} preview={preview} />, {
    width: CERTIFICATE_WIDTH,
    height: CERTIFICATE_HEIGHT,
    fonts: fontList,
    headers: { "Cache-Control": preview ? "no-store" : "public, max-age=120, s-maxage=600, stale-while-revalidate=86400" },
  });
}
