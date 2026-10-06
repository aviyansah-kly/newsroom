# Legacy CMS × Newsroom — CSS isolation experiment

This folder is an **isolated visual feasibility experiment**, not the production integration and not a replacement for the locked Newsroom UI.

## Sources
- Existing CMS prototype: https://cms-liputan6.netlify.app/
- Locked Newsroom reference: https://newsroom.avi-yansah.workers.dev/

## What it demonstrates
- Two distinct application documents with separate CSS cascades using iframes.
- Split compare mode, original CMS mode, original Newsroom mode, and a visually cropped hybrid concept.
- No modifications to either source application's styles, components, tokens, JavaScript, or markup.

## What is NOT implemented
- Single sign-on / cookies / authentication handoff
- Sidebar navigation controlling Newsroom route
- Shared state, data or API integrations
- Validated iframe embed headers (X-Frame-Options / CSP frame-ancestors)
- Responsive acceptance testing and accessibility regression checks

The hybrid crop is only a visual prototype and MUST NOT be shipped as the implementation.

## Production migration concept
Existing app shell (sidebar, login) stays owned by legacy CMS. Routes for migrated modules render independently from the legacy CSS. Adopt route-level isolation (ideally a separate frontend bundle / micro-frontend with explicit auth handoff). Only when IT has validated compatibility should the Newsroom app shell be swapped in. Preserve Newsroom tokens / styles untouched; any adapters live in a separate integration layer.

## Safety
- Branch: `experiment/legacy-cms-css-isolation`
- Paths: `previews/legacy-cms-css-isolation/`
- Do not merge to `main` and do not change Cloudflare's production branch.
