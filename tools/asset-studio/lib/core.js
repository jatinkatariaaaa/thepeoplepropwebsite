// Shared rendering core for the TPP "Obsidian & Volt" asset family.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export const VOLT = new THREE.Color("#cbfb45");
export const VOLT_DEEP = new THREE.Color("#7fbf00");
export const INK = new THREE.Color("#050605");

/* ───────────────────────── renderer ───────────────────────── */

export function makeRenderer(w, h, { alpha = false, exposure = 1.0, shadows = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha,
    preserveDrawingBuffer: true,
    premultipliedAlpha: false,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (alpha) renderer.setClearColor(0x000000, 0);
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
  }
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:min(100vw,900px);height:auto;display:block;background:#222";
  return renderer;
}

/* ───────────────────── studio environment ─────────────────────
   A dark cyclorama lit by long strip softboxes — the reflections
   these produce are what make chrome and black glass read as
   "product photography" instead of flat CG. */

function gradientTex(stops, vertical = true) {
  const c = document.createElement("canvas");
  c.width = vertical ? 4 : 256;
  c.height = vertical ? 256 : 4;
  const g = c.getContext("2d");
  const grd = vertical ? g.createLinearGradient(0, 0, 0, 256) : g.createLinearGradient(0, 0, 256, 0);
  stops.forEach(([t, v]) => grd.addColorStop(t, `rgb(${v},${v},${v})`));
  g.fillStyle = grd;
  g.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function studioEnv(renderer, { volt = 1.0, white = 1.0, warm = 0.0, floorGlow = 0.0, front = 1.0, sky = 0.0 } = {}) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x020302);

  // Cyclorama. sky=0: near-black with a faint horizon (obsidian / glass shots).
  // sky>0: a "chrome horizon" all the way round so polished metal reads silver.
  const k = (v) => Math.round(Math.min(255, v));
  const stops =
    sky > 0
      ? [[0, k(235 * sky)], [0.28, k(170 * sky)], [0.45, k(95 * sky)], [0.5, 10], [0.535, k(55 * sky)], [0.72, k(38 * sky)], [1, 8]]
      : [[0, 10], [0.46, 22], [0.5, 40], [0.56, 14], [1, 6]];
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(50, 64, 32),
    new THREE.MeshBasicMaterial({ map: gradientTex(stops), side: THREE.BackSide }),
  );
  env.add(room);

  const box = (w, h, color, intensity, pos, look = [0, 0, 0], grad = null) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        map: grad,
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
    return m;
  };
  const soft = gradientTex([[0, 255], [0.55, 200], [1, 40]]);
  const strip = gradientTex([[0, 40], [0.2, 255], [0.8, 255], [1, 40]], false);

  // Big front panel with a "chrome horizon": bright sky, dark band, lit ground.
  // Faces pointing at the camera reflect this, which is what reads as polished metal.
  if (front > 0) {
    const horizon = gradientTex([[0, 255], [0.38, 190], [0.47, 120], [0.5, 22], [0.54, 70], [0.7, 120], [1, 30]]);
    box(56, 34, 0xffffff, 1.9 * white * front, [0, 3, 26], [0, 0, 0], horizon);
  }
  // Overhead strip
  box(28, 4, 0xffffff, 3.0 * white, [0, 24, 2], [0, 0, 0], strip);
  // Side strips (long, thin) → crisp edge highlights
  box(4, 32, 0xffffff, 2.6 * white, [-22, 4, 8], [0, 0, 0], strip);
  box(2.4, 32, 0xffffff, 1.5 * white, [22, 6, -2], [0, 0, 0], strip);
  // Rim from behind
  box(22, 3, 0xffffff, 2.0 * white, [0, 9, -24], [0, 0, 0], strip);
  // Low fill so undersides read
  box(30, 6, 0xffffff, 0.35 * white, [0, -18, 14], [0, 0, 0], soft);
  // Volt kicker strips — brand colour in every reflection
  if (volt > 0) {
    box(3, 28, VOLT.getHex(), 2.8 * volt, [19, -2, 13], [0, 0, 0], strip);
    box(22, 2.4, VOLT.getHex(), 1.6 * volt, [-4, -12, 19], [0, 0, 0], strip);
    box(2, 20, VOLT.getHex(), 2.2 * volt, [-20, 0, -15], [0, 0, 0], strip);
  }
  if (warm > 0) box(12, 12, 0xffe2c0, warm, [-16, 14, 16]);
  if (floorGlow > 0) box(40, 40, VOLT.getHex(), floorGlow, [0, -24, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return tex;
}

/* ───────────────────────── materials ───────────────────────── */

export const mat = {
  obsidian: (o = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: 0x0b0d0b,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.25,
      ...o,
    }),
  chrome: (o = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: 0xdfe3e6,
      metalness: 1,
      roughness: 0.14,
      envMapIntensity: 1.4,
      ...o,
    }),
  titanium: (o = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: 0x8c9296,
      metalness: 1,
      roughness: 0.32,
      envMapIntensity: 1.2,
      ...o,
    }),
  voltGlass: (o = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: 0xe8ffb0,
      metalness: 0,
      roughness: 0.06,
      transmission: 1,
      thickness: 1.4,
      ior: 1.52,
      attenuationColor: new THREE.Color("#9fe01a"),
      attenuationDistance: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: 0.35,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.6,
      specularIntensity: 1,
      ...o,
    }),
  smokeGlass: (o = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.08,
      transmission: 1,
      thickness: 1.2,
      ior: 1.5,
      attenuationColor: new THREE.Color("#2a302b"),
      attenuationDistance: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.5,
      ...o,
    }),
  voltSolid: (o = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#a9ea12"),
      metalness: 0.25,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: VOLT,
      emissiveIntensity: 0.1,
      envMapIntensity: 1.25,
      ...o,
    }),
  neon: (intensity = 3, o = {}) =>
    new THREE.MeshBasicMaterial({
      color: VOLT.clone().multiplyScalar(intensity),
      toneMapped: false,
      ...o,
    }),
};

