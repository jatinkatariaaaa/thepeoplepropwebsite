// Traces the real TPP wordmark (logo.webp) into THREE.Shapes so the 3D
// emblem is the brand's exact letterforms, not a redraw.
import * as THREE from "three";

function loadImage(url) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  });
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Marching squares with linear interpolation → closed polylines. */
function marchingSquares(field, W, H, iso = 0.5) {
  const V = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : field[y * W + x]);
  // edge ids: horizontal edge (x,y)-(x+1,y): y*(W+1)+x ; vertical edge (x,y)-(x,y+1): HOFF + y*(W+1)+x
  const HOFF = (H + 2) * (W + 2);
  const pts = new Map();
  const adj = new Map();
  const point = (id, x0, y0, x1, y1) => {
    if (!pts.has(id)) {
      const a = V(x0, y0);
      const b = V(x1, y1);
      const t = Math.abs(b - a) < 1e-6 ? 0.5 : (iso - a) / (b - a);
      pts.set(id, [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
    return id;
  };
  const link = (a, b) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  };
  for (let y = -1; y < H; y++) {
    for (let x = -1; x < W; x++) {
      const tl = V(x, y) > iso ? 8 : 0;
      const tr = V(x + 1, y) > iso ? 4 : 0;
      const br = V(x + 1, y + 1) > iso ? 2 : 0;
      const bl = V(x, y + 1) > iso ? 1 : 0;
      const c = tl | tr | br | bl;
      if (c === 0 || c === 15) continue;
      const k = (yy, xx) => (yy + 1) * (W + 2) + (xx + 1);
      const T = () => point(k(y, x), x, y, x + 1, y);
      const B = () => point(k(y + 1, x), x, y + 1, x + 1, y + 1);
      const L = () => point(HOFF + k(y, x), x, y, x, y + 1);
      const R = () => point(HOFF + k(y, x + 1), x + 1, y, x + 1, y + 1);
      const center = (V(x, y) + V(x + 1, y) + V(x + 1, y + 1) + V(x, y + 1)) / 4 > iso;
      switch (c) {
        case 1: case 14: link(L(), B()); break;
        case 2: case 13: link(B(), R()); break;
        case 3: case 12: link(L(), R()); break;
        case 4: case 11: link(T(), R()); break;
        case 6: case 9: link(T(), B()); break;
        case 7: case 8: link(L(), T()); break;
        case 5:
          if (center) { link(L(), T()); link(B(), R()); } else { link(L(), B()); link(T(), R()); }
          break;
        case 10:
          if (center) { link(T(), R()); link(L(), B()); } else { link(L(), T()); link(B(), R()); }
          break;
      }
    }
  }
  // walk loops
  const seen = new Set();
  const loops = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let prev = null;
    let cur = start;
    while (cur != null && !seen.has(cur)) {
      seen.add(cur);
      loop.push(pts.get(cur));
      const nb = adj.get(cur).filter((n) => n !== prev && !seen.has(n));
      prev = cur;
      cur = nb.length ? nb[0] : null;
    }
    if (loop.length > 8) loops.push(loop);
  }
  return loops;
}

function rdp(points, eps) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  let idx = -1;
  let dmax = 0;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const d = Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax > eps) {
    const a = rdp(points.slice(0, idx + 1), eps);
    const b = rdp(points.slice(idx), eps);
    return a.slice(0, -1).concat(b);
  }
  return [points[0], points[points.length - 1]];
}

function simplifyClosed(loop, eps) {
  // split the ring at its farthest point pair for stable RDP
  let far = 0;
  let best = 0;
  for (let i = 0; i < loop.length; i++) {
    const d = Math.hypot(loop[i][0] - loop[0][0], loop[i][1] - loop[0][1]);
    if (d > best) {
      best = d;
      far = i;
    }
  }
  const a = rdp(loop.slice(0, far + 1), eps);
  const b = rdp(loop.slice(far).concat([loop[0]]), eps);
  return a.slice(0, -1).concat(b.slice(0, -1));
}

/* The source raster has a faint staircase along its slanted strokes. At hero
   size the glass edges magnify it, so: find the true corners on a coarse fit,
   then Gaussian-smooth each run between corners (ends pinned, odd reflection
   keeps the tangent), and re-simplify with a tiny tolerance. */
function turn(a, b, c) {
  const u = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const v = Math.atan2(c[1] - b[1], c[0] - b[0]);
  const d = Math.abs(v - u);
  return d > Math.PI ? 2 * Math.PI - d : d;
}

function kernel(sigma) {
  const R = Math.ceil(sigma * 3);
  const w = [];
  for (let k = -R; k <= R; k++) w.push(Math.exp(-(k * k) / (2 * sigma * sigma)));
  return { R, w };
}

function gaussRun(run, sigma) {
  const n = run.length;
  if (n < 5) return run;
  const { R, w } = kernel(sigma);
  const at = (i) => {
    if (i < 0) {
      const p = run[Math.min(n - 1, -i)];
      return [2 * run[0][0] - p[0], 2 * run[0][1] - p[1]];
    }
    if (i >= n) {
      const p = run[Math.max(0, 2 * (n - 1) - i)];
      return [2 * run[n - 1][0] - p[0], 2 * run[n - 1][1] - p[1]];
    }
    return run[i];
  };
  const out = [run[0]];
  for (let i = 1; i < n - 1; i++) {
    let sx = 0, sy = 0, sw = 0;
    for (let k = -R; k <= R; k++) {
      const p = at(i + k);
      sx += p[0] * w[k + R];
      sy += p[1] * w[k + R];
      sw += w[k + R];
    }
    out.push([sx / sw, sy / sw]);
  }
  out.push(run[n - 1]);
  return out;
}

