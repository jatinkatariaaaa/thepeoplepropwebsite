// Product-shot stage: identical lighting, framing and halo treatment for
// every transparent 3D prop, so the whole family reads as one shoot.
import * as THREE from "three";
import { studioEnv, renderObject, glowSwap, save, preview, mat, VOLT } from "./core.js";

/** Fit an object into the camera frustum, filling `fill` of the frame height. */
export function frame(camera, object, { fill = 0.74, dir = new THREE.Vector3(0, 0.18, 1), target } = {}) {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const center = target ?? sphere.center;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = sphere.radius / Math.sin(fov / 2);
  const fitW = sphere.radius / Math.sin(Math.atan(Math.tan(fov / 2) * camera.aspect));
  const dist = Math.max(fitH, fitW) * (1 / fill) * 0.92;
  camera.position.copy(center).addScaledVector(dir.clone().normalize(), dist);
  camera.near = dist / 50;
  camera.far = dist * 10;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

/** Tag meshes that should emit in the halo pass. */
export function glowing(obj, on = true) {
  obj.traverse((o) => {
    if (o.isMesh) o.userData.glow = on;
  });
  return obj;
}

/**
 * Render one transparent prop.
 * make(scene) must add the object and return it.
 */
export async function shot({ path, make, w = 1000, h = 1000, fill = 0.74, dir, env = {}, exposure = 1.0, halo = 0.55, haloRadius = 0.4, lights = true }) {
  const build = (renderer) => {
    const scene = new THREE.Scene();
    scene.environment = studioEnv(renderer, { sky: 0.55, volt: 0.9, white: 1.0, ...env });
    if (lights) {
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(-4, 7, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(VOLT, 1.4);
      rim.position.set(5, 1, -6);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff, 0.08));
    }
    const obj = make(scene, renderer);
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 1000);
    frame(camera, obj, { fill, dir });
    const glow = glowSwap(scene, (o) => (o.userData.glow ? mat.neon(1.25) : o.userData.hideInGlow ? "hide" : false));
    return { scene, camera, glow };
  };
  const canvas = renderObject({
    build,
    w,
    h,
    ss: 2,
    exposure,
    glowStrength: halo,
    glowBloom: { strength: 0.85, radius: haloRadius, threshold: 0 },
  });
  preview(canvas);
  const r = await save(canvas, path);
  return r.bytes;
}
