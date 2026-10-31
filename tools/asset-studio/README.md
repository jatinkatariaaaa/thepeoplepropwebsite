# TPP asset studio

Renders every image used by the `/v2` landing page. The scenes are original
Three.js scenes, **path traced** with
[three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer). That
means real refraction through the glass, mirror and glossy reflections, caustics
and depth of field, with no bloom and no painted glows. The TPP wordmark is traced
from the real logo (`assets/logo.webp`), so the 3D letters are the brand's exact
shapes.

## Setup

```bash
cd tools/asset-studio
npm install
npm run studio      # http://localhost:4517 — renders are written into ../../public
```

## Render

Each URL renders one scene and saves PNGs under `public/v2/pt/`. Open it in
Chrome, or run it headless:

```bash
node run-headless.mjs "http://localhost:4517/?scene=pt-props" 2400
```

| URL | Output |
| --- | --- |
| `/?scene=pt-showroom&variant=hero&spp=700&tiles=10` | `emblem-hero.png`: desktop hero plate (2560×1600) |
| `/?scene=pt-showroom&variant=mobile&spp=700` | `emblem-mobile.png`: phone hero plate (1080×1920) |
| `/?scene=pt-showroom&variant=cta&spp=600&tiles=10` | `noir-hero.png`: closing call-to-action plate (2400×1350) |
| `/?scene=pt-showroom&variant=cta-mobile&spp=600` | `noir-mobile.png` (1080×1600) |
| `/?scene=pt-props&spp=400&size=800` (`&only=coins\|bolt…`) | `prop-*.png`: transparent 3D objects |
| `/?scene=pt-pages&spp=420` (`&only=challenges\|rules…`) | `page-*.png`: one hero plate per inner page (2200×1100) |
| `/?scene=logo-check` | `logo-check-test.png`: 2D check of the traced wordmark outline |
| `/?scene=logosvg` | prints the traced wordmark paths used in `logo.tsx` |
| `/?scene=pt-debug` | small probe that shows whether path tracing works on this GPU |

Useful query parameters:

- `scale=0.3` renders a quick low-resolution test (the file gets a `-test` suffix).
- `spp` sets samples per pixel: about 80–100 for layout checks, 600–700 for finals.
- `pt-showroom` framing and light can be changed per run:
  - framing: `eye=x,y,z`, `cx`, `cy`, `fov`, `yaw`
  - light: `wash`, `top`, `bars`
  - glass tints: `tp`/`tpd`, `pp`/`ppd`
  - `tiles` splits the frame into tiles; see the GPU note below.

Final renders take a while on a laptop GPU:

| Render | Time |
| --- | --- |
| Desktop hero (`tiles=10`) | about 22 min |
| Phone hero | about 12 min |
| CTA plate | about 15 min |
| All ten props at 800 px | about 11 min |
| Each inner-page plate | about 4–12 min |

Run one render at a time, and don't use the GPU heavily while one is running.

### Windows GPU note

Chrome's default ANGLE back-end (Direct3D 11) compiles the path-tracing shader
for about 100 s and then returns black frames. `run-headless.mjs` therefore
starts Chrome with `--use-angle=vulkan`. If you open the studio in your own
browser, launch Chrome with that flag too.

If a render stops with *"WebGL context lost"*, Windows reset the GPU because
one draw call ran too long. Raise `tiles` (for example `tiles=10`), and keep
other GPU-heavy apps closed.

## Optimise

```bash
python optimize.py ../../public/v2/pt ./renders
```

This converts the PNGs into the WebPs the page loads:

- `hero-desktop.webp` / `hero-mobile.webp`
- `cta-desktop.webp` / `cta-mobile.webp`
- `page-*.webp`, one hero plate per inner page
- `prop-*.webp`, trimmed to their content

The raw PNGs move into `./renders`, which git ignores.
