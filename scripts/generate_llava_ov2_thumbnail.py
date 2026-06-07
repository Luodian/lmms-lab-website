"""
Generate the LLaVA-OneVision-2 thumbnail by halftoning a real source image.

Source: a speed skater under heavy motion blur — visually echoes the codec
brief (motion, time-domain compression). The halftone is the same family as
public/images/blog_thumbnails/onevision_encoder.png: black background, cream
dots, no text overlay (FeaturedSection adds the title in the UI).

Drop a different JPG at SOURCE_PATH and re-run to re-skin the thumbnail.

Output: public/images/blog_thumbnails/llava_onevision_2.png  (1456 x 816)
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw

# ---------- Brand palette (matches onevision_encoder.png) ----------
BG_COLOR = (10, 12, 18)        # near-black
DOT_COLOR = (240, 230, 208)    # cream

W, H = 1456, 816
DOT = 4
R_MAX = DOT * 0.50

ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATH = Path("/tmp/source_image.jpg")
OUT_PATH = ROOT / "public" / "images" / "blog_thumbnails" / "llava_onevision_2.png"


# ---------- 1. Load + prep the source as a brightness field ----------
def prep_source(path: Path) -> Image.Image:
    img = Image.open(path).convert("RGB")

    # Source is ~1.78:1 (800x449); canvas is 1.78:1 (1456x816). Cover-fill works
    # without losing much. We just want a tiny crop bias so the skater (who
    # sits right of center in the original) lands closer to canvas center.
    src_w, src_h = img.size
    scale = max(W / src_w, H / src_h)
    new_w = int(src_w * scale)
    new_h = int(src_h * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    # Bias the crop so the skater (sitting ~0.7 of original width) is roughly
    # at canvas x=0.55 — fits the dark-band typography overlay on the right of
    # the FeaturedSection card without colliding with the figure.
    overshoot = max(0, new_w - W)
    left = min(overshoot, int(overshoot * 0.65))
    top = max(0, (new_h - H) // 2)
    img = img.crop((left, top, left + W, top + H))

    # Grayscale luminance
    gray = img.convert("L")

    # Aggressive midtone kill: only keep highlights and the brightest
    # motion-blur traces. Everything below the threshold collapses to black.
    gray = ImageOps.autocontrast(gray, cutoff=(2, 4))

    def remap(v: int) -> int:
        x = v / 255.0
        # Hard threshold: ≤0.50 → 0, then steep ramp to white
        if x < 0.50:
            return 0
        x = (x - 0.50) / (1.0 - 0.50)
        x = x ** 0.65
        return int(min(255, max(0, x * 255)))

    gray = gray.point(remap)

    # Strong radial vignette: dark corners lead the eye to the subject.
    cx, cy = W * 0.55, H * 0.45
    max_r = math.hypot(W * 0.7, H * 0.7)
    gd = gray.load()
    for y in range(H):
        for x in range(W):
            dx = (x - cx)
            dy = (y - cy)
            r = math.hypot(dx, dy) / max_r
            # 0 at center, 1 at far corner. Fade starts at 0.32.
            t = max(0.0, (r - 0.32) / 0.68)
            t = min(1.0, t)
            attenuation = (1.0 - t) ** 1.4
            gd[x, y] = int(gd[x, y] * attenuation)

    # Soft smoothing so dot-grid sampling reads tonal regions
    gray = gray.filter(ImageFilter.GaussianBlur(radius=0.9))
    return gray


# ---------- 2. Halftone rasterisation ----------
def halftone(brightness: Image.Image) -> Image.Image:
    """
    Brightness 0 → no dot (background = black).
    Brightness 255 → max-radius cream dot.
    """
    out = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(out, "RGBA")
    src = brightness.load()

    cols = math.ceil(W / DOT)
    rows = math.ceil(H / DOT)

    for r in range(rows):
        for c in range(cols):
            px = c * DOT + DOT // 2
            py = r * DOT + DOT // 2
            if px >= W or py >= H:
                continue
            v = src[px, py] / 255.0
            # Gentle gamma so highlights pop a bit harder than linear
            v = v ** 0.85
            radius = v * R_MAX * 1.05
            if radius > 0.4:
                draw.ellipse(
                    (px - radius, py - radius, px + radius, py + radius),
                    fill=DOT_COLOR,
                )
    return out


def main() -> None:
    if not SOURCE_PATH.exists():
        raise SystemExit(f"source image missing: {SOURCE_PATH}")
    print(f"source = {SOURCE_PATH}")
    print("→ prepping brightness field …")
    base = prep_source(SOURCE_PATH)
    print("→ halftoning …")
    final = halftone(base)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT_PATH, "PNG", optimize=True)
    print(f"wrote {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
