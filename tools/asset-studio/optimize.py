"""Turn path-traced PNGs in public/art into the WebPs the page uses, then archive the PNGs.
usage: python -I pt-optimize.py <public/art dir> <archive dir>
  emblem-hero.png   -> hero-desktop.webp   (opaque plate)
  emblem-mobile.png -> hero-mobile.webp
  noir-hero.png     -> cta-desktop.webp
  noir-mobile.png   -> cta-mobile.webp
  ascent-hero.png   -> ascent-hero.webp   (landing preview at /v2)
  ascent-mobile.png -> ascent-mobile.webp
  page-*.png        -> page-*.webp         (inner-page hero plates)
  prop-*.png        -> prop-*.webp         (transparent cut-outs)
  *-test.png        -> archived only"""
import sys, os, shutil
from PIL import Image

src, archive = sys.argv[1], sys.argv[2]
MAP = {
    "emblem-hero.png": ("hero-desktop.webp", 2560, 86, False),
    "emblem-mobile.png": ("hero-mobile.webp", 1080, 86, False),
    "noir-hero.png": ("cta-desktop.webp", 2400, 86, False),
    "noir-mobile.png": ("cta-mobile.webp", 1080, 86, False),
    "ascent-hero.png": ("ascent-hero.webp", 2560, 86, False),
    "ascent-mobile.png": ("ascent-mobile.webp", 1080, 86, False),
}
os.makedirs(archive, exist_ok=True)
tin = tout = 0
for f in sorted(os.listdir(src)):
    if not f.endswith(".png"):
        continue
    p = os.path.join(src, f)
    if f.endswith("-test.png"):
        shutil.move(p, os.path.join(archive, f))
        continue
    if f in MAP:
        name, maxw, q, alpha = MAP[f]
    elif f.startswith("page-"):
        name, maxw, q, alpha = f[:-4] + ".webp", 2200, 84, False
    elif f.startswith("prop-"):
        name, maxw, q, alpha = f[:-4] + ".webp", 900, 88, True
    else:
        continue
    im = Image.open(p)
    if alpha:
        im = im.convert("RGBA")
        bb = im.getchannel("A").point(lambda v: 255 if v > 3 else 0).getbbox()
        if bb:  # trim empty margins, keep a little air for drop shadows
            pad = 12
            im = im.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad)))
    else:
        im = im.convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    out = os.path.join(src, name)
    im.save(out, "WEBP", quality=q, method=6, alpha_quality=90)
    a, b = os.path.getsize(p), os.path.getsize(out)
    tin += a
    tout += b
    shutil.move(p, os.path.join(archive, f))
    print(f"{f:24s} -> {name:22s} {a/1024:8.0f} KB -> {b/1024:6.0f} KB  {im.size}")
print(f"TOTAL {tin/1048576:.1f} MB -> {tout/1048576:.2f} MB")
