// PHOTOREAL — the contest hero: twenty glass tokens in a ring on the showroom floor,
// one for each friend, around a lime glass card that reads "10K", the reward.
//
//   ?scene=pt-contest&variant=hero|mobile&spp=700&tiles=10&scale=1
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { pathTrace, physicalCamera } from "../lib/pt.js";
import { save, preview } from "../lib/core.js";
import { traceLogo, extrude } from "../lib/logo.js";
import { showroom } from "./pt-showroom.js";
import { M, text } from "./pt-props.js";

const DEG = Math.PI / 180;
const EMERALD = () => M.glass("#3f9e85", 2.4);
const MINT = () => M.glass("#cfeee4", 6);
const LIME = () => M.glass("#b9e82c", 1.8);

/** One friend: a glass token with a chrome rim. */
function token(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 72), mat);
  body.position.y = 0.1;
  g.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.026, 16, 120), M.chrome(0.05));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.2;
  g.add(rim);
  return g;
}

/** The reward: a lime glass card with a chrome TPP mark and "10K". */
function card(logo) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(2.4, 1.5, 0.14, 6, 0.12), LIME()));
  const label = new THREE.Mesh(text("10K", 0.66, 0.09, 0.028), M.chrome(0.04));
  label.position.set(0.32, -0.18, 0.1);
  g.add(label);
  const mark = new THREE.Group();
  mark.add(new THREE.Mesh(extrude(logo.white, { depth: 0.05, bevel: 0.016 }), M.chrome(0.05)));
  mark.add(new THREE.Mesh(extrude(logo.volt, { depth: 0.05, bevel: 0.016 }), M.chrome(0.05)));
  mark.scale.setScalar(0.6 / logo.width);
  mark.position.set(-0.7, 0.44, 0.09);
  g.add(mark);
  return g;
}

const SHOTS = {
  // desktop: the ring on the right half, seen from above the floor; air on the left for type
  hero: { w: 2560, h: 1600, azim: -0.34, elev: 0.27, fillV: 0.86, fillH: 0.62, cx: 0.66, cy: 0.5, fov: 26, fStop: 2.4 },
  // phone: across the top half
  mobile: { w: 1080, h: 1920, azim: -0.28, elev: 0.27, fillV: 0.5, fillH: 1.02, cx: 0.5, cy: 0.29, fov: 34, fStop: 2.8 },
};

export default async function ({ log, variant = "hero", spp = "700", scale = "1", out = "art", ...q }) {
  const shot = SHOTS[variant];
  const k = Number(scale);
  const w = Math.round(shot.w * k);
  const h = Math.round(shot.h * k);
  const logo = await traceLogo("/assets/logo.webp", 4.2);
  log(`▸ contest ${variant} ${w}×${h}`);
  const canvas = await pathTrace({
    w,
    h,
    samples: Number(spp),
    log,
    tiles: Number(q.tiles ?? 8),
    build: async () => {
      const scene = new THREE.Scene();
      const g = new THREE.Group();

      const R = 2.5;
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const t = token(i === 15 ? LIME() : i % 3 === 0 ? MINT() : EMERALD());
        t.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
        g.add(t);
      }

      const reward = card(logo);
      reward.position.set(0, 1.55, 0);
      reward.rotation.set(-0.04, -0.3, 0.03);
      g.add(reward);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 24), M.chrome(0.06));
      post.position.set(0, 0.4, 0);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.1, 96), M.chrome(0.12));
      base.position.set(0, 0.05, 0);
      g.add(post, base);

      g.rotation.y = Number(q.yaw ?? 0);
      g.updateMatrixWorld(true);
      scene.add(g);

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshPhysicalMaterial({ color: 0x030605, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const box = new THREE.Box3().setFromObject(g);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const camera = physicalCamera({ fov: shot.fov, aspect: w / h, fStop: Number(q.fstop ?? shot.fStop), focus: 10 });
      const vfov = shot.fov * DEG;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (w / h));
      const span = Math.max(size.x, size.z);
      const dist =
        Math.max(size.y / 2 / (Math.tan(vfov / 2) * Number(q.fillv ?? shot.fillV)), span / 2 / (Math.tan(hfov / 2) * Number(q.fillh ?? shot.fillH))) + size.z / 2;
      const dir = new THREE.Vector3(Math.sin(shot.azim) * Math.cos(shot.elev), Math.sin(shot.elev), Math.cos(shot.azim) * Math.cos(shot.elev));
      camera.position.copy(center).addScaledVector(dir, dist);
      camera.lookAt(center);
      const S = 2.4;
      camera.fov = (2 * Math.atan(S * Math.tan(vfov / 2))) / DEG;
      camera.setViewOffset(S * w, S * h, (S / 2 - Number(q.cx ?? shot.cx)) * w, (S / 2 - Number(q.cy ?? shot.cy)) * h, w, h);
      camera.updateProjectionMatrix();
      camera.focusDistance = dist;

      const env = showroom({ wash: Number(q.wash ?? 0.4), washAz: Math.atan2(-dir.z, -dir.x) / DEG, washW: 20, washH: 10, washEl: 5, washSoft: 0.8, bars: Number(q.bars ?? 1.4), kicker: Number(q.kicker ?? 0) });
      scene.environment = env;
      scene.background = env;
      const top = new THREE.RectAreaLight(0xffffff, 14, 10, 3.2);
      top.position.set(center.x + 0.8, 8, center.z + 3);
      top.lookAt(center.x, 1, center.z);
      scene.add(top);
      return { scene, camera };
    },
  });
  preview(canvas);
  const name = variant === "hero" ? "contest-hero" : "contest-mobile";
  return { [name]: (await save(canvas, `${out}/${name}${k !== 1 ? "-test" : ""}.png`)).bytes };
}
