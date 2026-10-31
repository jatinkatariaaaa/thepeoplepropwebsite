// TPP asset studio — tiny static server + PNG sink.
// Usage: node server.mjs <outDir> [port]
// GET  /...                      static files from this folder (incl. node_modules/three)
// POST /save?path=sub/name.png   writes the request body into <outDir>/sub/name.png
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] ?? path.join(root, "out"));
const port = Number(process.argv[3] ?? 4517);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const SAFE = /^[a-z0-9][a-z0-9/_.-]*\.(png|jpg)$/i;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);

  if (req.method === "POST" && url.pathname === "/save") {
    const rel = url.searchParams.get("path") ?? "";
    if (!SAFE.test(rel) || rel.includes("..")) {
      res.writeHead(400).end("bad path");
      return;
    }
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(dest, buf);
      console.log(`saved ${rel} (${(buf.length / 1024).toFixed(0)} KB)`);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, bytes: buf.length, dest }));
    });
    return;
  }

  let file = path.join(root, decodeURIComponent(url.pathname));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`asset studio on http://localhost:${port} -> ${outDir}`);
});
