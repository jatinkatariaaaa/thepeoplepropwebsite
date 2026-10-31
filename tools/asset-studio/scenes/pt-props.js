// PHOTOREAL PROPS — path-traced chrome + glass objects on transparent
// backgrounds, one shared studio so every reflection matches.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createTracer, LIGHTING, physicalCamera } from "../lib/pt.js";
import { save, preview } from "../lib/core.js";
import { frame } from "../lib/stage.js";
import { traceLogo, traceText, extrude } from "../lib/logo.js";

/* ───────────── materials ───────────── */
export const M = {
  chrome: (r = 0.07) => new THREE.MeshPhysicalMaterial({ color: 0xeef1f2, metalness: 1, roughness: r }),
  brushed: () => new THREE.MeshPhysicalMaterial({ color: 0xd9dee0, metalness: 1, roughness: 0.3 }),
  dark: () => new THREE.MeshPhysicalMaterial({ color: 0x0d1513, metalness: 0.2, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }),
  enamel: (c = 0xf3f6f4) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.04 }),
  glass: (tint = "#dff1ea", dist = 5, rough = 0.01) =>
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: rough, transmission: 1, ior: 1.52, thickness: 1, attenuationColor: new THREE.Color(tint), attenuationDistance: dist }),
  emerald: () => M.glass("#5fa892", 1.3),
  lime: () => M.glass("#c2ea36", 1.0),
  frost: (tint = "#cfe6de") => M.glass(tint, 3.5, 0.28),
  sand: () => new THREE.MeshPhysicalMaterial({ color: 0xc7ec3c, roughness: 0.75, sheen: 1, sheenColor: new THREE.Color(0xeaffa0), sheenRoughness: 0.6 }),
  glow: (i = 3) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(0xcbfb45), emissiveIntensity: i }),
};

/** Extruded glyphs traced from a system font, centred on the origin. */
export function text(str, size, depth, bevel = 0.04) {
  const t = traceText(str, { targetHeight: size });
  return extrude(t.shapes, { depth, bevel, bevelSegments: 8 });
}

export function shape(points, depth, bevel) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 8, curveSegments: 24 });
  g.center();
  return g;
}

export const CHECK = [[-0.42, 0.02], [-0.16, -0.26], [0.44, 0.34], [0.32, 0.46], [-0.16, -0.02], [-0.3, 0.14]];

/* ───────────── objects ───────────── */

export function coin(logo, r = 1, t = 0.22) {
  const g = new THREE.Group();
  const T = t / 2;
  const prof = [];
  const inner = 0.8 * r;
  prof.push(new THREE.Vector2(inner, -T * 0.7));
  prof.push(new THREE.Vector2(inner + 0.04 * r, -T));
  for (let i = 0; i <= 14; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 14;
    prof.push(new THREE.Vector2(0.94 * r + Math.cos(a) * 0.06 * r, Math.sin(a) * T));
  }
  prof.push(new THREE.Vector2(inner + 0.04 * r, T));
  prof.push(new THREE.Vector2(inner, T * 0.7));
  const rim = new THREE.Mesh(new THREE.LatheGeometry(prof, 180), M.chrome(0.06));
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(inner + 0.01, inner + 0.01, t * 0.72, 160), M.emerald());
  face.rotation.x = Math.PI / 2;
  g.add(face);
  if (logo) {
    const e = new THREE.Group();
    e.add(new THREE.Mesh(extrude(logo.white, { depth: 0.1, bevel: 0.03 }), M.chrome(0.05)));
    e.add(new THREE.Mesh(extrude(logo.volt, { depth: 0.1, bevel: 0.03 }), M.lime()));
    e.scale.setScalar((r * 1.0) / logo.width);
    e.position.z = t * 0.36 + 0.02;
    g.add(e);
  }
  return g;
}

export function badge(r = 0.62) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.22, 96), M.lime());
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 24, 120), M.chrome());
  g.add(ring);
  const chk = new THREE.Mesh(shape(CHECK, 0.1, 0.035), M.chrome(0.05));
  chk.scale.setScalar(r * 1.25);
  chk.position.z = 0.16;
  g.add(chk);
  return g;
}

