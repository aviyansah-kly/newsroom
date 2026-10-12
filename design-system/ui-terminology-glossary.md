# Newsroom — UI Terminology Glossary

**Status:** Canonical naming contract for UI/UX and frontend engineering.
**Scope:** Navigation, field labels, validation, modal titles, buttons, and dynamic component text across Newsroom.

## Canonical terms
| Concept | Use this | Avoid these alternatives | Notes |
|---|---|---|---|
| Article headline | Judul Artikel | Title, Judul, Headline (when referring to article title) | Headline Image is a separate media field |
| Article summary/dek | Short Desc | Ringkasan / Dek, Short Description (when referring to article summary) | Deskripsi video/gambar are separate concepts |
| Article body | Konten Artikel | Article Body, Isi Artikel (as UI field title) | Text Block is a content subtype |
| Main image | Headline Image | Gambar Utama (as field title) | Descriptive helper text may use Indonesian |
| SEO main keyword | SEO Keyword | Primary Keyword (as field title) | Maintain field ID `seoKeyword` |
| Final review action | Review & Publish | Review and Publish | Published article variant remains Review & Update |
| Validation warning section | Perlu Perhatian | Perlu Diperbaiki (as the group heading) | Use **Perbaiki** as the CTA; sentence text may say 'perlu diperbaiki' |
| Publication scheduling | Schedule Publish | Schedule Publishing, Schedule Publication | Same label in modal header, assistive title and toggle |
| Scheduling fields | Date, Time | Tanggal/Jam in the same UI flow | Product localization may be decided separately |
| Editorial panel tabs | Editorial, SEO | Validation as third tab | Validation belongs in Review & Publish |
| Article status | Draft, Scheduled, Published | Inconsistent synonyms | Status may have secondary descriptors Editing, Waiting, Live |
| Autosave | Autosave status | Save Draft button | No manual Save Draft CTA |

## Guidelines
- Field titles use Title Case (see [Field Label Title Case](../design-system/field-label-title-case.md)).
- Keep exact acronyms and brands (`SEO`, `AI`, `URL`, `Liputan6`, `Vidio.com`).
- One concept has one canonical **display label**. Different concepts can retain distinct labels (e.g. Article Short Desc versus Video Short Description).
- Separate display strings from IDs, keys, storage identifiers, API payloads, dataset attributes, event names, and internal logic.
- Contextual helper messages use natural sentence case and do not need to mechanically repeat capitalized field labels.
- Prefer central `uiCopy` / localization mapping in production. Do not use whole-file string replacements, CSS pseudo-content, or text-transform to enforce terminology.

## QA checklist
1. Compare static and runtime-rendered labels on Workspace Editor, Articles, Dashboard, Tags and Login.
2. Exercise Review & Publish, schedule on/off, Editorial and SEO tabs, AI suggestions, and all Content Block types.
3. Confirm same concept uses same wording in field label, validation row, tab, modal, tooltip and accessibility label.
4. Verify no selectors, field IDs, validators, routing, or save/publish events change due to copy work.
5. Review mobile states, errors, empty states, tooltips, toast messages and conditional features before declaring full coverage.

## Implementation status
The October 2026 copy alignment normalized the known key conflicts in Workspace Editor: article summary, schedule heading/toggle, SEO keyword and review warning heading. Other wording in dynamic states and secondary pages must be verified with browser QA before asserting the entire UI has zero variants.
