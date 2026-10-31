// PHOTOREAL — one hero plate per V2 page. Every page gets its own sculpture,
// but all of them stand in the same lacquered "showroom" as the landing hero,
// so the site reads as one place with a different object in every room.
//
//   ?scene=pt-pages&only=challenges|rules&spp=420&scale=1
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { pathTrace, physicalCamera } from "../lib/pt.js";
import { save, preview } from "../lib/core.js";
import { traceLogo, extrude } from "../lib/logo.js";
import { showroom } from "./pt-showroom.js";
import { M, text, shape, CHECK, coin, PROPS } from "./pt-props.js";

const DEG = Math.PI / 180;
const glass = (tint, dist = 1.6, rough = 0.01) => M.glass(tint, dist, rough);
const EMERALD = () => glass("#3f9e85", 2.4);
const LIME = () => glass("#b9e82c", 1.8);
const MINT = () => glass("#cfeee4", 6);
const box = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, r), mat);
const at = (o, x, y, z) => (o.position.set(x, y, z), o);

/** Glyph standing on the floor, centred on x/z. */
function glyph(str, size, depth, mat, bevel = 0.05) {
  const m = new THREE.Mesh(text(str, size, depth, bevel), mat);
  m.position.y = size / 2;
  return m;
}

function extrudeShape(s, depth, bevel, mat, segs = 10) {
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: segs, curveSegments: 64 });
  g.center();
  return new THREE.Mesh(g, mat);
}

function star(r = 1, inner = 0.46) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  s.closePath();
  return s;
}

function roundedTriangle(r = 1.6) {
  const s = new THREE.Shape();
  const pts = [0, 1, 2].map((i) => new THREE.Vector2(Math.cos(Math.PI / 2 + (i * 2 * Math.PI) / 3) * r, Math.sin(Math.PI / 2 + (i * 2 * Math.PI) / 3) * r));
  const k = 0.22;
  pts.forEach((p, i) => {
    const prev = pts[(i + 2) % 3];
    const next = pts[(i + 1) % 3];
    const a = p.clone().lerp(prev, k);
    const b = p.clone().lerp(next, k);
    i ? s.lineTo(a.x, a.y) : s.moveTo(a.x, a.y);
    s.quadraticCurveTo(p.x, p.y, b.x, b.y);
  });
  s.closePath();
  return s;
}

function cup(scale = 1, mat = M.chrome(0.05)) {
  const g = new THREE.Group();
  const prof = [
    [0, 0],
    [0.55, 0],
    [0.58, 0.06],
    [0.36, 0.14],
    [0.16, 0.26],
    [0.12, 0.6],
    [0.18, 0.78],
    [0.62, 1.02],
    [0.82, 1.55],
    [0.86, 1.95],
    [0.8, 1.97],
    [0.76, 1.6],
    [0.6, 1.12],
    [0, 1.02],
  ].map(([x, y]) => new THREE.Vector2(x * scale, y * scale));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 160), mat));
  [-1, 1].forEach((sx) => {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.36 * scale, 0.055 * scale, 24, 80, Math.PI * 1.1), mat);
    h.position.set(sx * 0.86 * scale, 1.5 * scale, 0);
    h.rotation.z = sx > 0 ? -Math.PI * 0.55 : Math.PI * 0.45;
    g.add(h);
  });
  return g;
}

/* ───────────── one composition per page ───────────── */

