# Article List — External Source & Pick Article (Prototype)

## Product intent
1. The Article List must show/filter drafts originating from external systems, including KIRA, Gempa, Harga, CNC, AI and Kontributor, in addition to manually created articles.
2. Editors need to see whether an external draft is **available**, **picked by me**, or **picked by another Editor** before editing, so that two Editors do not unintentionally work on the same draft.

## Implemented in branch `feature/articles-shared-editor-shell`
- [x] Source dropdown in the existing Filter panel: Semua Sumber, Manual, Eksternal (Semua), KIRA, Gempa, Harga, CNC, Kontributor, AI.
- [x] Status Pick dropdown: Semua Status Pick, Belum Dipick, Dipick Saya, Dipick Editor Lain.
- [x] Existing Search, Status, Site, Category and Ownership can be combined with Source/Pick filters. Reset clears them together; active filter counter includes them.
- [x] Six labeled **dummy** external drafts added without replacing the original ten article samples. Each external row has a source tag and claim status.
- [x] Demo examples: KIRA is handled by Nadia Prameswari, Gempa is handled by Raka Pratama (current fictional demo actor), four others begin Available.
- [x] Available draft: compact `Tersedia` + `Ambil` action. Mine: `Anda menangani` + `Lepaskan` secondary action. Other Editor: `Ditangani Nadia Prameswari` with disabled Settings and no redundant warning text. Controls reuse shared `.nr-btn` Design System with scoped 26px size variant.
- [x] Settings disabled for Available/Other on **external drafts only**. Preview remains available; title click opens the correct read-only dummy Preview instead of a generic Editor route.
- [x] Claim/release updates owner display and My Articles ownership dataset; filter state refreshes. Page-local state resets on reload.
- [x] Light/Dark and mobile layout for source and claim chips. Compact 26px `.nr-btn` controls with 12px typography and DS tokens. User feedback and keyboard focus provided.
- [x] Existing status tab counts reflect the extra demo drafts.
- [x] Previous browser smoke PASSED for Source+Pick combinations, claim/release, already-picked lock, row counts, desktop/mobile, and sidebar/Tools/Preview regressions (run 45123094654). New compact copy and button-size regression pending.
- [ ] Manual Product Design visual QA in Cloudflare branch preview (including Dark Mode), separate from the passing browser smoke.
- [ ] Product Design and Editorial approval on pick/timeout/transfer rules.
- [ ] API integration and production rollout.

## Rules explicitly ASSUMED for UI prototype
- Manual articles: no new Pick requirement.
- Pick is **manual** (not automatic on opening an article).
- Only Draft external articles require a Pick; review/published/scheduled entries are unaffected.
- The current demo actor is `Raka Pratama`, *not* a real authenticated user.
- Only the current picking Editor can release their own claim in this demo; no Redpel override, expiration or auto-release has been implemented.
- Claims and source records are **browser-local only**. The prototype **cannot prevent competing edits in real multi-user sessions**.

## IT integration contract (not implemented)
Use server-owned identifiers rather than display names:
```text
article.id
article.origin.type = manual | external
article.origin.system = kira | gempa | harga | cnc | kontributor | ai | ...
article.origin.external_reference_id
article.workflow.status
article.assignment.picked_by_user_id
article.assignment.picked_at
article.assignment.updated_at
article.assignment.version
```
The authenticated user identity must come from the server. The Pick operation must be atomic (compare-and-set / transaction) and reject a competing pick with **409 Conflict**. The List should refetch/reconcile the returned current owner after 409. Editing an external draft requires the server to re-check ownership/permission on each write; a disabled frontend button is never sufficient.

Releasing a Pick should verify that the caller still owns it, update the version, and notify other Editors via polling or realtime. Editorial and IT must decide timeout, forced reassignment (Redpel), what happens when a browser is closed, how to handle expired claims, and audit logging. Do not publish or merge solely on the prototype's client-side lock.
