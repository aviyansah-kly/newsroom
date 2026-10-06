# Article Index — Settings UX contract (prototype, 6 October 2026)

**Page:** `articles.html`. **Source:** `scripts/article-editorial-refinement.js`, `styles/article-editorial-refinement.css`.

## Workflow
| Control | Intended behavior | Preview behavior / requirements |
|---|---|---|
| Open URL | Opens final published article in a separate tab. | Disabled for non-published rows. For published demo rows without a verified public URL, inform that real URL data is unavailable; **do not** open the editing page as the public URL. |
| Publish / Unpublish | Lifecycle transition after editorial checks, permissions, confirmation, scheduling conflict checks. | Non-destructive notice only; does not change published status or send API request. |
| Distribution | Enable or disable distribution integration per article, with channel-level details on a dedicated screen when available. | Toggle visual indicator and menu selected state only. |

## Placement
| Control | Intended behavior | Preview behavior |
|---|---|---|
| Headline: Homepage / TV | Editorial promotion placement, subject to available slots & permissions. | Inline expanding group; single selection within Headline, state indicator in row. |
| Pin: Homepage / TV | Pin a story to a target surface, with scheduling/priority when integrated. | Inline expanding group; single selection within Pin, state indicator in row. |
| Curated | Mark for manually curated content pools. | Toggle on/off, render row indicator. |
| Exclude | Remove story from designated automatic discovery/curation flows, not necessarily all distribution; eventual product needs a precise scope. | Toggle indicator; scope must be finalized before backend. |

## Ads & Content
| Control | Intended behavior | Preview behavior |
|---|---|---|
| Ads Desktop / Ads Mobile | Enable/disable article ad placements for respective screens (subject to ad policy). | Independent toggles, separate desktop/mobile icons. |
| Adult Content | Apply sensitive/adult-content classification with moderation and policy effect. | Toggle visual indicator; must not change real policy classification. |

## Technical
| Control | Intended behavior | Preview behavior |
|---|---|---|
| Feedback | Open editor feedback/issue notes for the article. | Explanatory message until CMS module is integrated. |
| Bypass Varnish | Invalidate or bypass cache after explicit authorized confirmation, with audit trail. | Informational only; no server action. |
| Google Testing Tools | Open relevant Google URL testing tools for public article URL. | Informational only until a real public URL exists. |

## UI rules
1. Keep title at the top of each article; show category, description, metadata and active settings in separate groups with consistent 6–10px spacing. Status, reporter/editor and update info align to row top.
2. Active settings are **indicators** under article metadata, not extra unlabeled click actions. Each is exactly 28×28px, icon is 15×15px centered; include a descriptive accessible label and hover title.
3. Popup uses **one scrollable panel**: workflow and direct placement toggles visible; headline, pin, ads and advanced tools expand **inline**. No sideward submenu that can clip.
4. Button hit targets ~40px tall, at least 4px vertical gap. Only one accordion group opens at a time; clear expanded/selected states.
5. Status cannot be altered via a silent Settings click; publish changes require real workflow, permissions and confirmation in production.
6. Preview state is not persisted to server or localStorage. Do not describe these controls as integrated actions.
7. Article editing remains via headline; preview icon is distinct from article public URL.
8. QA with 100%, 125%, 150% browser zoom and 375/768/1280/1440px screens; keyboard and pointer interaction; popup near bottom row, with 0/1/multiple active indicators.
