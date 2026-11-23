# Editor Workspace — Recipe Schema, Summary and FAQ

## Scope
Add three optional editorial forms **in the middle writing column** of the legacy Newsroom Editor at `index.html`, underneath the writing surface. Reuse existing Design System semantics and Light/Dark Mode. Do not change right-hand Article Settings, left navigation, Publish validation or the main Newsroom production worker until approved.

## Implemented
- [x] **Recipe Schema** is opt-in. Editor can toggle Enable, select Single or Listicle, edit Name, Image URL, Recipe Category, Recipe Cuisine, Keywords, Recipe Yield, Prep/Cook Time (minutes), Ingredients and Instructions.
- [x] **Generate Schema** validates that each recipe contains Name, Ingredients and Instructions, then previews schema.org Recipe JSON-LD in readable form. Listicle outputs `@graph` of multiple Recipe entries. No schema is inserted into the published HTML.
- [x] **Summary** is optional and manually editable. Generate AI displays a separate preview based solely on existing Short Desc or article content; **Use Suggestion** is required to insert into the field.
- [x] **FAQ** is optional. Editor may Add/Remove questions and answers. Generate AI prepares suggested FAQ questions with answers based on existing editor text; **Use Suggestions** must be clicked to add them.
- [x] AI buttons are clearly labeled **AI Demo Suggestion** in generated panels and do not invoke a real model, API or external network.
- [x] Local drafts are persisted to browser localStorage (`newsroom:editor-enrichment:v1`); this is not the CMS backend. Existing autosave/publish remains untouched.
- [x] Component isolated as `scripts/newsroom-editor-enrichment.js` + `styles/newsroom-editor-enrichment.css` and mounted inside `.workspace > section > .paper`; no new global components are introduced.
- [x] Targeted Chromium QA **PASSED**: GitHub Actions run 45131682474. Checks Single/Listicle JSON-LD, AI review-before-apply, FAQ list edits, local persistence, Dark Mode, responsive/mobile; screenshot artifact `newsroom-editor-enrichment-qa` attached.
- [ ] Visual Design approval of isolated branch preview. The main Newsroom Worker was deliberately not updated.
- [ ] Backend AI integration, schema publication workflow, and API persistence.

## Recipe JSON-LD scope
Preview follows schema.org Recipe, with `@context`, `@type`, name, optional image/category/cuisine/keywords/yield, ISO prep/cook/total duration and arrays of ingredients / HowToStep instructions. The user reference screenshot shows Single/Listicle and fields including @context, @type, Name, Image URL, Recipe Category, Recipe Cuisine, Keywords. Other common recipe fields are provided to produce a useful complete Recipe object. This is a **prototype preview**, not a Google rich-result eligibility guarantee. Real publishing must validate recipe schema against current backend and search requirements.

## Important safeguards
1. Optional enrichment fields are not included in Publish validation or the existing CMS body; no promises about automatic publication.
2. Generated Summary/FAQ suggestions never overwrite manual edits automatically; the user explicitly accepts them.
3. Demo FAQ does not hallucinate article facts; responses are extracted from Short Desc / article content. Editors must fact-check and edit.
4. Real AI integration requires an authorized backend API, explicit loading/errors, permission/rate limiting and audited provenance.
5. LocalStorage stores samples only and must not be mistaken for a server saved draft.

## Review
- Branch: `feature/editor-recipe-summary-faq` based on `main`.
- Files: `index.html`, `styles/newsroom-editor-enrichment.css`, `scripts/newsroom-editor-enrichment.js`, `tests/editor-enrichment-smoke.cjs`.
- Do not merge/deploy to the existing Newsroom production Worker without Product Design approval.