export const PROPS = {
  stopwatch: () => {
    const g = new THREE.Group();
    const R = 1.6;
    const prof = [new THREE.Vector2(0, -0.28)];
    for (let i = 0; i <= 16; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / 16;
      prof.push(new THREE.Vector2(R + Math.cos(a) * 0.28, Math.sin(a) * 0.28));
    }
    prof.push(new THREE.Vector2(0, 0.28));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 200), M.chrome(0.06));
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.08, R - 0.08, 0.06, 160), M.enamel(0x0e1a17));
    dial.rotation.x = Math.PI / 2;
    dial.position.z = 0.27;
    g.add(dial);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const big = i % 5 === 0;
      const tk = new THREE.Mesh(new THREE.BoxGeometry(big ? 0.05 : 0.022, big ? 0.24 : 0.1, 0.02), big ? M.enamel(0xf2f5f3) : M.enamel(0x6f8a83));
      tk.position.set(Math.sin(a) * (R - 0.3), Math.cos(a) * (R - 0.3), 0.31);
      tk.rotation.z = -a;
      g.add(tk);
    }
    const arc = new THREE.Mesh(new THREE.TorusGeometry(R - 0.62, 0.05, 16, 200, Math.PI * 1.72), M.glow(2.4));
    arc.position.z = 0.31;
    arc.rotation.z = Math.PI / 2;
    g.add(arc);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.05, R - 0.4, 0.02), M.enamel(0xcbfb45));
    hand.geometry.translate(0, (R - 0.4) / 2, 0);
    hand.position.z = 0.33;
    hand.rotation.z = Math.PI * 0.28;
    g.add(hand);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 32), M.chrome());
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.35;
    g.add(hub);
    const crystal = new THREE.Mesh(new THREE.SphereGeometry(R * 3.2, 96, 32, 0, Math.PI * 2, 0, Math.asin((R - 0.04) / (R * 3.2))), M.glass("#eaf6f1", 30, 0.0));
    crystal.rotation.x = Math.PI / 2;
    crystal.position.z = 0.36 - R * 3.2 * Math.cos(Math.asin((R - 0.04) / (R * 3.2)));
    g.add(crystal);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 48), M.chrome());
    stem.position.y = R + 0.42;
    g.add(stem);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 64), M.brushed());
    crown.position.y = R + 0.72;
    g.add(crown);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 24, 96), M.chrome());
    loop.position.y = R + 1.08;
    g.add(loop);
    [-1, 1].forEach((s) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 32), M.chrome());
      const a = s * 0.75;
      p.position.set(Math.sin(a) * (R + 0.18), Math.cos(a) * (R + 0.18), 0);
      p.rotation.z = -a;
      g.add(p);
    });
    g.rotation.set(-0.18, 0.55, 0.12);
    return g;
  },

  coins: ({ logo }) => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const c = coin(logo, 1.15, 0.24);
      c.rotation.x = -Math.PI / 2;
      c.rotation.z = i * 0.9;
      c.position.set(Math.sin(i * 1.9) * 0.05, i * 0.255, Math.cos(i * 1.3) * 0.05);
      g.add(c);
    }
    const lean = coin(logo, 1.15, 0.24);
    lean.position.set(1.55, 1.05, 0.55);
    lean.rotation.set(-0.12, -0.55, -0.32);
    g.add(lean);
    const top = coin(logo, 0.85, 0.2);
    top.position.set(-1.15, 2.35, 0.3);
    top.rotation.set(0.42, 0.62, 0.35);
    g.add(top);
    g.rotation.y = -0.2;
    return g;
  },

  tiles: ({ logo }) => {
    const g = new THREE.Group();
    const S = 1.5;
    const mk = (x, y, z, ry, rx, tint, glyph) => {
      const t = new THREE.Group();
      t.add(new THREE.Mesh(new RoundedBoxGeometry(S, S, 0.3, 8, 0.34), M.frost(tint)));
      const gl = glyph();
      gl.position.z = 0.17;
      t.add(gl);
      t.position.set(x, y, z);
      t.rotation.set(rx, ry, 0);
      g.add(t);
    };
    mk(-0.85, 0.85, 0.3, 0.35, -0.12, "#bfe2d6", () => {
      const e = new THREE.Group();
      e.add(new THREE.Mesh(extrude(logo.white, { depth: 0.12, bevel: 0.03 }), M.chrome(0.05)));
      e.add(new THREE.Mesh(extrude(logo.volt, { depth: 0.12, bevel: 0.03 }), M.lime()));
      e.scale.setScalar(1.05 / logo.width);
      return e;
    });
    mk(0.85, 0.95, -0.4, 0.25, -0.1, "#d6ece5", () => {
      const e = new THREE.Group();
      [[-0.32, 0.38, false], [0, 0.6, true], [0.32, 0.46, true]].forEach(([x, hgt, up]) => {
        const b = new THREE.Mesh(new RoundedBoxGeometry(0.16, hgt, 0.1, 4, 0.04), up ? M.lime() : M.chrome());
        b.position.set(x, (hgt - 0.5) / 2, 0);
        e.add(b);
        const wk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, hgt + 0.28, 12), M.chrome());
        wk.position.set(x, (hgt - 0.5) / 2, -0.02);
        e.add(wk);
      });
      return e;
    });
    mk(-0.7, -0.8, -0.2, 0.3, 0.08, "#d1e9e1", () => {
      const pts = [[-0.45, -0.25], [-0.2, -0.05], [0.0, -0.15], [0.22, 0.12], [0.45, 0.3]].map(([x, y]) => new THREE.Vector3(x, y, 0));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.045, 16), M.glow(2.2));
      const e = new THREE.Group();
      e.add(tube);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 12), M.chrome());
      dot.position.set(0.45, 0.3, 0);
      e.add(dot);
      return e;
    });
    mk(0.95, -0.7, 0.2, 0.18, 0.1, "#c6e5da", () => {
      const e = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 12), i === 4 ? M.lime() : M.chrome());
        d.position.set(((i % 3) - 1) * 0.3, (Math.floor(i / 3) - 1) * 0.3, 0);
        e.add(d);
      }
      return e;
    });
    g.rotation.y = -0.25;
    return g;
  },

  rules: () => {
    const g = new THREE.Group();
    const page = new THREE.Mesh(new RoundedBoxGeometry(2.5, 3.2, 0.14, 6, 0.2), M.frost("#d4ebe3"));
    g.add(page);
    const lines = [0.95, 0.8, 0.88, 0.6, 0.92, 0.7, 0.5];
    lines.forEach((l, i) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(1.7 * l, 0.11, 0.05, 3, 0.05), i === 0 ? M.enamel(0x0e1a17) : M.chrome(0.1));
      b.position.set(-0.85 + (1.7 * l) / 2 - 0.0, 1.1 - i * 0.33, 0.1);
      g.add(b);
    });
    const b = badge(0.62);
    b.position.set(1.05, -1.25, 0.45);
    b.rotation.set(0.05, -0.2, 0);
    g.add(b);
    g.rotation.set(-0.12, 0.42, 0.06);
    return g;
  },

  card5: ({ logo, font }) => {
    const g = new THREE.Group();
    const back = new THREE.Mesh(new RoundedBoxGeometry(3.4, 2.15, 0.1, 6, 0.2), M.frost("#e3f1ec"));
    back.position.set(0.5, 0.45, -0.4);
    back.rotation.z = 0.1;
    g.add(back);
    const card = new THREE.Group();
    card.add(new THREE.Mesh(new RoundedBoxGeometry(3.4, 2.15, 0.12, 6, 0.2), M.emerald()));
    const chip = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.42, 0.06, 4, 0.07), M.brushed());
    chip.position.set(-1.05, 0.28, 0.08);
    card.add(chip);
    const five = new THREE.Mesh(text("$5", 0.62, 0.1, 0.03), M.chrome(0.05));
    five.position.set(-0.9, -0.52, 0.1);
    card.add(five);
    const e = new THREE.Group();
    e.add(new THREE.Mesh(extrude(logo.white, { depth: 0.06, bevel: 0.015 }), M.chrome()));
    e.add(new THREE.Mesh(extrude(logo.volt, { depth: 0.06, bevel: 0.015 }), M.lime()));
    e.scale.setScalar(0.95 / logo.width);
    e.position.set(1.05, 0.66, 0.09);
    card.add(e);
    g.add(card);
    g.rotation.set(-0.85, 0.2, 0.3);
    return g;
  },

  hourglass: () => {
    const g = new THREE.Group();
    // hollow glass: closed profile = outer wall down, inner wall back up
    const H = 1.5;
    const outer = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = H - t * 2 * H;
      const r = 0.12 + 0.86 * Math.pow(Math.abs(Math.sin(t * Math.PI)), 0.75) * (1 - 0.15 * Math.abs(y / H));
      outer.push(new THREE.Vector2(r, y));
    }
    const wall = 0.045;
    const prof = [...outer, ...outer.slice().reverse().map((p) => new THREE.Vector2(Math.max(0.02, p.x - wall), p.y))];
    const bulb = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), M.glass("#e6f4ee", 25, 0));
    g.add(bulb);
    // sand: mound below, remainder above, thin stream
    const mound = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.62, 96, 1, false), M.sand());
    mound.position.y = -H + 0.42;
    g.add(mound);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.4, 0.3, 96), M.sand());
    base.position.y = -H + 0.12;
    g.add(base);
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.55, 96, 1, true), M.sand());
    top.rotation.x = Math.PI;
    top.position.y = 0.5;
    g.add(top);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.2, 12), M.sand());
    stream.position.y = -0.35;
    g.add(stream);
    // chrome frame
    [H + 0.12, -H - 0.12].forEach((y) => {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 128), M.chrome(0.08));
      d.position.y = y;
      g.add(d);
    });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2 * H + 0.24, 32), M.chrome(0.06));
      rod.position.set(Math.cos(a) * 1.02, 0, Math.sin(a) * 1.02);
      g.add(rod);
    }
    g.rotation.set(0.12, 0, -0.16);
    return g;
  },

  paid: ({ logo }) => {
    const g = PROPS.coins({ logo });
    const b = badge(0.66);
    b.position.set(0.15, 3.35, 0.9);
    b.rotation.set(-0.2, -0.25, 0);
    g.add(b);
    return g;
  },

  candles: () => {
    const g = new THREE.Group();
    const plinth = new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.36, 1.6, 6, 0.12), M.chrome(0.12));
    plinth.position.y = -0.18;
    g.add(plinth);
    const data = [[-1.65, 0.3, 1.1, true], [-0.82, 0.75, 0.75, false], [0, 0.9, 1.6, true], [0.82, 1.75, 0.95, false], [1.65, 2.0, 2.3, true]];
    data.forEach(([x, y, b, up]) => {
      const body = new THREE.Mesh(new RoundedBoxGeometry(0.58, b, 0.58, 6, 0.12), up ? M.lime() : M.emerald());
      body.position.set(x, y + b / 2 + 0.05, 0);
      g.add(body);
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, b + 0.8, 24), M.chrome());
      wick.position.set(x, y + b / 2 + 0.05, 0);
      g.add(wick);
    });
    g.rotation.y = -0.38;
    return g;
  },

  bolt: () => {
    const g = new THREE.Group();
    const P = [[0.35, 2.2], [-1.15, -0.15], [-0.05, -0.15], [-0.55, -2.2], [1.2, 0.45], [0.1, 0.45], [0.75, 2.2]];
    const b = new THREE.Mesh(shape(P, 0.55, 0.12), M.lime());
    g.add(b);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.07, 24, 220), M.chrome());
    ring.rotation.x = Math.PI / 2.35;
    g.add(ring);
    g.rotation.set(0.05, -0.4, -0.1);
    return g;
  },

  question: ({ font }) => {
    const g = new THREE.Group();
    const q = new THREE.Mesh(text("?", 2.6, 0.8, 0.1), M.chrome(0.06));
    g.add(q);
    g.rotation.set(0.04, -0.42, 0.08);
    return g;
  },
};

export default async function ({ log, only = "", spp = "500", size = "1000", out = "v2/pt" }) {
  const want = (n) => !only || only.split("|").includes(n);
  const logo = await traceLogo("/assets/logo.webp", 4.2);
  const font = null;
  const tracer = createTracer({ log, exposure: 1.0 });
  const S = Number(size);
  const env = LIGHTING.mist();
  const res = {};
  for (const [name, make] of Object.entries(PROPS)) {
    if (!want(name)) continue;
    log(`▸ ${name}`);
    const scene = new THREE.Scene();
    scene.environment = env;
    scene.background = null;
    const obj = make({ logo, font });
    scene.add(obj);
    const camera = physicalCamera({ fov: 28, aspect: 1, fStop: 0, focus: 10 });
    frame(camera, obj, { fill: 0.8, dir: new THREE.Vector3(0.18, 0.22, 1) });
    const canvas = await tracer.render(scene, camera, { w: S, h: S, samples: Number(spp) });
    preview(canvas);
    res[name] = (await save(canvas, `${out}/prop-${name}.png`)).bytes;
  }
  tracer.dispose();
  return res;
}