const PAGES = {
  // five programs → five glass pillars climbing to a lime summit
  challenges: () => {
    const g = new THREE.Group();
    const H = [1.2, 1.85, 2.5, 3.15, 3.9];
    H.forEach((h, i) => {
      const mat = i === 4 ? LIME() : i % 2 ? MINT() : EMERALD();
      g.add(at(box(0.95, h, 0.95, 0.2, mat), -3.1 + i * 1.55, h / 2 + 0.16, 0));
      g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 64), M.chrome(0.04)), -3.1 + i * 1.55, h + 0.19, 0));
    });
    g.add(at(box(8.2, 0.16, 1.7, 0.07, M.chrome(0.14)), 0, 0.08, 0));
    g.rotation.y = -0.32;
    return { g, cam: { fill: 0.62, azim: -0.18, elev: 0.12 } };
  },

  // the rulebook: a glass shield with a chrome tick, the rule sheet behind it
  rules: () => {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(0, 1.62);
    s.bezierCurveTo(0.55, 1.42, 1.0, 1.42, 1.32, 1.52);
    s.bezierCurveTo(1.38, 0.35, 1.02, -0.72, 0, -1.55);
    s.bezierCurveTo(-1.02, -0.72, -1.38, 0.35, -1.32, 1.52);
    s.bezierCurveTo(-1.0, 1.42, -0.55, 1.42, 0, 1.62);
    const shield = extrudeShape(s, 0.5, 0.14, EMERALD());
    shield.position.set(0.4, 1.75, 0.2);
    g.add(shield);
    const tick = new THREE.Mesh(shape(CHECK, 0.16, 0.05), M.chrome(0.04));
    tick.scale.setScalar(1.9);
    tick.position.set(0.4, 1.8, 0.58);
    g.add(tick);
    const sheet = PROPS.rules();
    sheet.rotation.set(0, 0.5, 0);
    sheet.scale.setScalar(0.9);
    sheet.position.set(-2.1, 1.45, -1.3);
    g.add(sheet);
    return { g, cam: { fill: 0.42, azim: -0.3, elev: 0.08, cx: 0.66 } };
  },

  // questions in three materials, at three depths
  faqs: () => {
    const g = new THREE.Group();
    const a = glyph("?", 2.9, 0.8, M.chrome(0.06), 0.1);
    a.position.x = 0.5;
    a.rotation.y = -0.35;
    const b = glyph("?", 2.0, 0.6, EMERALD(), 0.08);
    b.position.set(-1.9, b.position.y, -1.5);
    b.rotation.y = 0.35;
    const c = glyph("?", 1.3, 0.45, LIME(), 0.06);
    c.position.set(2.5, c.position.y, 1.0);
    c.rotation.y = -0.6;
    g.add(a, b, c);
    return { g, cam: { fill: 0.46, azim: -0.12, elev: 0.08 } };
  },

  // a frosted globe inside chrome meridians: traders in many countries
  about: () => {
    const g = new THREE.Group();
    const y = 2.05;
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(1.35, 128, 64), glass("#bfe7da", 4, 0.22)), 0, y, 0));
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 32), LIME()), 0, y, 0));
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.04, 24, 220), M.chrome(0.05));
      r.position.y = y;
      r.rotation.y = (i * Math.PI) / 3;
      g.add(r);
    }
    const eq = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.06, 24, 220), EMERALD());
    eq.position.y = y;
    eq.rotation.x = Math.PI / 2;
    g.add(eq);
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.36, 32), M.chrome(0.06)), 0, 0.36, 0));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.18, 96), M.chrome(0.12)), 0, 0.09, 0));
    g.rotation.z = 0.12;
    return { g, cam: { fill: 0.34, azim: -0.2, elev: 0.1 } };
  },

  // two glass speech bubbles in conversation
  contact: () => {
    const g = new THREE.Group();
    const bubble = (w, h, mat, tailLeft) => {
      const b = new THREE.Group();
      b.add(box(w, h, 0.45, 0.42, mat));
      const t = new THREE.Shape();
      const sx = tailLeft ? -1 : 1;
      t.moveTo(sx * (w * 0.18), -h / 2 + 0.1);
      t.lineTo(sx * (w * 0.42), -h / 2 - 0.55);
      t.lineTo(sx * (w * 0.4), -h / 2 + 0.1);
      t.closePath();
      const tail = extrudeShape(t, 0.3, 0.06, mat, 6);
      tail.position.set(sx * w * 0.3, -h / 2 - 0.16, 0);
      b.add(tail);
      return b;
    };
    const a = bubble(3.0, 1.85, EMERALD(), true);
    a.position.set(-0.9, 1.75, 0);
    a.rotation.y = 0.18;
    [-0.62, 0, 0.62].forEach((x) => a.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.17, 48, 24), M.chrome(0.04)), x, 0.02, 0.32)));
    const b = bubble(2.3, 1.45, LIME(), false);
    b.position.set(1.55, 3.05, -1.1);
    b.rotation.y = -0.25;
    const at_ = new THREE.Mesh(text("@", 0.85, 0.12, 0.03), M.chrome(0.05));
    at_.position.z = 0.3;
    b.add(at_);
    g.add(a, b);
    return { g, cam: { fill: 0.44, azim: -0.22, elev: 0.06, cy: 0.46 } };
  },

  // launch: a chrome rocket with a glass porthole on three fins
  careers: () => {
    const g = new THREE.Group();
    const prof = [
      [0, 0.0],
      [0.42, 0.0],
      [0.52, 0.3],
      [0.56, 1.2],
      [0.52, 1.9],
      [0.38, 2.5],
      [0.18, 2.92],
      [0, 3.05],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), M.chrome(0.05));
    body.position.y = 0.55;
    g.add(body);
    const fin = new THREE.Shape();
    fin.moveTo(0, 0);
    fin.lineTo(0.75, -0.45);
    fin.lineTo(0.72, 0.05);
    fin.lineTo(0, 1.1);
    fin.closePath();
    for (let i = 0; i < 3; i++) {
      const f = extrudeShape(fin, 0.07, 0.03, LIME(), 4);
      const a = (i * 2 * Math.PI) / 3 + 0.4;
      const piv = new THREE.Group();
      f.position.set(0.82, 0.88, 0);
      piv.add(f);
      piv.rotation.y = a;
      g.add(piv);
    }
    const win = new THREE.Mesh(new THREE.SphereGeometry(0.26, 64, 32), EMERALD());
    win.scale.z = 0.45;
    win.position.set(0, 2.45, 0.5);
    g.add(win);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.045, 24, 96), M.chrome(0.04));
    rim.position.set(0, 2.45, 0.53);
    g.add(rim);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.7, 64, 1, true), glass("#dcffa0", 0.8, 0.15));
    flame.rotation.x = Math.PI;
    flame.position.y = 0.32;
    g.add(flame);
    g.rotation.z = -0.14;
    return { g, cam: { fill: 0.3, azim: -0.25, elev: 0.08, cy: 0.5 } };
  },

  // the podium
  leaderboard: () => {
    const g = new THREE.Group();
    const blocks = [
      { x: -1.75, h: 1.45, mat: MINT(), n: "2" },
      { x: 0, h: 2.15, mat: LIME(), n: "1" },
      { x: 1.75, h: 1.0, mat: EMERALD(), n: "3" },
    ];
    blocks.forEach(({ x, h, mat, n }) => {
      g.add(at(box(1.7, h, 1.5, 0.12, mat), x, h / 2, 0));
      const num = new THREE.Mesh(text(n, 0.62, 0.12, 0.03), M.chrome(0.05));
      num.position.set(x, h * 0.55, 0.8);
      g.add(num);
    });
    const c = cup(0.85);
    c.position.set(0, 2.15, 0);
    g.add(c);
    g.rotation.y = -0.3;
    return { g, cam: { fill: 0.42, azim: -0.12, elev: 0.1 } };
  },

  // a 3-D heat map in glass: height and tint follow the "heat"
  heatmap: () => {
    const g = new THREE.Group();
    const C = 7;
    const R = 4;
    for (let i = 0; i < C; i++) {
      for (let j = 0; j < R; j++) {
        const v = 0.5 + 0.5 * Math.sin(i * 0.9 + j * 1.7) * Math.cos(i * 0.4 - j * 0.8);
        const h = 0.25 + v * 1.9;
        const mat = v > 0.72 ? LIME() : v > 0.4 ? MINT() : EMERALD();
        g.add(at(box(0.82, h, 0.82, 0.12, mat), (i - (C - 1) / 2) * 0.94, h / 2, (j - (R - 1) / 2) * 0.94));
      }
    }
    g.rotation.y = -0.5;
    return { g, cam: { fill: 0.56, azim: -0.15, elev: 0.32, cy: 0.5 } };
  },

  // the cup
  contest: () => {
    const g = new THREE.Group();
    g.add(at(box(1.9, 0.75, 1.9, 0.12, EMERALD()), 0, 0.375, 0));
    g.add(at(box(2.02, 0.12, 2.02, 0.05, LIME()), 0, 0.62, 0));
    const c = cup(1.25);
    c.position.y = 0.75;
    g.add(c);
    g.rotation.y = -0.25;
    return { g, cam: { fill: 0.27, azim: -0.15, elev: 0.08, cy: 0.5 } };
  },

  // five stars in an arc — the centre one in chrome
  reviews: () => {
    const g = new THREE.Group();
    const mats = [EMERALD(), LIME(), M.chrome(0.05), LIME(), EMERALD()];
    [-2, -1, 0, 1, 2].forEach((k, i) => {
      const r = k === 0 ? 0.95 : Math.abs(k) === 1 ? 0.75 : 0.6;
      const s = extrudeShape(star(r), 0.32, 0.09, mats[i], 8);
      s.position.set(k * 1.75, 1.2 + (2 - Math.abs(k)) * 0.42 + r, -Math.abs(k) * 0.4);
      s.rotation.y = -k * 0.18;
      g.add(s);
    });
    return { g, cam: { fill: 0.64, azim: -0.12, elev: 0.06 } };
  },

  // market notes: a glass tablet on a chrome stand, a chart on its screen
  blog: () => {
    const g = new THREE.Group();
    const tab = new THREE.Group();
    tab.add(box(3.9, 2.6, 0.16, 0.18, M.dark()));
    tab.add(at(box(3.6, 2.3, 0.04, 0.1, glass("#cfeee4", 10, 0.06)), 0, 0, 0.09));
    const bars = [0.5, 0.8, 0.65, 1.1, 0.9, 1.35, 1.2, 1.6];
    bars.forEach((h, i) => {
      const b = box(0.24, h, 0.06, 0.03, i % 3 === 1 ? MINT() : LIME());
      b.position.set(-1.35 + i * 0.38, -0.85 + h / 2, 0.14);
      tab.add(b);
    });
    tab.rotation.x = -0.22;
    tab.position.set(0, 1.75, 0);
    g.add(tab);
    g.add(at(box(0.18, 1.2, 0.18, 0.05, M.chrome(0.08)), 0, 0.6, -0.4));
    g.add(at(box(1.6, 0.1, 0.9, 0.04, M.chrome(0.12)), 0, 0.05, -0.3));
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 32), M.chrome(0.05));
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.5;
    pen.position.set(1.5, 0.07, 1.0);
    g.add(pen);
    g.rotation.y = -0.38;
    return { g, cam: { fill: 0.42, azim: -0.1, elev: 0.08 } };
  },

  // terms: chrome scales with glass pans
  terms: () => {
    const g = new THREE.Group();
    const ch = M.chrome(0.05);
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.16, 96), ch), 0, 0.08, 0));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.0, 32), ch), 0, 1.6, 0));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 32), ch);
    beam.rotation.z = Math.PI / 2 + 0.06;
    beam.position.y = 3.05;
    g.add(beam);
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.14, 48, 24), LIME()), 0, 3.2, 0));
    [-1, 1].forEach((sx) => {
      const y = 3.05 + sx * -0.1;
      for (let k = -1; k <= 1; k += 2) {
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.25, 8), ch);
        chain.position.set(sx * 1.6 + k * 0.28, y - 0.6, 0);
        chain.rotation.z = k * -0.2;
        g.add(chain);
      }
      const pan = new THREE.Mesh(new THREE.SphereGeometry(0.62, 96, 32, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38), sx < 0 ? EMERALD() : LIME());
      pan.position.set(sx * 1.6, y - 0.75, 0);
      g.add(pan);
    });
    return { g, cam: { fill: 0.4, azim: -0.18, elev: 0.08 } };
  },

  // privacy: a glass padlock with a chrome shackle
  privacy: () => {
    const g = new THREE.Group();
    g.add(at(box(2.1, 1.75, 0.85, 0.26, EMERALD()), 0, 0.875, 0));
    const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.15, 32, 120, Math.PI), M.chrome(0.05));
    shackle.position.set(0, 1.75, 0);
    g.add(shackle);
    [-1, 1].forEach((sx) => g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.35, 48), M.chrome(0.05)), sx * 0.66, 1.65, 0)));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 48), M.chrome(0.04)), 0, 1.0, 0.45).rotateX(Math.PI / 2));
    g.add(at(box(0.12, 0.42, 0.1, 0.03, M.chrome(0.04)), 0, 0.72, 0.45));
    g.rotation.y = -0.35;
    return { g, cam: { fill: 0.3, azim: -0.12, elev: 0.08 } };
  },

  // cookie preferences: two glass toggles, one on, one off
  cookie: () => {
    const g = new THREE.Group();
    const toggle = (on, y, z) => {
      const t = new THREE.Group();
      t.add(box(2.6, 1.2, 0.5, 0.58, on ? LIME() : MINT()));
      t.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.48, 96, 48), M.chrome(0.05)), on ? 0.66 : -0.66, 0, 0.12));
      t.position.set(0, y, z);
      return t;
    };
    g.add(toggle(true, 2.35, -0.6), toggle(false, 0.8, 0.4));
    g.rotation.y = -0.32;
    return { g, cam: { fill: 0.32, azim: -0.15, elev: 0.06 } };
  },

  // AML: a chrome magnifier inspecting a coin stack
  "aml-policy": async ({ logo }) => {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const c = coin(logo, 0.95, 0.2);
      c.rotation.x = -Math.PI / 2;
      c.rotation.z = i * 0.7;
      c.position.set(-0.6 + Math.sin(i) * 0.03, 0.1 + i * 0.21, 0);
      g.add(c);
    }
    const mag = new THREE.Group();
    mag.add(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.11, 32, 160), M.chrome(0.04)));
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 96), glass("#e6f6f0", 20, 0.0));
    lens.rotation.x = Math.PI / 2;
    mag.add(lens);
    const handle = box(0.24, 1.7, 0.24, 0.1, M.dark());
    handle.position.set(0, -1.8, 0);
    mag.add(handle);
    mag.rotation.set(-0.15, -0.3, 0.7);
    mag.position.set(0.85, 2.35, 0.6);
    g.add(mag);
    return { g, cam: { fill: 0.34, azim: -0.2, elev: 0.1 } };
  },

  // risk: a rounded glass warning triangle with a chrome "!"
  "risk-disclosure": () => {
    const g = new THREE.Group();
    const tri = extrudeShape(roundedTriangle(1.75), 0.45, 0.13, LIME());
    tri.position.set(0, 1.55, 0);
    g.add(tri);
    const ex = new THREE.Mesh(text("!", 1.25, 0.14, 0.04), M.chrome(0.04));
    ex.position.set(0, 1.35, 0.4);
    g.add(ex);
    const sheet = PROPS.candles();
    sheet.scale.setScalar(0.62);
    sheet.position.set(-2.4, 0.11, -1.4);
    g.add(sheet);
    g.rotation.y = -0.3;
    return { g, cam: { fill: 0.42, azim: -0.18, elev: 0.08 } };
  },
};

