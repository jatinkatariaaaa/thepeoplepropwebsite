// PHOTOREAL — "Ascent": the landing-page hero. Glass candlesticks climb like an
// equity curve through the lacquered showroom; the last, tallest candle is
// lime. Bodies are tinted glass, wicks chrome, and the candles float above a
// mirror-black floor so the reflection grounds them.
//
//   ?scene=pt-ascent&variant=hero|mobile&spp=700&tiles=10&scale=1
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { pathTrace, physicalCamera } from "../lib/pt.js";
import { save, preview } from "../lib/core.js";
import { showroom } from "./pt-showroom.js";
import { M } from "./pt-props.js";

const DEG = Math.PI / 180;
const BULL = () => M.glass("#3f9e85", 2.4);
const BEAR = () => M.glass("#cfeee4", 6);
const LIME = () => M.glass("#b9e82c", 1.8);

/* open, close, low, high — a rally with two shallow pullbacks; the last candle is the breakout */
const CANDLES = [
  [0.95, 1.75, 0.5, 2.05],
  [1.75, 2.6, 1.5, 2.85],
  [2.6, 2.2, 2.0, 2.8],
  [2.2, 3.35, 2.0, 3.6],
  [3.35, 4.15, 3.05, 4.45],
  [4.15, 3.8, 3.6, 4.4],
  [3.8, 5.05, 3.65, 5.3],
  [5.05, 6.5, 4.85, 6.85],
];

function candle([o, c, lo, hi], last) {
  const g = new THREE.Group();
  const top = Math.max(o, c);
  const bot = Math.min(o, c);
  const w = last ? 0.98 : 0.84;
  const mat = last ? LIME() : c >= o ? BULL() : BEAR();
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, top - bot, w, 6, 0.09), mat);
  body.position.y = (top + bot) / 2;
  g.add(body);
  const wick = (y0, y1) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, y1 - y0, 24), M.chrome(0.05));
    m.position.y = (y0 + y1) / 2;
    g.add(m);
  };
  wick(hi > top ? top : top - 0.01, Math.max(hi, top + 0.02));
  wick(Math.min(lo, bot - 0.02), bot);
  return g;
}

const SHOTS = {
  // desktop: the climb fills the right half, rising left → right; air on the left for type
  hero: { w: 2560, h: 1600, azim: -0.36, elev: 0.13, yaw: -0.22, fillV: 0.8, fillH: 0.56, cx: 0.66, cy: 0.47, fov: 26, fStop: 2.2 },
  // phone: frontal, across the top half
  mobile: { w: 1080, h: 1920, azim: -0.3, elev: 0.13, yaw: -0.62, fillV: 0.46, fillH: 0.8, cx: 0.47, cy: 0.29, fov: 34, fStop: 2.8 },
};

export default async function ({ log, variant = "hero", spp = "700", scale = "1", out = "art", ...q }) {
  const shot = SHOTS[variant];
  const k = Number(scale);
  const w = Math.round(shot.w * k);
  const h = Math.round(shot.h * k);
  log(`▸ ascent ${variant} ${w}×${h}`);
  const canvas = await pathTrace({
    w,
    h,
    samples: Number(spp),
    log,
    tiles: Number(q.tiles ?? 8),
    build: async () => {
      const scene = new THREE.Scene();
      const g = new THREE.Group();
      CANDLES.forEach((cd, i) => {
        const c = candle(cd, i === CANDLES.length - 1);
        c.position.set(i * 1.02, 0, -i * 0.26);
        g.add(c);
      });
      g.rotation.y = Number(q.yaw ?? shot.yaw);
      g.updateMatrixWorld(true);
      scene.add(g);

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshPhysicalMaterial({ color: 0x030605, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      // fit the climb, then shift-lens it to (cx, cy) so verticals stay straight
      const box = new THREE.Box3().setFromObject(g);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const camera = physicalCamera({ fov: shot.fov, aspect: w / h, fStop: Number(q.fstop ?? shot.fStop), focus: 10 });
      const hfov = 2 * Math.atan(Math.tan((shot.fov * DEG) / 2) * (w / h));
      const span = Math.max(size.x, size.z);
      const vfov = shot.fov * DEG;
      const dist =
        Math.max(size.y / 2 / (Math.tan(vfov / 2) * Number(q.fillv ?? shot.fillV)), span / 2 / (Math.tan(hfov / 2) * Number(q.fillh ?? shot.fillH))) + size.z / 2;
      const dir = new THREE.Vector3(Math.sin(shot.azim) * Math.cos(shot.elev), Math.sin(shot.elev), Math.cos(shot.azim) * Math.cos(shot.elev));
      camera.position.copy(center).addScaledVector(dir, dist);
      camera.lookAt(center);
      const S = 2.4;
      camera.fov = (2 * Math.atan(S * Math.tan((shot.fov * DEG) / 2))) / DEG;
      camera.setViewOffset(S * w, S * h, (S / 2 - Number(q.cx ?? shot.cx)) * w, (S / 2 - Number(q.cy ?? shot.cy)) * h, w, h);
      camera.updateProjectionMatrix();
      camera.focusDistance = dist;

      const env = showroom({ wash: Number(q.wash ?? 0.26), washAz: Math.atan2(-dir.z, -dir.x) / DEG, washW: 18, washH: 10, washEl: 5, washSoft: 0.8, bars: Number(q.bars ?? 1.1), kicker: Number(q.kicker ?? 0) });
      scene.environment = env;
      scene.background = env;
      const top = new THREE.RectAreaLight(0xffffff, 10, 10, 3.2);
      top.position.set(center.x + 0.8, 8.5, center.z + 3.2);
      top.lookAt(center.x, 2.5, center.z);
      scene.add(top);
      return { scene, camera };
    },
  });
  preview(canvas);
  const name = variant === "hero" ? "ascent-hero" : "ascent-mobile";
  return { [name]: (await save(canvas, `${out}/${name}${k !== 1 ? "-test" : ""}.png`)).bytes };
}
