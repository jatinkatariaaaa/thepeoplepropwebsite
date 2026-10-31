// Path-traced rendering for the photoreal TPP asset set.
// Glass, chrome and stone are lit by a procedural HDR studio (softboxes painted
// into an equirect map), so refraction, caustic glints and soft contact
// shadows come out physically — no bloom, no fake glows.
import * as THREE from "three";
import { WebGLPathTracer, PhysicalCamera } from "three-gpu-pathtracer";

const DEG = Math.PI / 180;

/**
 * Procedural HDR studio as an equirectangular float texture.
 * panels: { az, el, w, h, i, color?, soft? } in degrees; az measured with
 * three's convention (atan2(z, x)), so az=90 is +Z (behind a camera on +Z).
 */
export function studioHDR({ width = 1024, height = 512, top = 0.9, horizon = 1.0, bottom = 0.6, tint = [1, 1, 1], panels = [] } = {}) {
  const data = new Float32Array(width * height * 4);
  const smooth = (e0, e1, x) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < height; y++) {
    const v = (y + 0.5) / height;
    const el = (v - 0.5) * 180; // -90..90
    const base = el >= 0 ? horizon + (top - horizon) * smooth(0, 70, el) : horizon + (bottom - horizon) * smooth(0, -25, el);
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const az = (u - 0.5) * 360; // -180..180
      let r = base * tint[0];
      let g = base * tint[1];
      let b = base * tint[2];
      for (const p of panels) {
        let dAz = Math.abs(az - p.az);
        if (dAz > 180) dAz = 360 - dAz;
        const dEl = Math.abs(el - p.el);
        const s = p.soft ?? 0.35;
        const fa = 1 - smooth(p.w * (1 - s), p.w, dAz);
        const fe = 1 - smooth(p.h * (1 - s), p.h, dEl);
        const f = fa * fe;
        if (f <= 0) continue;
        if (p.mul !== undefined) {
          // flag: pull this region toward p.mul × its brightness
          const m = 1 - f * (1 - p.mul);
          r *= m;
          g *= m;
          b *= m;
          continue;
        }
        const c = p.color ?? [1, 1, 1];
        r += f * p.i * c[0];
        g += f * p.i * c[1];
        b += f * p.i * c[2];
      }
      const k = (y * width + x) * 4;
      data[k] = r;
      data[k + 1] = g;
      data[k + 2] = b;
      data[k + 3] = 1;
    }
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/** A few house lighting setups. */
export const LIGHTING = {
  // sea-mist studio: the room itself carries the brand atmosphere, so glass
  // refracts tinted light physically (no CSS colour wash needed)
  mist: () =>
    studioHDR({
      top: 0.55,
      horizon: 0.5,
      bottom: 0.32,
      tint: [0.78, 0.9, 0.87],
      panels: [
        { az: 90, el: 66, w: 58, h: 14, i: 6.5, color: [0.96, 1, 0.98] },
        { az: 128, el: 16, w: 7, h: 30, i: 16 },
        { az: 44, el: 12, w: 4, h: 30, i: 10 },
        { az: -92, el: 24, w: 40, h: 7, i: 7 },
        { az: 176, el: 4, w: 30, h: 55, mul: 0.03, soft: 0.45 },
        { az: 6, el: 2, w: 24, h: 50, mul: 0.05, soft: 0.45 },
        { az: -140, el: -6, w: 46, h: 30, mul: 0.08, soft: 0.6 },
        { az: 90, el: -30, w: 60, h: 25, mul: 0.35, soft: 0.6 },
      ],
    }),
  // glass-on-white product studio: grey room, black flags for edge definition,
  // a few big softboxes for the long specular "windows" in the glass
  glass: () =>
    studioHDR({
      top: 0.5,
      horizon: 0.42,
      bottom: 0.3,
      panels: [
        { az: 90, el: 64, w: 64, h: 18, i: 7 },
        { az: 132, el: 18, w: 11, h: 32, i: 12 },
        { az: 38, el: 14, w: 6, h: 34, i: 7 },
        { az: -90, el: 22, w: 44, h: 9, i: 6 },
        { az: 178, el: 5, w: 26, h: 50, mul: 0.06, soft: 0.5 }, // flag left
        { az: 0, el: 0, w: 22, h: 45, mul: 0.12, soft: 0.5 }, // flag right
        { az: -150, el: -10, w: 40, h: 30, mul: 0.15, soft: 0.6 }, // flag back-left low
      ],
    }),
  // bright white product studio (Apple-style): big overhead + front + side strips
  pearl: () =>
    studioHDR({
      top: 1.15,
      horizon: 1.0,
      bottom: 0.75,
      panels: [
        { az: 90, el: 62, w: 70, h: 22, i: 9 }, // overhead front
        { az: 140, el: 22, w: 14, h: 30, i: 14 }, // key, front-left
        { az: 30, el: 18, w: 8, h: 32, i: 8 }, // strip, right
        { az: -90, el: 25, w: 40, h: 10, i: 6 }, // rim from behind
        { az: 180, el: 10, w: 6, h: 35, i: 7 }, // hard left strip (edge line on glass)
      ],
    }),
  // dark charcoal studio with crisp strips (glass and chrome on black)
  noir: () =>
    studioHDR({
      top: 0.02,
      horizon: 0.03,
      bottom: 0.01,
      panels: [
        { az: 90, el: 58, w: 55, h: 16, i: 6 },
        { az: 150, el: 20, w: 9, h: 34, i: 16 },
        { az: 20, el: 15, w: 6, h: 36, i: 12 },
        { az: -90, el: 22, w: 46, h: 8, i: 9 },
        { az: -40, el: 5, w: 5, h: 30, i: 6, color: [0.75, 1.0, 0.85] },
      ],
    }),
  // soft overcast light with a warm key (chrome looks liquid, minimal hot spots)
  satin: () =>
    studioHDR({
      top: 1.6,
      horizon: 1.1,
      bottom: 0.45,
      tint: [0.97, 0.99, 1.0],
      panels: [
        { az: 120, el: 40, w: 50, h: 30, i: 5, color: [1.0, 0.97, 0.92] },
        { az: 20, el: 10, w: 10, h: 40, i: 6 },
        { az: -100, el: 20, w: 30, h: 12, i: 4 },
      ],
    }),
};

