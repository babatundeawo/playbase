#!/usr/bin/env python3
"""Quality checks for the built website (the ./dist folder).

Runs inside GitHub Actions after the build. Uses only Python's standard library
and the copy of Node.js that GitHub provides.

Errors stop the deployment (something is really broken).
Warnings are only reported (worth a look, not worth blocking a release).
"""
import json
import os
import re
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
errors: list[str] = []
warnings: list[str] = []
notes: list[str] = []


def error(message: str) -> None:
    errors.append(message)


def warn(message: str) -> None:
    warnings.append(message)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def png_size(path: Path):
    with open(path, "rb") as handle:
        header = handle.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", header[16:24])


# ---------- 1. Required files ----------
REQUIRED = [
    "index.html", "404.html", "privacy.html", "manifest.json", "service-worker.js",
    "robots.txt", "sitemap.xml", "css/tokens.css", "css/style.css",
    "js/app.js", "js/effects.js", "js/theme-init.js", "js/static-page.js",
    "js/questions.js", "js/firebase-config.js", "js/firebase-env.js",
    "assets/images/og-image.png", "assets/images/icons/favicon.svg",
    "assets/images/icons/favicon.ico", "assets/images/icons/apple-touch-icon.png",
]
for name in REQUIRED:
    if not (DIST / name).is_file():
        error(f"Missing required file: {name}")

if errors:
    # The remaining checks need these files, so stop early with a clear list
    print("\n".join(f"ERROR: {e}" for e in errors))
    sys.exit(1)

# ---------- 2. Placeholders must be gone ----------
for path in DIST.rglob("*"):
    if path.is_file() and path.suffix in {".html", ".xml", ".txt", ".json", ".js", ".css"}:
        text = read(path)
        for token in ("__SITE_URL__", "__REPO_URL__", "__BUILD_DATE__"):
            if token in text:
                error(f"{path.relative_to(DIST)} still contains the placeholder {token}")
if "PASTE_" in read(DIST / "js/firebase-env.js"):
    error("js/firebase-env.js still contains PASTE_ placeholders (the Firebase secrets were not applied)")

# ---------- 3. Local links, images and scripts exist ----------
ref_pattern = re.compile(r'(?:href|src)="([^"]+)"')
site_url = None
sitemap = read(DIST / "sitemap.xml")
match = re.search(r"<loc>([^<]+)</loc>", sitemap)
if match:
    site_url = match.group(1)

for page in DIST.glob("*.html"):
    html = read(page)
    ids = set(re.findall(r'\sid="([^"]+)"', html))
    for ref in ref_pattern.findall(html):
        if ref.startswith(("mailto:", "data:", "javascript:")):
            continue
        if ref.startswith("#"):
            if ref[1:] and ref[1:] not in ids:
                error(f"{page.name}: link to #{ref[1:]} has no matching id")
            continue
        if ref.startswith("http"):
            if site_url and ref.startswith(site_url):
                ref = ref[len(site_url):]
            else:
                continue
        target = ref.split("#")[0].split("?")[0]
        if target in ("", "./"):
            continue
        if not (DIST / target).exists():
            error(f"{page.name}: '{ref}' does not exist")
    for ref in re.findall(r'<use href="#([^"]+)"', html):
        if ref not in ids:
            error(f"{page.name}: icon #{ref} is not defined in the sprite")
    if "<title>" not in html:
        error(f"{page.name}: missing <title>")
    if 'name="description"' not in html:
        warn(f"{page.name}: missing meta description")
    if "Content-Security-Policy" not in html:
        warn(f"{page.name}: no Content Security Policy tag")
    if re.search(r'\sstyle="', html):
        error(f"{page.name}: inline style attribute found (the Content Security Policy blocks these)")

