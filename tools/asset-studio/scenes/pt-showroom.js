// PHOTOREAL — "autoshow" plates: the TPP wordmark in thick tinted glass on a
// dark lacquered floor, lit like a car reveal (overhead light bars, a key
// softbox, a hard edge strip and an emerald wash behind). Path traced, so the
// floor reflection, refraction and caustics are physical.
//
// Framing uses a shift lens (view offset) so verticals stay straight while the
// sculpture sits where the page layout needs it.
//
//   ?scene=pt-showroom&variant=hero|mobile|cta|cta-mobile&spp=700&scale=1
import * as THREE from "three";
import { pathTrace, studioHDR, physicalCamera } from "../lib/pt.js";
import { save, preview } from "../lib/core.js";
import { traceLogo, extrude } from "../lib/logo.js";

const glass = (tint, dist, rough = 0.01) =>
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: rough,
    transmission: 1,
    ior: 1.52,
    thickness: 1,
    attenuationColor: new THREE.Color(tint),
    attenuationDistance: dist,
  });

export const showroom = ({ wash = 0.35, washAz = -78, washW = 22, washH = 10, washEl = 4, washSoft = 0.8, bars = 1, kicker = 6 } = {}) =>
  studioHDR({
    width: 2048,
    height: 1024,
    top: 0.004,
    horizon: 0.01,
    bottom: 0.002,
    tint: [0.75, 1.0, 0.92],
    panels: [
      // overhead light bars in front of the sculpture → long streaks along the bevels
      { az: 90, el: 50, w: 80, h: 1.6, i: 30 * bars, soft: 0.5 },
      { az: 90, el: 61, w: 80, h: 1.6, i: 24 * bars, soft: 0.5 },
      { az: 90, el: 72, w: 80, h: 1.6, i: 18 * bars, soft: 0.5 },
      // key softbox, front-left
      { az: 145, el: 20, w: 12, h: 24, i: 8 },
      // hard strip on the right → a crisp white edge line
      { az: 28, el: 10, w: 2.6, h: 28, i: 16 },
      // emerald wash behind → the glass glows from within
      { az: washAz, el: washEl, w: washW, h: washH, i: wash, color: [0.22, 0.86, 0.6], soft: washSoft },
      // lime kicker low behind-right
      { az: -50, el: 2, w: 12, h: 8, i: kicker, color: [0.82, 1.0, 0.24], soft: 0.75 },
    ],
  });

/** Shift-lens framing: put `target` at (cx, cy) of the frame (0..1 from top-left). */
function shift(camera, w, h, cx, cy, winFov, S = 2.4) {
  camera.fov = (2 * Math.atan(S * Math.tan((winFov * Math.PI) / 360)) * 180) / Math.PI;
  camera.setViewOffset(S * w, S * h, (S / 2 - cx) * w, (S / 2 - cy) * h, w, h);
  camera.updateProjectionMatrix();
}

const SHOTS = {
  // desktop hero: sculpture upper-right, dark floor and air on the left for type
  hero: { w: 2560, h: 1600, eye: [-4.4, 1.0, 21], cx: 0.7, cy: 0.33, fov: 25, yaw: -0.42, f: 2.0 },
  // phone hero: sculpture across the top third
  mobile: { w: 1080, h: 1920, eye: [-2.6, 1.15, 26], cx: 0.5, cy: 0.25, fov: 34, yaw: -0.36, f: 2.8 },
  // closing CTA: low and close, sculpture rising from the bottom of the frame
  cta: { w: 2400, h: 1350, eye: [0.6, 0.55, 10.5], cx: 0.5, cy: 0.86, fov: 30, yaw: -0.18, f: 2.2 },
  "cta-mobile": { w: 1080, h: 1600, eye: [0.4, 0.7, 19], cx: 0.5, cy: 0.8, fov: 36, yaw: -0.2, f: 2.2 },
};

export default async function ({ log, variant = "hero", spp = "600", scale = "1", out = "art", ...q }) {
  const shot = { ...SHOTS[variant] };
  for (const k of ["cx", "cy", "fov", "yaw", "f"]) if (q[k] !== undefined) shot[k] = Number(q[k]);
  if (q.eye) shot.eye = q.eye.split(",").map(Number);
  const k = Number(scale);
  const w = Math.round(shot.w * k);
  const h = Math.round(shot.h * k);
  const logo = await traceLogo("/assets/logo.webp", 7.2);

  const canvas = await pathTrace({
    w,
    h,
    samples: Number(spp),
    log,
    tiles: Number(q.tiles ?? 8),
    exposure: Number(q.exposure ?? 1.0),
    build: () => {
      const scene = new THREE.Scene();
      const env = showroom({
        wash: Number(q.wash ?? 0.35),
        // the halo sits right behind the sculpture as seen from this camera
        washAz: q.washAz !== undefined ? Number(q.washAz) : (Math.atan2(-shot.eye[2], -shot.eye[0]) * 180) / Math.PI,
        washW: Number(q.washW ?? 22),
        washH: Number(q.washH ?? 10),
        washEl: Number(q.washEl ?? 4),
        washSoft: Number(q.washSoft ?? 0.8),
        bars: Number(q.bars ?? 1.4),
      });
      scene.environment = env;
      scene.background = env;

      // lacquered floor: dark, glossy, with a clear coat for the sharp mirror layer
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400),
        new THREE.MeshPhysicalMaterial({ color: 0x030605, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.09 }),
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const mark = new THREE.Group();
      const opts = { depth: 1.5, bevel: 0.2, bevelSegments: 12 };
      mark.add(new THREE.Mesh(extrude(logo.white, opts), glass(q.tp ?? "#3f9e85", Number(q.tpd ?? 2.6))));
      mark.add(new THREE.Mesh(extrude(logo.volt, opts), glass(q.pp ?? "#b9e82c", Number(q.ppd ?? 1.9))));
      mark.rotation.y = shot.yaw;
      mark.position.set(0, logo.height / 2 + 0.21, 0);
      scene.add(mark);

      // a softbox overhead pools light around the sculpture and falls off into the dark
      const top = new THREE.RectAreaLight(0xffffff, Number(q.top ?? 12), 9, 3.2);
      top.position.set(0.6, 6.5, 2.6);
      top.lookAt(0, 0.8, 0);
      scene.add(top);

      // light bars on the far wall — the autoshow backdrop; DOF softens them
      const nb = Number(q.nbars ?? 0);
      for (let i = 0; i < nb; i++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(Number(q.barw ?? 26), 0.07, 0.07),
          new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(0xd9fff1), emissiveIntensity: Number(q.bari ?? 5) }),
        );
        bar.position.set(Number(q.barx ?? 2), Number(q.bary ?? 3.4) + i * Number(q.bargap ?? 1.15), Number(q.barz ?? -14));
        scene.add(bar);
      }

      const target = new THREE.Vector3(0, logo.height / 2 + 0.21, 0);
      const camera = physicalCamera({ fov: shot.fov, aspect: w / h, fStop: shot.f, focus: new THREE.Vector3(...shot.eye).distanceTo(target) });
      camera.position.set(...shot.eye);
      camera.lookAt(target);
      shift(camera, w, h, shot.cx, shot.cy, shot.fov);
      return { scene, camera };
    },
  });
  preview(canvas);
  const name = variant === "hero" || variant === "mobile" ? `emblem-${variant === "hero" ? "hero" : "mobile"}` : variant === "cta" ? "noir-hero" : "noir-mobile";
  const r = await save(canvas, `${out}/${name}${k !== 1 ? "-test" : ""}.png`);
  return { bytes: r.bytes };
}
