# AI-assisted editorial attributes — UI contract

Status: frontend interaction prototype with **dummy/rule-based suggestions**, not a live AI model call. This version is intended to demonstrate the field-filling and review UX to stakeholders. Integrate an authenticated AI service before production; validate taxonomy values server-side.

## Two entry points
- **AI Suggestions** (per field): available on Category, Article Type, Figure, Tags, Primary Keyword, SEO Title, Meta Description, and Custom Slug. Fills the selected field directly with a dummy suggestion; no extra suggestion card or Apply step. The field receives the shared purple review outline.
- **Generate Attributes** (bulk): shown after the article writing area. Requires Title, Short Description, and Article Body. Directly fills the supported fields in one pass with illustrative dummy values derived from article keywords. Existing tags are retained and suggested tags are appended. Fields manually edited in the current session are protected; untouched demo defaults can be replaced for the preview. No suggestion cards are opened.

## Editor context and protected fields
Current Reporter and Editor assignments are existing workspace data and should be passed as context to a future AI backend. This prototype does not invent or reassign either person. Location is not inferred without verified article evidence. Publish Date, Publish Time, and publication status are never changed by generation.

## Shared review component
`styles/newsroom-ai-assist.css` imports `design-system/foundations/tokens.css` and extends the current Newsroom controls with the same purple review border, animated glow, and icon-only sparkle review action for AI-filled fields. Review state ends on explicit review or a manual edit. Tags search input alone does not clear review; adding/removing selected tags does.

Review is local to each field: the purple animated border persists until the editor clicks the field, edits its value, or activates the icon-only review control. No additional review progress panel or Review next action is shown in Editorial or SEO. Generate Attributes uses wand-sparkles; per-field AI Suggestions use sparkles. Reduced-motion users receive a static review border.

## Integration notes
Replace rule-based `deriveSuggestions()` with a service using article Title, Short Description, Article Body, authorized/editor identity, and existing editorial assignments. Never send unrelated user data. Preserve the `applyField(key,value,{replace})` contract and purple review semantics; the field-specific AI Suggestions action applies a value directly. For production, establish and confirm explicit replacement safeguards for saved drafts and manual values. The backend must restrict Categories/Article Types to valid taxonomy IDs, canonicalize Tags against the CMS catalogue, and must not change publication schedule or personnel assignments.

## Source files
- `index.html`: application flow, field state, progress and review guard
- `styles/newsroom-ai-assist.css`: shared UI styling
- `design-system/foundations/tokens.css`: purple AI provenance tokens
- `design-system/components/README.md`: reusable component contract
