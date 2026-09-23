# AI-assisted editorial attributes — UI contract

Status: frontend interaction prototype. The current `deriveSuggestions()` implementation is **rule-based**, not a live model call. Integrate an authenticated AI service before describing suggestions as production AI output; validate model output and permitted taxonomy options server-side.

## Two entry points
- **AI Suggestions** (per field): available on Category, Article Type, Figure, Tags, Primary Keyword, SEO Title, Meta Description, and Custom Slug. Opens a local suggestion with Dismiss / Apply (or Add Tags). Existing field values are not modified until the editor applies the suggestion.
- **Generate Attributes** (bulk): shown after article writing area. Requires Title, Short Description, and Article Body. Proposes all eight supported attributes in one pass; only empty or unmodified demo-default values are filled. Existing manual or previously AI-reviewed fields are preserved. AI tags are appended without removing existing tags.

## Editor context and protected fields
Current Reporter and Editor assignments are existing workspace data and should be passed as context to a future AI backend. This prototype does not invent or reassign either person. Location is not inferred without verified article evidence. Publish Date, Publish Time, and publication status are never changed by generation.

## Shared review component
`styles/newsroom-ai-assist.css` imports `design-system/foundations/tokens.css` and extends the current Newsroom controls with the same purple review border, animated glow, and icon-only sparkle review action for AI-filled fields. Review state ends on explicit review or a manual edit. Tags search input alone does not clear review; adding/removing selected tags does.

Review is local to each field: the purple animated border persists until the editor clicks the field, edits its value, or activates the icon-only review control. No additional review progress panel or Review next action is shown in Editorial or SEO. Generate Attributes uses wand-sparkles; per-field AI Suggestions use sparkles. Reduced-motion users receive a static review border.

## Integration notes
Replace rule-based `deriveSuggestions()` with a service using article Title, Short Description, Article Body, authorized/editor identity, and existing editorial assignments. Never send unrelated user data. Preserve the `applyField(key,value,{replace})` contract and review semantics; only permit the field-specific Apply action to replace existing manual values. The backend must restrict Categories/Article Types to valid taxonomy IDs, canonicalize Tags against the CMS catalogue, and must not change publication schedule or personnel assignments.

## Source files
- `index.html`: application flow, field state, progress and review guard
- `styles/newsroom-ai-assist.css`: shared UI styling
- `design-system/foundations/tokens.css`: purple AI provenance tokens
- `design-system/components/README.md`: reusable component contract
