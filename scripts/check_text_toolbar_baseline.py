#!/usr/bin/env python3
"""Fail when the Product Design-approved Newsroom Text toolbar baseline changes.

Compare focused CSS/JS slices, not unrelated Newsroom content. Visual and
cascade regressions from newly introduced rules still require manual QA.
"""
from pathlib import Path
import subprocess
import sys

BASELINE = "origin/baseline/text-toolbar-approved-2026-09-23"
START = "/* Shared Text toolbar geometry: first and subsequent content blocks. */"
END = "/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */"
STICKY_START = (
    'body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar,\n'
    'body.alt-editor-layout .alt-content-card[data-type="text"] #classicToolbar{'
)
JS_START = "  const TOP=67; // Shared top offset: 68px Newsroom header minus 1px seam."
JS_END = "  function requestSticky(){"


def baseline_html():
    result = subprocess.run(
        ["git", "show", f"{BASELINE}:index.html"],
        capture_output=True, text=True, check=False,
    )
    if result.returncode:
        raise RuntimeError(f"Cannot load protected baseline: {result.stderr.strip()}")
    return result.stdout


def between(data, start, end, name):
    a = data.find(start)
    b = data.find(end, a + len(start))
    if a < 0 or b < 0:
        raise RuntimeError(f"Missing protected {name} section")
    return data[a:b]


def primary_sticky(data):
    a = data.find(STICKY_START)
    if a < 0:
        raise RuntimeError("Missing primary sticky toolbar rule")
    b = data.find("\n}", a)
    if b < 0:
        raise RuntimeError("Primary sticky toolbar rule has no closing brace")
    return data[a:b + 2]


def slices(data):
    return {
        "approved shared geometry / primary sizing / bottom radius": between(
            data, START, END, "shared Text toolbar"
        ),
        "primary sticky toolbar positioning": primary_sticky(data),
        "primary-block exclusion and V46 secondary controller": between(
            data, JS_START, JS_END, "sticky controller"
        ),
    }


def main():
    expected = slices(baseline_html())
    actual = slices(Path("index.html").read_text(encoding="utf-8"))
    failed = False
    for name, original in expected.items():
        if actual[name] != original:
            failed = True
            print(f"FAIL: protected {name} changed", file=sys.stderr)
        else:
            print(f"PASS: protected {name} unchanged")
    if failed:
        print(
            "Text toolbar baseline changed. Revert unintended edits or obtain "
            "explicit Product Design approval before refreshing the baseline.",
            file=sys.stderr,
        )
        return 1
    print("PASS: Approved Text toolbar baseline intact.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