/** Seamless cyclorama: floor that curves up into a back wall. */
export function cyclorama({ width = 80, depth = 40, height = 30, radius = 10, material } = {}) {
  const shape = [];
  const steps = 32;
  shape.push(new THREE.Vector2(depth, 0));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    shape.push(new THREE.Vector2(-depth / 2 + radius - Math.sin(a) * radius, radius - Math.cos(a) * radius));
  }
  shape.push(new THREE.Vector2(-depth / 2, height));
  // extrude the profile along X
  const pts = shape;
  const pos = [];
  const idx = [];
  const half = width / 2;
  pts.forEach((p) => {
    pos.push(-half, p.y, p.x);
    pos.push(half, p.y, p.x);
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = material ?? new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.55 });
  m.side = THREE.DoubleSide;
  return new THREE.Mesh(geo, m);
}

export function physicalCamera({ fov = 30, aspect = 16 / 9, fStop = 0, focus = 10, blades = 6 } = {}) {
  const cam = new PhysicalCamera(fov, aspect, 0.05, 500);
  cam.fStop = fStop > 0 ? fStop : 1e6;
  cam.focusDistance = focus;
  cam.apertureBlades = blades;
  return cam;
}

/**
 * Accumulate `samples` path-traced samples. build(renderer) → { scene, camera }.
 * Returns a 2D canvas (straight alpha when the scene background is null).
 */
