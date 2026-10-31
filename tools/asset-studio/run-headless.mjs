// Runs an asset-studio scene in headless Chrome and waits for window.__status.
// usage: node run-headless.mjs "<studio url>" [timeoutSec=300]
//   CHROME_PATH   Chrome executable (defaults to the standard Windows install)
//   CHROME_FLAGS  extra flags; defaults to --use-angle=vulkan because the D3D11
//                 back-end returns black frames for the path tracer (see README)
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [url, T = "300"] = process.argv.slice(2);
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9800 + Math.floor(Math.random() * 300);
// persistent profile → Chrome keeps its GPU shader cache between renders
const profile = path.join(os.tmpdir(), "tpp-studio-profile");
fs.mkdirSync(profile, { recursive: true });
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--ignore-gpu-blocklist",
    "--window-size=1200,900",
    ...(process.env.CHROME_FLAGS ?? "--use-angle=vulkan").split(" ").filter(Boolean),
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// hard stop: if the GPU wedges the page, CDP calls can hang forever — never outlive the budget
setTimeout(() => {
  console.log("STATUS: watchdog");
  try {
    chrome.kill();
  } catch {}
  process.exit(2);
}, (Number(T) + 90) * 1000).unref();
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (r.ok) wsUrl = (await r.json()).webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(150);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
const pending = new Map();
const consoleLines = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method === "Runtime.consoleAPICalled" && /error|warn/.test(m.params.type)) {
    consoleLines.push(`[${m.params.type}] ` + m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 600));
  } else if (m.method === "Runtime.exceptionThrown") {
    consoleLines.push("[exception] " + (m.params.exceptionDetails?.exception?.description ?? "").slice(0, 600));
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
let status = "timeout";
try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable");
  await s("Runtime.enable");
  await s("Page.navigate", { url });
  const deadline = Date.now() + Number(T) * 1000;
  while (Date.now() < deadline) {
    await sleep(1000);
    const r = await Promise.race([
      s("Runtime.evaluate", { expression: "[window.__status, (document.getElementById('log')||{}).textContent]", returnByValue: true }),
      sleep(20000).then(() => ({ result: { value: [] } })),
    ]);
    const [st, log] = r.result.value ?? [];
    if (st && st !== "running") {
      status = st;
      console.log(log);
      break;
    }
  }
} finally {
  if (consoleLines.length) console.log(["CONSOLE:", ...consoleLines.slice(0, 12)].join(String.fromCharCode(10)));
  console.log("STATUS:", status);
  try {
    await send("Browser.close");
  } catch {}
  ws.close();
  setTimeout(() => {
    try {
      chrome.kill();
    } catch {}
  }, 500);
}
