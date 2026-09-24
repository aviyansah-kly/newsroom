# Insert Link — UX prototype and implementation contract

Updated 24 September 2026. Applies to Content Text link controls on the primary TipTap Classic toolbar, contextual toolbar and subsequent mini contenteditable Text Blocks.

## Interaction
The former small Insert Link popup/native browser prompt is superseded by one accessible, responsive **Tambah Tautan** modal. Triggering a link action preserves the selected text. Two tabs:

- **Internal Link**: search Liputan6 articles or choose **Saran AI**. Both return clearly labeled DEMO DATA for preview. AI uses deterministic keyword matching, not a real model or real article search. Clicking a candidate automatically fills the link URL; display text remains editable.
- **External Link**: enter an HTTP/HTTPS URL. Both Nofollow and Buka di tab baru default on (and can be unchecked). Internal links default both options off.

Shared form features: selected-text context, editable display text, explicit cancel/confirm, Apply disabled until valid, focus trap, Escape close, responsive mobile layout and confirmation of chosen internal article.

## Product handoff
Internal article IDs and /read/demo-... URLs are intentionally fake to explain the workflow. They MUST be replaced before production and never published as real links. Real integration should query canonical Liputan6 article IDs and published URLs, check editorial status, and exclude private or unpublished content. AI should recommend candidate article IDs that are subsequently verified against the article index, with human selection before applying. Add loading, empty, unavailable, stale-link, and request-error states during backend integration.

## Files / design-system safeguards
- styles/newsroom-link-dialog.css: isolated design system modal styling; no Text toolbar layout changes.
- scripts/newsroom-link-dialog.js: delegated handlers for all Text toolbar link controls, text selection preservation, demo AI flow and link insertion.
- index.html: static preview embeds matching stylesheet and script to avoid missing/stale external assets. Keep the copies synchronized.
- tests/editor-link-dialog-smoke.cjs: real-browser smoke test, GitHub Actions editor-link-dialog-smoke.yml.

Do not modify the locked floating Text toolbar geometry/sticky baseline or protected AI Attributes code as part of this feature.