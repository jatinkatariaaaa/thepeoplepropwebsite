// Minimal path-tracer probe: is anything accumulated, and does it reach the canvas?
import * as THREE from "three";
import { WebGLPathTracer } from "three-gpu-pathtracer";
import { LIGHTING } from "../lib/pt.js";

export default async function ({ log, spp = "16", tiles = "1", bounces = "4" }) {
  const w = 320;
  const h = 180;
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setSize(w, h, false);
  renderer.toneMapping = THREE.NeutralToneMapping;
  document.body.appendChild(renderer.domElement);
  const gl = renderer.getContext();

  const scene = new THREE.Scene();
  scene.environment = LIGHTING.pearl();
  scene.background = new THREE.Color(0xdddddd);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.02, ior: 1.5 }));
  scene.add(ball);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  scene.add(floor);
  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
  camera.position.set(0, 1, 6);
  camera.lookAt(0, 0, 0);

  const pt = new WebGLPathTracer(renderer);
  pt.bounces = Number(bounces);
  pt.renderDelay = 0;
  pt.minSamples = 0;
  pt.fadeDuration = 0;
  pt.rasterizeScene = false;
  pt.tiles.set(Number(tiles), Number(tiles));
  pt.setScene(scene, camera);
  const t0 = performance.now();
  let calls = 0;
  while (pt.samples < Number(spp) && performance.now() - t0 < 400000) {
    pt.renderSample();
    calls++;
    if (calls % 2 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  log(`samples=${pt.samples} calls=${calls} t=${((performance.now() - t0) / 1000).toFixed(1)}s glError=${gl.getError()}`);

  // 1) what is inside the accumulation target?
  const target = pt.target;
  log(`target ${target ? target.width + "x" + target.height + " type=" + target.texture.type : "none"}`);
  if (target) {
    const buf = target.texture.type === THREE.FloatType ? new Float32Array(4 * 4) : new Uint16Array(4 * 4);
    renderer.readRenderTargetPixels(target, Math.floor(w / 2), Math.floor(h / 2), 2, 2, buf);
    log(`target center px: ${Array.from(buf).slice(0, 4).map((v) => (typeof v === "number" ? v.toFixed(3) : v)).join(", ")}`);
  }
  // 2) what is on the canvas?
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  g.drawImage(renderer.domElement, 0, 0);
  const px = g.getImageData(w / 2, h / 2, 1, 1).data;
  log(`canvas center px: ${Array.from(px).join(",")}`);
  return { ok: true };
}
