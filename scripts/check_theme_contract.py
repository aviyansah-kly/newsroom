#!/usr/bin/env python3
"""Guard the Newsroom Dark Mode PR against unintentional baseline changes.

Run: python3 scripts/check_theme_contract.py
This is a STATIC contract test, not visual/functional E2E certification.
"""
from pathlib import Path
import hashlib
import json
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
    return hashlib.sha1(b"blob " + str(len(value)).encode() + bytes([0]) + value).hexdigest()

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
editor_css = (ROOT / "styles/newsroom-dark-mode-editor.css").read_text()
js = (ROOT / "scripts/newsroom-appearance.js").read_text()
shell = (ROOT / "scripts/newsroom-shell.js").read_text()
assert 'html[data-theme="dark"]' in css and 'html[data-theme="light"]' not in css
assert "invert(" not in css and "filter:invert" not in css.replace(" ", "")
assert "--nr-action-primary-bg:#D92B00" in css
assert "--nr-action-primary-on:#FFFFFF" in css
assert "--nr-input-boundary:#718096" in css
assert "--nr-divider-subtle:#343A42" in css, "Quiet decorative separator token missing"
assert "--nr-divider:#3A414A" in css, "Section separator token missing"
assert "--nr-canvas-border:#3C434D" in css, "Canvas edge token missing"
assert "--nr-input-boundary:#718096" in css, "Do not soften meaningful input boundaries"
assert "--nr-editor-rule:var(--nr-divider-subtle" in editor_css
assert "--ds-ai-review:" in css, "AI provenance must remain purple"
assert "nr-appearance-option" in css and "role','radio" in js
assert "html[data-theme=\"dark\"]" in editor_css
assert "html[data-theme=\"light\"]" not in editor_css
assert "filter:invert" not in editor_css.replace(" ", "")
assert "styles/newsroom-dark-mode-editor.css" in shell
assert "newsroom:appearance" in js and "prefers-color-scheme: dark" in js
assert "styles/newsroom-dark-mode.css" in shell and "scripts/newsroom-appearance.js" in shell
assert "newsroom:appearance" not in (ROOT / "index.html").read_text(), "Do not inline new behavior into locked editor"
assert abs(css.count("{") - css.count("}")) == 0, "CSS braces are unbalanced"
components_css = (ROOT / "styles/newsroom-theme-components.css").read_text()
registry = json.loads((ROOT / "design-system/component-theme-registry.json").read_text())
assert "styles/newsroom-theme-components.css" in shell, "Canonical component stylesheet not loaded"
assert 'html[data-theme="light"]' not in components_css, "New layer must never touch Light Mode"
assert components_css.count("{") == components_css.count("}"), "Component CSS malformed"
assert len(registry["components"]) >= 12, "Missing mandatory component ownership records"
assert registry["sourceOfTruth"] == "styles/newsroom-theme-components.css"
assert len({x["id"] for x in registry["components"]}) == len(registry["components"]), "Component IDs must be unique"
for component in registry["components"]:
    assert component["selectors"] and component["tokenRoles"] and component["qa"], f"Missing coverage for {component['id']}"
    for role in component["tokenRoles"]:
        assert role in registry["tokens"], f"Undeclared token role {component['id']}:{role}"
    for selector in component["selectors"]:
        assert selector.startswith((".", "#")), f"Unscoped selector {selector}"
for token in registry["tokens"].values():
    assert token in components_css, f"Missing component token definition: {token}"
assert "--nr-ui-toggle-off-track:#46566C" in components_css
assert "--nr-ui-toggle-off-border:#8494A9" in components_css
assert "--nr-ui-toggle-on-track:var(--nr-action-primary-bg" in components_css
assert ":focus-visible + .switch-track" in components_css, "Switch keyboard focus must be visible"
after_tokens = components_css.split("/* Component 01:", 1)[1]
assert not re.search(r"#[0-9a-fA-F]{3,8}\\b", after_tokens), "Component rules must only use semantic tokens, never hex literals"
for label, a, b, minimum in [
    ("Toggle OFF thumb-to-track", "#F8FAFC", "#46566C", 4.5),
    ("Toggle ON thumb-to-track", "#F8FAFC", "#D92B00", 4.5),
    ("Toggle OFF track outline vs surface", "#8494A9", "#303740", 3.0),
]:
    actual = contrast(a,b)
    assert actual >= minimum, f"{label} {actual:.2f} below {minimum:.1f}"
    print(f"PASS: {label} contrast {actual:.2f}:1")
print("PASS: component registry, semantically scoped CSS, toggle states and single token source")

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
