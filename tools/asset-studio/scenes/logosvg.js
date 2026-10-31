// Exports the traced wordmark as compact SVG path data (window.__svg).
import { traceLogo } from "../lib/logo.js";

export default async function ({ log }) {
  const H = 100;
  const logo = await traceLogo("/assets/logo.webp", 1);
  const k = H / logo.height;
  const toPath = (shapes) =>
    shapes
      .map((s) => {
        const loops = [s.getPoints(), ...s.holes.map((h) => h.getPoints())];
        return loops
          .map((pts) => {
            const d = pts.map((p, i) => `${i ? "L" : "M"}${((p.x + logo.width / 2) * k).toFixed(1)} ${((logo.height / 2 - p.y) * k).toFixed(1)}`).join("");
            return d + "Z";
          })
          .join("");
      })
      .join("");
  const width = (logo.width * k).toFixed(1);
  window.__svg = { viewBox: `0 0 ${width} ${H}`, white: toPath(logo.white), volt: toPath(logo.volt) };
  log(`viewBox 0 0 ${width} ${H}; white ${window.__svg.white.length} chars; volt ${window.__svg.volt.length} chars`);
  return { ok: true };
}
