#!/usr/bin/env python3
"""Builds the website into the ./dist folder.

This runs inside GitHub Actions (nobody needs to run it by hand). It uses only
Python's standard library, so there is nothing to install.

What it does:
  1. Copies the files that belong on the website into ./dist
     (documentation, workflows and other repository files are NOT published).
  2. Writes js/firebase-env.js from the Firebase values stored in GitHub secrets.
  3. Replaces the placeholders __SITE_URL__, __REPO_URL__ and __BUILD_DATE__.
  4. Downloads the typefaces (Inter and Sora) from the open Fontsource packages
     and saves them in dist/assets/fonts, so the site serves its own fonts and
     visitors' browsers never contact a third-party font service.
"""
import datetime
import io
import json
import os
import shutil
import sys
import tarfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

FILES = [
    "index.html",
    "404.html",
    "offline.html",
    "privacy.html",
    "manifest.json",
    "service-worker.js",
    "robots.txt",
    "sitemap.xml",
]
FOLDERS = ["css", "js", "assets"]
TEXT_SUFFIXES = {".html", ".xml", ".txt", ".json", ".js", ".css"}

# GitHub secret name -> key inside firebaseConfig
SECRETS = {
    "FIREBASE_API_KEY": "apiKey",
    "FIREBASE_AUTH_DOMAIN": "authDomain",
    "FIREBASE_PROJECT_ID": "projectId",
    "FIREBASE_STORAGE_BUCKET": "storageBucket",
    "FIREBASE_MESSAGING_SENDER_ID": "messagingSenderId",
    "FIREBASE_APP_ID": "appId",
}

# Typefaces (SIL Open Font License 1.1), pinned to exact versions.
# For each weight, the "latin" file is required. The other subsets are optional
# (they carry accented letters such as the dots under Yoruba names) and the
# build carries on without them if a package does not include one.
# To change a font, see docs/CUSTOMIZING.md.
FONTS = {
    "inter": {
        "package": "@fontsource/inter",
        "version": "5.2.6",
        "weights": [400, 500, 600],
        "required": ["latin"],
        "optional": ["latin-ext", "vietnamese"],
    },
    "sora": {
        "package": "@fontsource/sora",
        "version": "5.2.6",
        "weights": [600, 700, 800],
        "required": ["latin"],
        "optional": ["latin-ext"],
    },
}


def fail(message: str) -> None:
    print(f"::error::{message}")
    print(f"\nBUILD STOPPED: {message}")
    sys.exit(1)


def read_firebase_config() -> dict:
    values = {key: os.environ.get(name, "").strip() for name, key in SECRETS.items()}
    missing = [name for name, key in SECRETS.items() if not values[key]]
    if missing:
        fail(
            "These GitHub secrets are missing or empty: "
            + ", ".join(missing)
            + ". Follow docs/FIREBASE_LOGIN_SETUP.md, part 5, to add them."
        )
    placeholders = [name for name, key in SECRETS.items() if "PASTE_" in values[key]]
    if placeholders:
        fail("These secrets still contain placeholder text: " + ", ".join(placeholders))
    return values


def fetch_fonts() -> None:
    """Saves the typeface files into dist/assets/fonts."""
    target = DIST / "assets" / "fonts"
    target.mkdir(parents=True, exist_ok=True)

    for slug, spec in FONTS.items():
        package = spec["package"]
        version = spec["version"]
        url = f"https://registry.npmjs.org/{package}/-/{slug}-{version}.tgz"
        try:
            with urllib.request.urlopen(url, timeout=60) as response:
                data = response.read()
        except (urllib.error.URLError, TimeoutError) as error:
            fail(
                f"Could not download the {slug} font from {url} ({error}). "
                "This is usually a short internet hiccup. Open the Actions tab "
                "and click Re-run all jobs."
            )

        wanted = {}
        for weight in spec["weights"]:
            for subset in spec["required"]:
                wanted[f"package/files/{slug}-{subset}-{weight}-normal.woff2"] = True
            for subset in spec["optional"]:
                wanted[f"package/files/{slug}-{subset}-{weight}-normal.woff2"] = False

        found = set()
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            for member in archive.getmembers():
                if not member.isfile():
                    continue
                if member.name in wanted:
                    content = archive.extractfile(member).read()
                    (target / Path(member.name).name).write_bytes(content)
                    found.add(member.name)
                elif member.name == "package/LICENSE":
                    content = archive.extractfile(member).read()
                    (target / f"{slug}-LICENSE.txt").write_bytes(content)

        missing = [name for name, required in wanted.items() if required and name not in found]
        if missing:
            fail(
                f"The {slug} font package {version} is missing required files: "
                + ", ".join(Path(name).name for name in missing)
            )
        skipped = [Path(name).name for name, required in wanted.items() if not required and name not in found]
        if skipped:
            print(f"Note: optional font files not in the {slug} package, skipped: {', '.join(skipped)}")

    count = sum(1 for p in target.iterdir() if p.suffix == ".woff2")
    print(f"Saved {count} font files into dist/assets/fonts.")


def main() -> None:
    site_url = os.environ.get("SITE_URL", "").strip()
    if not site_url:
        fail("SITE_URL is not set. The deploy workflow sets it automatically.")
    if not site_url.endswith("/"):
        site_url += "/"

    repo = os.environ.get("GITHUB_REPOSITORY", "")
    server = os.environ.get("GITHUB_SERVER_URL", "https://github.com")
    repo_url = os.environ.get("REPO_URL", f"{server}/{repo}" if repo else server)
    build_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    config = read_firebase_config()

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for name in FILES:
        source = ROOT / name
        if not source.exists():
            fail(f"Expected file is missing from the repository: {name}")
        shutil.copy2(source, DIST / name)
    for name in FOLDERS:
        source = ROOT / name
        if not source.is_dir():
            fail(f"Expected folder is missing from the repository: {name}/")
        shutil.copytree(source, DIST / name)

    env_file = DIST / "js" / "firebase-env.js"
    env_file.write_text(
        "// Generated during the build from GitHub repository secrets. Do not edit.\n"
        "export const firebaseConfig = "
        + json.dumps(config, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    tokens = {
        "__SITE_URL__": site_url,
        "__REPO_URL__": repo_url,
        "__BUILD_DATE__": build_date,
    }
    replaced = 0
    for path in DIST.rglob("*"):
        if path.is_file() and path.suffix in TEXT_SUFFIXES:
            text = path.read_text(encoding="utf-8")
            new_text = text
            for token, value in tokens.items():
                new_text = new_text.replace(token, value)
            if new_text != text:
                path.write_text(new_text, encoding="utf-8")
                replaced += 1

    # Fonts come last so the placeholder pass above never touches them.
    fetch_fonts()

    files = sum(1 for p in DIST.rglob("*") if p.is_file())
    print(f"Built {files} files into dist/ ({replaced} files had placeholders filled in).")
    print(f"Site address: {site_url}")


if __name__ == "__main__":
    main()
