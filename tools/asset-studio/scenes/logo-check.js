// 2D check of the traced wordmark outlines (no GPU): fills each shape and
// strokes the vertices so staircase / faceting is easy to spot when zoomed.
import { traceLogo } from "../lib/logo.js";
import { save } from "../lib/core.js";

export default async function ({ log, out = "v2/pt" }) {
  const logo = await traceLogo("/assets/logo.webp", 7.2);
  const W = 3600, S = W / 7.6, H = Math.ceil(logo.height * S + 120);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#101413";
  g.fillRect(0, 0, W, H);
  const tx = ([x, y]) => [W / 2 + x * S, H / 2 - y * S];
  const draw = (shapes, fill) => {
    let pts = 0;
    for (const sh of shapes) {
      const { shape, holes } = sh.extractPoints(1);
      g.beginPath();
      for (const ring of [shape, ...holes]) {
        ring.forEach((p, i) => {
          const [x, y] = tx([p.x, p.y]);
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        });
        g.closePath();
        pts += ring.length;
      }
      g.fillStyle = fill;
      g.fill("evenodd");
      g.strokeStyle = "#ff3b6b";
      g.lineWidth = 1.2;
      g.stroke();
    }
    return pts;
  };
  const a = draw(logo.white, "#e9eeec");
  const b = draw(logo.volt, "#cbfb45");
  log(`points white=${a} volt=${b}`);
  return { bytes: (await save(c, `${out}/logo-check-test.png`)).bytes, a, b };
}