export async function pathTrace({
  build,
  w,
  h,
  samples = 400,
  bounces = 12,
  transmissiveBounces = 14,
  exposure = 1,
  toneMapping = THREE.NeutralToneMapping,
  filterGlossy = 0.25,
  log = () => {},
  tiles = 6,
}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  // Windows resets the GPU if one draw runs ~2s (TDR); small tiles keep every
  // draw short, and a lost context must fail loudly instead of saving a blank.
  let lost = false;
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    lost = true;
    e.preventDefault();
    log("  !! WebGL context lost");
  });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  renderer.toneMapping = toneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:min(100vw,900px);height:auto;display:block;background:repeating-conic-gradient(#2a2a2a 0 25%,#1d1d1d 0 50%) 0 0/24px 24px";

  const { scene, camera } = await build(renderer);
  const pt = new WebGLPathTracer(renderer);
  pt.bounces = bounces;
  pt.transmissiveBounces = transmissiveBounces;
  pt.filterGlossyFactor = filterGlossy;
  pt.renderDelay = 0;
  pt.minSamples = 0;
  pt.fadeDuration = 0;
  pt.rasterizeScene = false;
  pt.dynamicLowRes = false;
  pt.renderScale = 1;
  pt.tiles.set(tiles, tiles);
  pt.textureSize.set(2048, 2048);
  pt.setScene(scene, camera);

  const t0 = performance.now();
  let last = t0;
  let calls = 0;
  while (pt.samples < samples) {
    if (lost) throw new Error("WebGL context lost while path tracing — use more tiles or fewer bounces");
    pt.renderSample();
    calls++;
    // yield regularly so the GPU queue drains and the watchdog never trips
    if (calls % 4 === 0) await new Promise((r) => setTimeout(r, 0));
    if (performance.now() - last > 5000) {
      last = performance.now();
      log(`  ${pt.samples.toFixed(1)}/${samples} spp · ${((performance.now() - t0) / 1000).toFixed(0)}s · compiling=${pt.isCompiling}`);
    }
  }
  if (lost) throw new Error("WebGL context lost while path tracing");
  log(`  done ${Math.floor(pt.samples)} spp in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d").drawImage(renderer.domElement, 0, 0);
  // a reset during read-back yields an empty canvas: never save that as a finished plate
  const probe = out.getContext("2d").getImageData(Math.floor(w / 2), Math.floor(h / 2), 1, 1).data;
  if (lost || (probe[0] === 0 && probe[1] === 0 && probe[2] === 0 && probe[3] === 0)) throw new Error("WebGL context lost during read-back");
  pt.dispose?.();
  renderer.dispose();
  renderer.domElement.remove();
  return out;
}

export { DEG };

/**
 * One WebGL context + path tracer reused for many shots, so the (large)
 * path-tracing shader compiles once per batch instead of once per image.
 */
export function createTracer({ toneMapping = THREE.NeutralToneMapping, exposure = 1, bounces = 12, transmissiveBounces = 14, filterGlossy = 0.25, tiles = 6, log = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  let lost = false;
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    lost = true;
    e.preventDefault();
    log("  !! WebGL context lost");
  });
  renderer.setPixelRatio(1);
  renderer.toneMapping = toneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:min(100vw,600px);height:auto;display:block;background:repeating-conic-gradient(#2a2a2a 0 25%,#1d1d1d 0 50%) 0 0/24px 24px";
  const pt = new WebGLPathTracer(renderer);
  pt.bounces = bounces;
  pt.transmissiveBounces = transmissiveBounces;
  pt.filterGlossyFactor = filterGlossy;
  pt.renderDelay = 0;
  pt.minSamples = 0;
  pt.fadeDuration = 0;
  pt.rasterizeScene = false;
  pt.dynamicLowRes = false;
  pt.renderScale = 1;
  pt.tiles.set(tiles, tiles);
  pt.textureSize.set(2048, 2048);

  return {
    renderer,
    async render(scene, camera, { w, h, samples = 400, exposure: ex } = {}) {
      if (ex !== undefined) renderer.toneMappingExposure = ex;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      pt.setScene(scene, camera);
      const t0 = performance.now();
      let calls = 0;
      while (pt.samples < samples) {
        if (lost) throw new Error("WebGL context lost while path tracing");
        pt.renderSample();
        if (++calls % 4 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      log(`  ${Math.floor(pt.samples)} spp in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
      const out = document.createElement("canvas");
      out.width = w;
      out.height = h;
      out.getContext("2d").drawImage(renderer.domElement, 0, 0);
      return out;
    },
    dispose() {
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
