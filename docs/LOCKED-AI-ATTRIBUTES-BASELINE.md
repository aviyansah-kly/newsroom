# Approved baseline: AI Attributes preview (2026-09-23)

**Status:** UX approved by Product Design. Treat this implementation as frozen unless a future change to the AI Attributes experience is explicitly approved.

**Snapshot branch:** `baseline/ai-attributes-approved-2026-09-23`  
**Approved commit:** `0e1188ffb42fe6b348aff2d50e9385adeb2416d2`

## Locked scope
- Generate Attributes directly fills the supported right-side attribute fields using demo/rule-based suggestions from the article; it does not open separate suggestion cards.
- Per-field AI Suggestions directly fills only the selected field.
- AI-filled fields use the shared animated purple provenance state; clicking/reviewing or editing a field clears its highlight.
- Existing tags are retained. The approved AI icon/spacing conventions and dedicated AI design tokens remain unchanged.
- The existing Newsroom approval/preview remains a dummy UI, not production AI integration.

## Change management
- The snapshot branch provides a known-good source for comparing and restoring this UX.
- `scripts/check_ai_attributes_baseline.py` compares the V58 AI interaction block in `index.html`, the dedicated AI style sheet, and the AI design tokens with the approved baseline.
- `.github/workflows/ai-attributes-guard.yml` runs that comparison for relevant pull requests and pushes.
- Other Newsroom modules can continue to change. Do not update the approved AI block, stylesheet or token subsection as part of unrelated work.
- Intentional redesigns require explicit Product Design approval, updating this baseline in a separate reviewed change, and then rerunning the guard.
- **This is a CI regression guard, not GitHub branch protection.** To prevent a direct push from bypassing the check, repository admins should require the check **Approved AI flow unchanged** via GitHub branch protection/rulesets on `main`. The baseline branch should also be protected against unwanted force pushes.

## Regression checklist
1. Generate Attributes fills Category, Article Type, Tags and relevant SEO fields immediately, using preview data.
2. No additional suggestion cards or Review Next summary appear.
3. AI-filled controls receive the shared purple animated outline and return to normal after editor review/edit.
4. Per-field AI Suggestions affects only the chosen field.
5. Tag search, manual tag selection and autosave continue to work.
6. Editing other pages or the CMS shell does not alter the above.