/** Shift-lens framing (verticals stay straight): fit the group, then slide it to (cx, cy). */
function frameGroup(camera, group, w, h, { fill = 0.42, azim = -0.2, elev = 0.08, cx = 0.7, cy = 0.5, fov = 24 }) {
  const b = new THREE.Box3().setFromObject(group);
  const size = b.getSize(new THREE.Vector3());
  const center = b.getCenter(new THREE.Vector3());
  const hfov = 2 * Math.atan(Math.tan((fov * DEG) / 2) * (w / h));
  const dist = Math.max(size.x, size.z) / 2 / Math.tan((fill * hfov) / 2) + Math.max(size.x, size.z) / 2;
  const dir = new THREE.Vector3(Math.sin(azim) * Math.cos(elev), Math.sin(elev), Math.cos(azim) * Math.cos(elev));
  camera.position.copy(center).addScaledVector(dir, dist);
  camera.lookAt(center);
  const S = 2.4;
  camera.fov = (2 * Math.atan(S * Math.tan((fov * DEG) / 2))) / DEG;
  camera.setViewOffset(S * w, S * h, (S / 2 - cx) * w, (S / 2 - cy) * h, w, h);
  camera.updateProjectionMatrix();
  return { center, dist, dir };
}

export default async function ({ log, only = "", spp = "420", scale = "1", out = "v2/pt", ...q }) {
  const want = (n) => !only || only.split("|").includes(n);
  const logo = await traceLogo("/assets/logo.webp", 4.2);
  const k = Number(scale);
  const w = Math.round(2200 * k);
  const h = Math.round(1100 * k);
  const res = {};
  for (const [name, make] of Object.entries(PAGES)) {
    if (!want(name)) continue;
    log(`▸ ${name}`);
    const canvas = await pathTrace({
      w,
      h,
      samples: Number(spp),
      log,
      tiles: Number(q.tiles ?? 8),
      build: async () => {
        const scene = new THREE.Scene();
        const { g, cam } = await make({ logo });
        g.updateMatrixWorld(true);
        // sit the sculpture on the floor whatever its pivot
        const b = new THREE.Box3().setFromObject(g);
        g.position.y -= b.min.y;
        scene.add(g);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshPhysicalMaterial({ color: 0x030605, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.09 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const camera = physicalCamera({ fov: 24, aspect: w / h, fStop: 2.4, focus: 10 });
        const { center, dist, dir } = frameGroup(camera, g, w, h, cam);
        camera.focusDistance = dist;
        // the emerald halo sits right behind the sculpture as seen from this camera
        const env = showroom({ wash: 0.35, washAz: Math.atan2(-dir.z, -dir.x) / DEG, washW: 22, washH: 10, washEl: 4, washSoft: 0.8, bars: 1.4, kicker: Number(q.kicker ?? 2.5) });
        scene.environment = env;
        scene.background = env;
        const top = new THREE.RectAreaLight(0xffffff, 12, 9, 3.2);
        top.position.set(center.x + 0.6, 6.5, center.z + 2.6);
        top.lookAt(center.x, 0.8, center.z);
        scene.add(top);
        return { scene, camera };
      },
    });
    preview(canvas);
    res[name] = (await save(canvas, `${out}/page-${name}${k !== 1 ? "-test" : ""}.png`)).bytes;
  }
  return res;
}