function smoothLoop(loop, { eps = 2, cornerDeg = 42, sigma = 7 } = {}) {
  const n = loop.length;
  const simp = simplifyClosed(loop, eps);
  const index = new Map(loop.map((p, i) => [p, i]));
  const corners = [];
  for (let i = 0; i < simp.length; i++) {
    const a = simp[(i - 1 + simp.length) % simp.length];
    const c = simp[(i + 1) % simp.length];
    if (turn(a, simp[i], c) > (cornerDeg * Math.PI) / 180) corners.push(index.get(simp[i]));
  }
  corners.sort((x, y) => x - y);
  if (!corners.length) {
    const { R, w } = kernel(sigma);
    const sm = loop.map((_, i) => {
      let sx = 0, sy = 0, sw = 0;
      for (let k = -R; k <= R; k++) {
        const p = loop[(i + k + n) % n];
        sx += p[0] * w[k + R];
        sy += p[1] * w[k + R];
        sw += w[k + R];
      }
      return [sx / sw, sy / sw];
    });
    return simplifyClosed(sm, 0.15);
  }
  const out = [];
  for (let c = 0; c < corners.length; c++) {
    const s = corners[c];
    const e = corners[(c + 1) % corners.length];
    const run = [loop[s]];
    let i = s;
    do {
      i = (i + 1) % n;
      run.push(loop[i]);
    } while (i !== e);
    out.push(...rdp(gaussRun(run, sigma), 0.15).slice(0, -1));
  }
  return out;
}

function area(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function toShapes(loops, map) {
  const polys = loops.map((l) => l.map(map));
  const depth = polys.map((p, i) => polys.filter((q, j) => j !== i && Math.abs(area(q)) > Math.abs(area(p)) && inside(p[0], q)).length);
  const shapes = [];
  polys.forEach((p, i) => {
    if (depth[i] % 2 === 1) return;
    const shape = new THREE.Shape(p.map(([x, y]) => new THREE.Vector2(x, y)));
    polys.forEach((h, j) => {
      if (depth[j] === depth[i] + 1 && inside(h[0], p)) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
    });
    shapes.push(shape);
  });
  return shapes;
}

/**
 * Returns { white: Shape[], volt: Shape[], width, height } in world units,
 * centred on the origin, with the wordmark `targetWidth` wide.
 */
export async function traceLogo(url, targetWidth = 4) {
  const img = await loadImage(url);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const { data } = g.getImageData(0, 0, c.width, c.height);
  const W = c.width;
  const H = c.height;
  const white = new Float32Array(W * H);
  const volt = new Float32Array(W * H);
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4];
    const gg = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    white[i] = smooth(60, 200, Math.min(r, b));
    volt[i] = smooth(45, 150, gg - b) * (b < 150 ? 1 : 0);
    if (white[i] > 0.5 || volt[i] > 0.5) {
      const x = i % W;
      const y = (i / W) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const s = targetWidth / (maxX - minX);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const map = ([x, y]) => [(x - cx) * s, -(y - cy) * s];
  const prep = (f) =>
    marchingSquares(f, W, H, 0.5)
      .filter((l) => l.length > 24)
      .map((l) => smoothLoop(l))
      .filter((l) => l.length > 3);
  return {
    white: toShapes(prep(white), map),
    volt: toShapes(prep(volt), map),
    width: targetWidth,
    height: (maxY - minY) * s,
  };
}

/**
 * Trace a short string rendered with a system font into centred THREE.Shapes
 * (`targetHeight` world units tall). Lets props carry "$5" or "?" without
 * shipping a typeface file.
 */
export function traceText(str, { font = '800 520px "Segoe UI", Arial, sans-serif', targetHeight = 1 } = {}) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  g.font = font;
  const m = g.measureText(str);
  const pad = 40;
  const W = Math.ceil(m.width + pad * 2);
  const asc = Math.ceil(m.actualBoundingBoxAscent);
  const desc = Math.ceil(m.actualBoundingBoxDescent);
  const H = asc + desc + pad * 2;
  c.width = W;
  c.height = H;
  g.font = font;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff";
  g.textBaseline = "alphabetic";
  g.fillText(str, pad, pad + asc);
  const { data } = g.getImageData(0, 0, W, H);
  const f = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) f[i] = data[i * 4] / 255;
  const loops = marchingSquares(f, W, H, 0.5)
    .filter((l) => l.length > 24)
    .map((l) => smoothLoop(l, { eps: 1.2, cornerDeg: 38, sigma: 2.5 }))
    .filter((l) => l.length > 3);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  loops.flat().forEach(([x, y]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  const s = targetHeight / (maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { shapes: toShapes(loops, ([x, y]) => [(x - cx) * s, -(y - cy) * s]), width: (maxX - minX) * s, height: targetHeight };
}

export function extrude(shapes, { depth = 0.3, bevel = 0.035, bevelSegments = 5 } = {}) {
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}
