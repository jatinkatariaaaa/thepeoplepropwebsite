import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { CERT_TYPES, DEFAULT_NAME, BRAND_DOMAIN } from "@/lib/certificate-types";

export const runtime = "nodejs";

const W = 1600;
const H = 900;

const INK = "#12151a";
const MUTED = "#7b8494";
const SOFT = "#3c4350";

async function loadAsset(rel: string) {
  return readFile(path.join(process.cwd(), "public", rel));
}

function toDataUrl(buf: Buffer, mime: string) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeKey = searchParams.get("type") || "funded";
    const cfg = CERT_TYPES[typeKey];
    if (!cfg) {
      return new Response(
        `Unknown certificate type "${typeKey}". Valid types: ${Object.keys(CERT_TYPES).join(", ")}`,
        { status: 400 }
      );
    }

    const name = searchParams.get("name") || DEFAULT_NAME;
    const amount = searchParams.get("amount") || cfg.defaultAmount || "";
    const certId =
      searchParams.get("id") ||
      `${cfg.idPrefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
    const signatory = searchParams.get("signatory") || "The People Prop";
    const signRole = searchParams.get("role") || "Managing Director";

    const fields = cfg.fields.map((f) => ({
      label: f.label,
      value: searchParams.get(f.id) || f.default,
    }));

    const [bg, inter400, inter600, inter800, mono700] = await Promise.all([
      loadAsset(`certificates/${cfg.bg}`),
      loadAsset("fonts/inter-400.ttf"),
      loadAsset("fonts/inter-600.ttf"),
      loadAsset("fonts/inter-800.ttf"),
      loadAsset("fonts/jetbrains-700.ttf"),
    ]);

    const accent = cfg.accent;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            position: "relative",
            fontFamily: "Inter",
            color: INK,
            backgroundColor: "#f4f6f8",
          }}
        >
          {/* AI generated background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toDataUrl(bg, "image/png")}
            width={W}
            height={H}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Readability scrim over the text zone */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "62%",
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(248,250,251,0) 0%, rgba(248,250,251,0.78) 22%, rgba(248,250,251,0.9) 55%, rgba(248,250,251,0.94) 100%)",
            }}
          />

          {/* Brand */}
          <div
            style={{
              position: "absolute",
              top: 64,
              right: 76,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 5,
                color: INK,
              }}
            >
              THE PEOPLE
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: 5,
                color: accent,
              }}
            >
              PROP
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              position: "absolute",
              top: cfg.amountLabel ? 168 : 226,
              left: "46%",
              right: 76,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 15,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: accent,
                fontWeight: 600,
              }}
            >
              {cfg.eyebrow}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: cfg.title.length > 18 ? 50 : 58,
                fontWeight: 800,
                letterSpacing: -1,
                lineHeight: 1.05,
              }}
            >
              {cfg.title}
            </div>
            <div
              style={{
                width: 64,
                height: 3,
                backgroundColor: accent,
                marginTop: 26,
                marginBottom: 26,
              }}
            />
            <div
              style={{
                fontSize: 13,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: MUTED,
                fontWeight: 600,
              }}
            >
              Awarded To
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 38,
                fontWeight: 600,
                letterSpacing: -0.5,
              }}
            >
              {name}
            </div>

            {cfg.amountLabel && amount ? (
              <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: 5,
                    textTransform: "uppercase",
                    color: MUTED,
                    fontWeight: 600,
                  }}
                >
                  {cfg.amountLabel}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "JetBrains Mono",
                    fontWeight: 700,
                    fontSize: 64,
                    letterSpacing: -1,
                    color: INK,
                  }}
                >
                  {amount}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 64, marginTop: cfg.amountLabel ? 36 : 44 }}>
              {fields.map((f) => (
                <div key={f.label} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      color: MUTED,
                      fontWeight: 600,
                    }}
                  >
                    {f.label}
                  </div>
                  <div
                    style={{
                      marginTop: 7,
                      fontSize: 19,
                      fontWeight: 600,
                      color: SOFT,
                    }}
                  >
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              left: "46%",
              right: 76,
              bottom: 64,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{signatory}</div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 11,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: MUTED,
                  fontWeight: 600,
                }}
              >
                {signRole}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: 14,
                  color: SOFT,
                  fontWeight: 700,
                }}
              >
                {certId}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: MUTED }}>
                {`Verify at ${BRAND_DOMAIN}/verify`}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: [
          { name: "Inter", data: inter400, weight: 400, style: "normal" },
          { name: "Inter", data: inter600, weight: 600, style: "normal" },
          { name: "Inter", data: inter800, weight: 800, style: "normal" },
          { name: "JetBrains Mono", data: mono700, weight: 700, style: "normal" },
        ],
      }
    );
  } catch (e) {
    console.error("[cert] generation error:", e);
    return new Response("Failed to generate certificate", { status: 500 });
  }
}
