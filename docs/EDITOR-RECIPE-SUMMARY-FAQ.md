# Editor Workspace — Recipe Schema, Summary and FAQ

## Scope
Add three optional editorial forms **in the middle writing column** of the legacy Newsroom Editor on the Editor page, underneath the writing surface. Reuse existing Design System semantics and Light/Dark Mode. Do not change right-hand Article Settings, left navigation, Publish validation or the main Newsroom production worker until approved.

## Implemented
- [x] **Recipe Schema** is opt-in. Editor can toggle Enable, select Single or Listicle, and edit Name, Image URL, Recipe Category, Recipe Cuisine, Keywords, Recipe Yield, Date Published, Description, Prep/Cook Time (minutes) and optional ISO 8601 Total Time. Collapsible Author (`Person`), Aggregate Rating, Nutrition, Recipe Ingredients (multiline or dynamically Add/Remove Ingredient), and Recipe Instructions sections preserve editable data and local demo persistence.
- [x] **Generate Schema** validates that each recipe contains Name, Ingredients and Instructions, then previews schema.org Recipe JSON-LD in readable form. Listicle outputs `@graph` of multiple Recipe entries. No schema is inserted into the published HTML.
- [x] **Summary** now has an opt-in Design System checkbox, repeatable Point 1/Point 2/etc with Add/Remove, and reviewed **Generate AI** demo suggestions extracted as sentences from available article content. **Use Suggestions** appends points without overwriting manual entries.
- [x] **FAQ** now has an opt-in Design System checkbox, preserved Add/Remove Question controls, and an AI demo suggestion preview that requires **Use Suggestions** before adding questions.
- [x] Recipe Details, Author, Aggregate Rating, Nutrition, Recipe Ingredients, and Recipe Instructions each have a **Generate AI** demo action. Grounded suggestions are previewed and applied only after **Use Suggestions**. Author/rating/nutrition panels give explicit guidance instead of fabricating unverified facts. All AI demo panels are explicitly labeled and make no API/network calls.
- [x] Local drafts are persisted to browser localStorage (key prefix `newsroom:editor-enrichment:v1:` scoped to the article's story ID); this is not the CMS backend. Existing autosave/publish remains untouched.
- [x] Buttons now use the canonical Newsroom Design System primary action (40px/13px, semantic orange) and semantic secondary controls, with no text below 12px. The collapsible Recipe groups reuse semantic surface/input/divider tokens in Light/Dark Mode.
- [x] Component isolated as `scripts/newsroom-editor-enrichment.js` + `styles/newsroom-editor-enrichment.css` and mounted inside `.workspace > section > .paper` by a scoped loader in `scripts/newsroom-shell.js`; `index.html` remains byte-for-byte identical to the approved main baseline.
- [x] Targeted Chromium QA **PASSED** after switching to the scoped shell loader: GitHub Actions run 45133078005 (push) and 45133084279 (pull request). Checks Single/Listicle JSON-LD, AI review-before-apply, FAQ list edits, local persistence, Dark Mode, responsive/mobile; screenshot artifact `newsroom-editor-enrichment-qa` attached.
- [ ] Visual Design approval of isolated branch preview. Checkbox and arrow parity, new Summary points, FAQ opt-in and Recipe section actions require fresh desktop/mobile/Light/Dark review. CI is triggered on every branch update and the newest feature QA result must be considered (earlier run results do not approve a newer revision).
- [x] Summary/FAQ opt-in behavior now preserves entered values when disabled and re-enabled, and migrates the prior single Summary textarea content to repeatable points. The main Newsroom Worker remains untouched.
- [ ] Backend AI integration, schema publication workflow, and API persistence.

## Recipe JSON-LD scope
Preview follows schema.org Recipe, with `@context`, `@type`, name, optional image/category/cuisine/keywords/yield, ISO prep/cook/total duration and arrays of ingredients / HowToStep instructions. The user reference screenshot shows Single/Listicle and fields including @context, @type, Name, Image URL, Recipe Category, Recipe Cuisine, Keywords. Author, Description, Date Published, Aggregate Rating, Nutrition and dynamically added ingredients are now supported in the structured preview. Recipe section-specific AI demo controls are available with explicit review-before-apply. Real AI generation, validated schema publishing, and backend persistence remain out of scope. This is a **prototype preview**, not a Google rich-result eligibility guarantee. Real publishing must validate recipe schema against current backend and search requirements.

## Important safeguards
1. Optional enrichment fields are not included in Publish validation or the existing CMS body; no promises about automatic publication.
2. Generated Summary/FAQ suggestions never overwrite manual edits automatically; the user explicitly accepts them.
3. Demo FAQ does not hallucinate article facts; responses are extracted from Short Desc / article content. Editors must fact-check and edit.
4. Real AI integration requires an authorized backend API, explicit loading/errors, permission/rate limiting and audited provenance.
5. LocalStorage stores samples only and must not be mistaken for a server saved draft.

## Review
- Branch: `feature/editor-recipe-summary-faq` based on `main`.
- Files: `scripts/newsroom-shell.js`, `scripts/newsroom-editor-enrichment.js`, `styles/newsroom-editor-enrichment.css`, `tests/editor-enrichment-smoke.cjs`, `.github/workflows/editor-enrichment-smoke.yml`.
- Static theme contract/audit passes and the index baseline is restored. Other repository-wide browser regression workflows remain red because their `ubuntu-latest` runners resolve to Ubuntu 26.04, which the pinned Playwright version does not support; these workflows fail before browser assertions execute. The feature-specific Chromium suite uses Ubuntu 24.04 and passes.
- Do not merge/deploy to the existing Newsroom production Worker without Product Design approval.
