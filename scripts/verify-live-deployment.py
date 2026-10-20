#!/usr/bin/env python3
"""Compare the actual Cloudflare URL to the branch checked out by GitHub Actions.

Unlike design-system browser smoke tests (served locally), this tests whether the
public deployment serves the very same UI assets as the repository under test.
Credentials are never transmitted or read. Network failures are explicitly reported.
"""
import argparse
import hashlib
import os
from pathlib import Path
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_URL = "https://newsroom.avi-yansah.workers.dev"
ASSETS = (
    "index.html",
    "design-system/foundations/tokens.css",
    "dashboard.html",
    "articles.html",
    "tags.html",
    "scripts/newsroom-shell.js",
    "scripts/newsroom-editorial-reusable.js",
    "styles/newsroom-shell.css",
    "scripts/newsroom-dark-review-focus.js",
    "styles/newsroom-dark-mode.css",
    "styles/newsroom-dark-mode-editor.css",
    "styles/newsroom-theme-components.css",
)

def read_url(base: str, path: str):
    url = base.rstrip("/") + ("/" if path == "index.html" else "/" + path)
    request = Request(url, headers={
        "User-Agent": "Newsroom-Live-Release-Verification/1.0",
        "Accept": "text/html, text/css, application/javascript, */*",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    })
    try:
        with urlopen(request, timeout=18) as response:
            data = response.read()
            return {
                "status": response.status,
                "bytes": data,
                "type": response.headers.get("Content-Type", ""),
                "etag": response.headers.get("ETag", ""),
                "cf_cache": response.headers.get("CF-Cache-Status", ""),
                "url": response.geturl(),
            }
    except HTTPError as e:
        return {"status": e.code, "error": f"HTTP {e.code}: {e.reason}", "url": url}
    except (URLError, TimeoutError, OSError) as e:
        return {"status": None, "error": f"{type(e).__name__}: {e}", "url": url}

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def audit(base: str):
    ok = True
    for path in ASSETS:
        expected = (ROOT / path).read_bytes()
        r = read_url(base, path)
        if r.get("status") != 200:
            print(f"BLOCKED {path}: {r.get('error')} / {r['url']}",flush=True)
            ok = False
            continue
        actual = r["bytes"]
        equal = actual == expected
        label = "MATCH" if equal else "STALE_OR_DIFFERENT"
        print(
            f"{label}: {path} | live={len(actual)} bytes sha256={sha(actual)[:16]} "
            f"| main={len(expected)} bytes sha256={sha(expected)[:16]} "
            f"| type={r['type']} | etag={r['etag']} | cf-cache={r['cf_cache']}",
            flush=True,
        )
        if path == "index.html" and not equal:
            # Exact-byte comparison may differ with downstream HTML rewriting; do not
            # infer that the CSS is deployed simply because the HTML looks similar.
            print("  NOTE: HTML may be transformed by an edge worker; compare theme assets separately.",flush=True)
        if path == "styles/newsroom-theme-components.css" and not equal:
            print("  ACTION: Cloudflare is not serving the approved component color system.",flush=True)
        if path == "scripts/newsroom-shell.js" and not equal:
            print("  ACTION: The live page may not load the canonical component stylesheet.",flush=True)
        if not equal:
            ok = False
    return ok

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--strict", action="store_true",
                        help="Nonzero exit if live differs or cannot be fetched")
    parser.add_argument("--attempts", type=int, default=1)
    parser.add_argument("--delay", type=int, default=10)
    args = parser.parse_args()
    print(f"Live deployment: {args.url}; repository commit: {os.environ.get('GITHUB_SHA','local')}",flush=True)
    for n in range(args.attempts):
        print(f"Verification attempt {n+1}/{args.attempts}",flush=True)
        if audit(args.url):
            print("PASS: public Cloudflare deployment matches all checked-out Newsroom assets",flush=True)
            return 0
        if n + 1 < args.attempts:
            time.sleep(args.delay)
    print("UNVERIFIED: public Cloudflare deployment does not match this GitHub source.",flush=True)
    if args.strict:
        print("FAIL: do not claim the live preview has updated. Check Cloudflare deployment configuration, origin and cache.",flush=True)
        return 1
    print("REPORT ONLY: PR code checks are separate from deployment verification.",flush=True)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
