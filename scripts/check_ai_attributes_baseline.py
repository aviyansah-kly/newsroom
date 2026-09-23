#!/usr/bin/env python3
"""Regression guard for the approved AI Attributes preview.

Compare only the approved AI flow and its dedicated style sheet against the
frozen baseline branch. Changes elsewhere in Newsroom are allowed.
For intentional AI flow revisions, explicitly approve and refresh the baseline.
"""
from pathlib import Path
import subprocess
import sys

BASELINE = "origin/baseline/ai-attributes-approved-2026-09-23"
START = "// SIXDESK_ALTERNATIVE_V58_JS_START"
END = "// SIXDESK_ALTERNATIVE_V58_JS_END"


def baseline_file(path):
    result = subprocess.run(
        ["git", "show", f"{BASELINE}:{path}"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        raise RuntimeError(f"Cannot read approved baseline {BASELINE}:{path}: {result.stderr.strip()}")
    return result.stdout


def ai_flow(html):
    start = html.find(START)
    end = html.find(END, start + len(START))
    if start == -1 or end == -1:
        raise RuntimeError("Approved AI flow boundaries are missing.")
    return html[start:end + len(END)]


def ai_tokens(css):
    start = css.find("  /* AI provenance / review state.")
    end = css.find("  --ds-space-1:", start)
    if start == -1 or end == -1:
        raise RuntimeError("Approved AI design tokens are missing.")
    return css[start:end]


def compare(path, extract=lambda x: x):
    expected = extract(baseline_file(path))
    actual = extract(Path(path).read_text())
    if expected != actual:
        print(f"FAIL: Protected AI component changed: {path}", file=sys.stderr)
        return False
    print(f"PASS: Protected AI component unchanged: {path}")
    return True


def main():
    tests = [
        compare("index.html", ai_flow),
        compare("styles/newsroom-ai-assist.css"),
        compare("design-system/foundations/tokens.css", ai_tokens),
    ]
    if not all(tests):
        print(
            "The approved AI Attributes baseline has changed. Revert unintended "
            "changes, or request explicit approval before updating the baseline.",
            file=sys.stderr,
        )
        return 1
    print("PASS: Approved AI Attributes baseline is intact.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