/* ───────────────────────── post ───────────────────────── */

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 0.55 },
    uGrain: { value: 0.045 },
    uTint: { value: new THREE.Vector3(0.97, 1.0, 0.96) },
    uLift: { value: new THREE.Vector3(0.006, 0.009, 0.006) },
    uSeed: { value: Math.random() * 100 },
    uAberration: { value: 0.0012 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uVignette; uniform float uGrain; uniform vec3 uTint; uniform vec3 uLift; uniform float uSeed; uniform float uAberration;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5;
      float d = length(c);
      vec2 off = c * uAberration * d * 4.0;
      vec4 col = texture2D(tDiffuse, vUv);
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.b = texture2D(tDiffuse, vUv - off).b;
      col.rgb = col.rgb * uTint + uLift;
      float vig = smoothstep(0.85, 0.18, d * (1.0 + uVignette));
      col.rgb *= mix(1.0, vig, uVignette);
      float g = hash(vUv * 1024.0) - 0.5;
      col.rgb += g * uGrain;
      gl_FragColor = col;
    }`,
};

export function makeComposer(renderer, scene, camera, w, h, { bloom = 0.6, radius = 0.5, threshold = 0.82, grade = {} } = {}) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: w * h > 4e6 ? 2 : 6 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  if (bloom > 0) composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), bloom, radius, threshold));
  composer.addPass(new OutputPass());
  const gradePass = new ShaderPass(GradeShader);
  Object.entries(grade).forEach(([k, v]) => {
    if (gradePass.uniforms[k]) gradePass.uniforms[k].value = v;
  });
  composer.addPass(gradePass);
  return composer;
}

/* ───────────────────────── helpers ───────────────────────── */

export function softDotTexture(size = 128, falloff = 2.2) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    grd.addColorStop(t, `rgba(255,255,255,${Math.pow(1 - t, falloff).toFixed(3)})`);
  }
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft elliptical contact shadow that composites cleanly on any background. */
export function contactShadow(width = 4, depth = 2, opacity = 0.55) {
  const tex = softDotTexture(256, 1.6);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: tex, color: 0x000000, transparent: true, opacity, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────────────────── output ───────────────────────── */

/** Downscale a supersampled canvas in halving steps for clean anti-aliasing. */
export function downscale(src, w, h) {
  let cur = src;
  let cw = src.width;
  let ch = src.height;
  while (cw / 2 >= w * 0.999 && ch / 2 >= h * 0.999 && cw / 2 >= w) {
    const c = document.createElement("canvas");
    c.width = Math.round(cw / 2);
    c.height = Math.round(ch / 2);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(cur, 0, 0, c.width, c.height);
    cur = c;
    cw = c.width;
    ch = c.height;
  }
  if (cw !== w || ch !== h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(cur, 0, 0, w, h);
    cur = c;
  }
  return cur;
}

/** Copy the GL canvas into a plain 2D canvas (so we can post-process pixels). */
export function snapshot(glCanvas) {
  const c = document.createElement("canvas");
  c.width = glCanvas.width;
  c.height = glCanvas.height;
  c.getContext("2d").drawImage(glCanvas, 0, 0);
  return c;
}

/**
 * Additive glow → straight-alpha layer, so a bloom render on black can sit
 * underneath a transparent beauty render.
 */
export function glowToAlpha(canvas, strength = 1.0) {
  const g = canvas.getContext("2d");
  const img = g.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255;
    const gg = d[i + 1] / 255;
    const b = d[i + 2] / 255;
    const a = Math.min(1, Math.max(r, gg, b) * strength);
    if (a < 0.002) {
      d[i + 3] = 0;
      continue;
    }
    d[i] = Math.min(255, (r / a) * 255 * Math.min(1, strength));
    d[i + 1] = Math.min(255, (gg / a) * 255 * Math.min(1, strength));
    d[i + 2] = Math.min(255, (b / a) * 255 * Math.min(1, strength));
    d[i + 3] = a * 255;
  }
  g.putImageData(img, 0, 0);
  return canvas;
}

export function composite(layers, w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  for (const l of layers) {
    g.globalAlpha = l.alpha ?? 1;
    g.globalCompositeOperation = l.op ?? "source-over";
    g.drawImage(l.canvas, 0, 0, w, h);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  return c;
}

export async function save(canvas, relPath, type = "image/png", quality) {
  const blob = await new Promise((r) => canvas.toBlob(r, type, quality));
  const res = await fetch(`/save?path=${encodeURIComponent(relPath)}`, { method: "POST", body: blob });
  const json = await res.json();
  return json;
}

export function preview(canvas) {
  canvas.style.cssText = "width:min(100vw,900px);height:auto;display:block;margin:8px 0;background:repeating-conic-gradient(#2a2a2a 0 25%,#1d1d1d 0 50%) 0 0/24px 24px";
  document.body.appendChild(canvas);
}

/* ─────────────────────── render recipes ─────────────────────── */

const NEUTRAL_GRADE = {
  uVignette: 0,
  uGrain: 0,
  uAberration: 0,
  uLift: new THREE.Vector3(0, 0, 0),
  uTint: new THREE.Vector3(1, 1, 1),
};

/**
 * Transparent product shot. `build(renderer)` returns { scene, camera, glow? }
 * where glow() swaps materials for an emissive-only pass and returns a restore fn.
 */
export function renderObject({ build, w, h, ss = 2, exposure = 1, glowBloom = { strength: 1.4, radius: 0.75, threshold: 0.0 }, glowStrength = 1.0, shadows = false }) {
  const W = w * ss;
  const H = h * ss;
  const renderer = makeRenderer(W, H, { alpha: true, exposure, shadows });
  const { scene, camera, glow } = build(renderer);
  scene.background = null;
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  const beauty = snapshot(renderer.domElement);
  let out = beauty;
  if (glow) {
    const restore = glow();
    const bg = scene.background;
    const env = scene.environment;
    scene.background = new THREE.Color(0x000000);
    scene.environment = null;
    renderer.setClearColor(0x000000, 1);
    const composer = makeComposer(renderer, scene, camera, W, H, {
      bloom: glowBloom.strength,
      radius: glowBloom.radius,
      threshold: glowBloom.threshold,
      grade: NEUTRAL_GRADE,
    });
    composer.render();
    const g = glowToAlpha(snapshot(renderer.domElement), glowStrength);
    restore();
    scene.background = bg;
    scene.environment = env;
    out = composite([{ canvas: g }, { canvas: beauty }], W, H);
  }
  const final = downscale(out, w, h);
  renderer.dispose();
  renderer.domElement.remove();
  return final;
}

/** Opaque cinematic plate with bloom + grade. */
export function renderPlate({ build, w, h, ss = 2, exposure = 1, bloom = 0.7, radius = 0.6, threshold = 0.8, grade = {} }) {
  const W = w * ss;
  const H = h * ss;
  const renderer = makeRenderer(W, H, { alpha: false, exposure });
  const { scene, camera } = build(renderer);
  const composer = makeComposer(renderer, scene, camera, W, H, { bloom, radius, threshold, grade });
  composer.render();
  const out = downscale(snapshot(renderer.domElement), w, h);
  renderer.dispose();
  renderer.domElement.remove();
  return out;
}

/** Collect every mesh material so a glow pass can blank/emit them. */
export function glowSwap(scene, isEmitter) {
  const black = new THREE.MeshBasicMaterial({ color: 0x000000 });
  return () => {
    const saved = [];
    scene.traverse((o) => {
      if (!o.isMesh && !o.isPoints && !o.isLine) return;
      saved.push([o, o.material, o.visible]);
      const em = isEmitter(o);
      if (em === "hide") o.visible = false;
      else if (em) o.material = em === true ? o.material : em;
      else o.material = black;
    });
    return () => saved.forEach(([o, m, v]) => {
      o.material = m;
      o.visible = v;
    });
  };
}