# ---------- 4. Every element the app looks up exists ----------
index_html = read(DIST / "index.html")
index_ids = set(re.findall(r'\sid="([^"]+)"', index_html))
app_js = read(DIST / "js/app.js")
used = set(re.findall(r'\$\("([^"]+)"\)', app_js)) | set(re.findall(r"\$\(`([a-z-]+)-error`\)", app_js))
used |= {f"{name}-error" for name in re.findall(r'setFieldError\("([^"]+)"', app_js)}
for name in sorted(used):
    if name not in index_ids:
        error(f"app.js uses #{name} but index.html has no element with that id")

# ---------- 5. JavaScript syntax ----------
with tempfile.TemporaryDirectory() as tmp:
    for js in sorted(DIST.rglob("*.js")):
        relative = js.relative_to(DIST)
        copy = Path(tmp) / (str(relative).replace("/", "_").replace(".js", ".mjs"))
        copy.write_text(read(js), encoding="utf-8")
        result = subprocess.run(["node", "--check", str(copy)], capture_output=True, text=True)
        if result.returncode != 0:
            error(f"JavaScript syntax problem in {relative}: {result.stderr.strip().splitlines()[0] if result.stderr else 'unknown'}")

# ---------- 6. Manifest and icons ----------
try:
    manifest = json.loads(read(DIST / "manifest.json"))
    for icon in manifest.get("icons", []):
        icon_path = DIST / icon["src"]
        if not icon_path.is_file():
            error(f"manifest icon missing: {icon['src']}")
            continue
        size = png_size(icon_path)
        expected = tuple(int(x) for x in icon["sizes"].split("x"))
        if size != expected:
            error(f"manifest icon {icon['src']} is {size}, expected {expected}")
    sizes = {i["sizes"] for i in manifest.get("icons", [])}
    if not {"192x192", "512x512"} <= sizes:
        error("manifest needs 192x192 and 512x512 icons to be installable")
except json.JSONDecodeError as exc:
    error(f"manifest.json is not valid JSON: {exc}")

og = png_size(DIST / "assets/images/og-image.png")
if og != (1200, 630):
    warn(f"og-image.png is {og}; 1200x630 is recommended")

# ---------- 7. Service worker cache list ----------
sw = read(DIST / "service-worker.js")
block = re.search(r"FILES_TO_CACHE = \[(.*?)\];", sw, re.S)
if block:
    for name in re.findall(r'"([^"]+)"', block.group(1)):
        if name != "./" and not (DIST / name).exists():
            error(f"service-worker.js caches '{name}' but that file does not exist (installation would fail)")
else:
    error("Could not read FILES_TO_CACHE from service-worker.js")

# ---------- 8. Weight report ----------
total = 0
heaviest = []
for path in DIST.rglob("*"):
    if path.is_file():
        size = path.stat().st_size
        total += size
        heaviest.append((size, str(path.relative_to(DIST))))
heaviest.sort(reverse=True)
notes.append(f"Site size: {total / 1024:.0f} KB in {len(heaviest)} files.")
for size, name in heaviest[:3]:
    notes.append(f"Largest: {name} ({size / 1024:.0f} KB)")
for size, name in heaviest:
    if size > 400 * 1024 and not name.endswith(".png"):
        warn(f"{name} is {size / 1024:.0f} KB; large files slow the first load")

# ---------- Report ----------
lines = []
lines.append("## Site checks")
lines.append("")
lines.append(f"- Errors: **{len(errors)}**")
lines.append(f"- Warnings: **{len(warnings)}**")
for note in notes:
    lines.append(f"- {note}")
if errors:
    lines.append("\n### Errors (these stop the deployment)")
    lines += [f"- {e}" for e in errors]
if warnings:
    lines.append("\n### Warnings (for information)")
    lines += [f"- {w}" for w in warnings]
report = "\n".join(lines)
print(report)

summary = os.environ.get("GITHUB_STEP_SUMMARY")
if summary:
    with open(summary, "a", encoding="utf-8") as handle:
        handle.write(report + "\n")

for e in errors:
    print(f"::error::{e}")
for w in warnings:
    print(f"::warning::{w}")

sys.exit(1 if errors else 0)
