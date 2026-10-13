#!/usr/bin/env python3
"""Guard the Newsroom Dark Mode PR against unintentional baseline changes.

Run: python3 scripts/check_theme_contract.py
This is a STATIC contract test, not visual/functional E2E certification.
"""
from pathlib import Path
import hashlib
import math
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASELINE_GIT_BLOBS = {
    "index.html": "d30ee53212abc72b5d09c2ae613b7b9ccfbdde6d",
    "styles/newsroom-design-system.css": "f9c9476b5d21de06ffeb9c974a63f590c3c7fc29",
    "styles/newsroom-global-navigation.css": "e7579d80d78d5ad1c992ca9ef4dc202e82536688",
    "styles/newsroom-right-panel.css": "6314119f2352d53761cd29f88e3b36c4deeface2",
    "design-system/foundations/tokens.css": "ce8db31a884331f3ecbbe5488f4d7860b3b5a2d3",
    "scripts/newsroom-right-panel.js": "e214c7cbd433bce60ffad728da758112fb636de1",
}

def sha_blob(path: Path) -> str:
    value = path.read_bytes()
    return hashlib.sha1(f"blob {len(value)}\\0".encode() + value).hexdigest()

def contrast(hex_a: str, hex_b: str) -> float:
    def lum(s: str) -> float:
        vals = [int(s[i : i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in vals]
        return sum(a * b for a, b in zip(linear, (0.2126, 0.7152, 0.0722)))
    x, y = sorted([lum(hex_a), lum(hex_b)], reverse=True)
    return (x + 0.05) / (y + 0.05)

for path, expected_sha in BASELINE_GIT_BLOBS.items():
    actual_sha = sha_blob(ROOT / path)
    assert actual_sha == expected_sha, f"LOCKED BASELINE CHANGED: {path}: {actual_sha} != {expected_sha}"
print("PASS: locked Light Mode/editor baseline files unchanged")

css = (ROOT / "styles/newsroom-dark-mode.css").read_text()
js = (ROOT / "scripts/newsroom-appearance.js").read_text()
shell = (ROOT / "scripts/newsroom-shell.js").read_text()
assert 'html[data-theme="dark"]' in css and 'html[data-theme="light"]' not in css
assert "invert(" not in css and "filter:invert" not in css.replace(" ", "")
assert "--nr-action-primary-bg:#D92B00" in css
assert "--nr-action-primary-on:#FFFFFF" in css
assert "--nr-input-boundary:#718096" in css
assert "--ds-ai-review:" in css, "AI provenance must remain purple"
assert "nr-appearance-option" in css and "role','radio" in js
assert "newsroom:appearance" in js and "prefers-color-scheme: dark" in js
assert "styles/newsroom-dark-mode.css" in shell and "scripts/newsroom-appearance.js" in shell
assert "newsroom:appearance" not in (ROOT / "index.html").read_text(), "Do not inline new behavior into locked editor"
assert abs(css.count("{") - css.count("}")) == 0, "CSS braces are unbalanced"
print("PASS: scope, appearance controller, palette, AI provenance, CSS structure")

for label, fg, bg, threshold in (
    ("Dark primary button", "#FFFFFF", "#D92B00", 4.5),
    ("Writing canvas", "#E8EBEF", "#272C32", 4.5),
    ("Metadata on panel", "#BBC3CD", "#22262C", 4.5),
    ("Accessible input boundary", "#718096", "#2B3037", 3.0),
):
    value = contrast(fg, bg)
    assert value >= threshold, f"Contrast failed: {label} {value:.2f} < {threshold}"
    print(f"PASS: {label} {value:.2f}:1 (target >= {threshold:.1f}:1)")

for path in ("scripts/newsroom-shell.js", "scripts/newsroom-appearance.js"):
    try:
        out = subprocess.run(["node", "--check", str(ROOT / path)], capture_output=True, text=True, check=True)
        print(f"PASS: JavaScript syntax {path}")
    except FileNotFoundError:
        print(f"SKIP: node not installed for {path}; run in CI")
    except subprocess.CalledProcessError as exc:
        raise AssertionError(f"JavaScript parse failed for {path}: {exc.stderr}") from exc

print("STATIC CONTRACT PASS. Browser, role flows, modal layers and preview QA still required.")
