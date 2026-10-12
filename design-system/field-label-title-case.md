# Field Label Capitalization — Newsroom Design System

**Status:** Approved. Applies to all form-field titles/labels on Workspace Editor, Articles, Dashboard, Tags, Login, and future Newsroom pages.

## Rule
Use **Title Case** consistently for every field label: capitalize the first letter of each significant word, including Indonesian field names and mixed Indonesian/English names.

Examples:
- `Judul Artikel`, `Short Desc`, `Headline Image`, `SEO Keyword`
- `Tanggal Publish`, `Schedule Publication`, `Foto Source`
- `URL Artikel`, `Video URL (Vidio.com)`, `Teks Tautan`

Preserve official spelling/case for acronyms and brands: `AI`, `SEO`, `URL`, `HTML`, `JPG`, `PNG`, `WEBP`, `Liputan6`, `Vidio.com`, `Notepad`. Do not title-case URL values, placeholders, help text, error messages, descriptive sentences, or user-generated content: those use natural sentence case.

## Implementation contract
- Field label strings should come from one canonical field schema/i18n resource where possible.
- Title Case is an authoring/content rule: **do not** use CSS `text-transform: capitalize` because it breaks intentional acronym and brand capitalization and may behave incorrectly in mixed-language labels.
- Include dynamically rendered modal and content-block fields, not only static HTML.
- For composite controls, apply to each actual field title; descriptions remain sentence case.

## QA
1. Audit all visible field labels on each Newsroom page and on modals, tab content, and dynamically added Content Blocks.
2. Verify label capitalization without changing DOM IDs, input names, validation keys, accessible associations, or event behavior.
3. Check labels on desktop/mobile and conditional UI (Schedule, Review & Publish, Image, Video, Embed, SEO).
4. Ensure acronyms, brands, and non-label copy remain untouched.
