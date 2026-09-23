# LOCKED — Text editor toolbar baseline (approved 2026-09-23)

**Status:** Product Design approved. Treat as frozen unless a future toolbar change is explicitly approved.

**Baseline branch:** `baseline/text-toolbar-approved-2026-09-23`  
**Approved commit:** `29af25fabb5911b878624779f33a195660bedf05`

## Protected experience
- All Text content blocks use the approved secondary-block toolbar as their visual baseline. Buttons are 36 × 36 px (minimum width 36 px), with 8 px horizontal button padding; group gap 4 px, intergroup margin 8 px and padding 10 px.
- The primary `#classicToolbar` retains native sticky positioning below the Newsroom header. Secondary and later text blocks retain the existing V46 fixed/placeholder controller. Activating either must not cause a vertical jump.
- Only bottom corners are rounded, at 9 px. Keep the first toolbar's stronger ID-specific override and clipping in place so the previous square-bottom regression cannot recur.
- Keep current icon sizing, control ordering, responsive horizontal overflow, approved editor spacing and content editing interactions.
- Other Newsroom modules, AI Attributes and non-Text content blocks remain outside this lock.

## How to maintain the lock
- The baseline branch is a frozen comparison snapshot. `scripts/check_text_toolbar_baseline.py` compares the approved toolbar overrides, primary sticky CSS and controller-specific primary-block handling to this snapshot. The `Text toolbar baseline guard` workflow checks relevant pull requests and pushes.
- Make unrelated changes *outside* the protected region. Do not add later overriding CSS that changes this experience. For intentional toolbar changes, secure explicit Product Design approval, review a separate PR and deliberately update the baseline/guard.
- This is **a regression check, not an access lock**. Require the check **Approved Text toolbar unchanged** in the repository's `main` branch protection/ruleset to block merging failed PRs. Direct pushes are not prevented unless a ruleset enforces checks; protect the baseline branch against force-pushes.

## Manual visual QA
1. Create Text blocks 1, 2, 3 and scroll through each while editing.
2. Check equal height/padding/icons/groups and bottom-only 9 px rounding across the blocks.
3. Activate the first toolbar and scroll; verify native sticky works with no positional jump and doesn't hide content behind the header.
4. Activate the second/third toolbar and scroll; verify V46 fixed behavior, no jump, correct width and release at each card boundary.
5. Repeat at narrow widths and browser zoom. Watch for horizontal scroll/clipping or changes to other editor fields.
