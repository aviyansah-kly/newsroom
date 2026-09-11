# Newsroom Action Color Guide

## Principle

Newsroom membedakan warna berdasarkan **fungsi aksi**, bukan berdasarkan penting/tidak penting secara visual.

- **Orange = Commit** — menyelesaikan, mengirim, menerbitkan, atau menerapkan pilihan final.
- **Blue = Work** — melakukan pekerjaan/editorial action di dalam flow.
- **Neutral = Utility** — membantu navigasi atau operasi sekunder tanpa commitment.
- **Red = Destructive** — menghapus atau membuang data/hasil kerja.
- **Green / Amber = Status** — feedback keberhasilan/peringatan; bukan default CTA.

## Semantic tokens

Gunakan token dari `design-system/foundations/tokens.css`:

- `--ds-action-commit`
- `--ds-action-commit-hover`
- `--ds-action-work`
- `--ds-action-work-hover`
- `--ds-action-work-soft`
- `--ds-action-neutral-bg`
- `--ds-action-neutral-text`
- `--ds-action-neutral-border`

Jangan hard-code `#f4511e` atau `#2563eb` pada komponen baru bila semantic token dapat digunakan.

## Mapping contoh

| Action | Semantic role | Color |
| --- | --- | --- |
| Review & Publish | Commit | Orange |
| Publish Now | Commit | Orange |
| Gunakan Image | Commit | Orange |
| Confirm / Submit final | Commit | Orange |
| Pilih dari Gallery | Work | Blue |
| Analyze Article | Work | Blue |
| Generate SEO | Work | Blue |
| Apply Suggestion / Apply All | Work | Blue |
| Add Content / Select | Work | Blue |
| Pratinjau | Neutral | White / Gray |
| Mode Fokus | Neutral | White / Gray |
| Upload Image | Neutral | White / Gray |
| Batal / Back / More | Neutral | White / Gray |
| Delete / Remove / Discard | Destructive | Red |

## Rules

1. Dalam satu action group, idealnya hanya ada **satu Commit action**.
2. Orange tidak digunakan untuk focus ring, selected card, active tab, atau current navigation.
3. Focus, selected, active tab, dan selection outline selalu blue.
4. Green tidak dipakai sebagai tombol primary; gunakan untuk saved/success/readiness state.
5. Amber tidak dipakai sebagai tombol primary; gunakan untuk warning/needs attention.
6. Bila aksi tampak penting tetapi belum melakukan commitment, tetap gunakan Work/Blue.
7. Utility action tidak perlu diberi warna hanya agar terlihat penting; prioritaskan hierarchy melalui placement, label, dan spacing.

## Handoff naming

Untuk design dan engineering, gunakan nama semantic berikut pada Figma/component API jika memungkinkan:

- `button/commit`
- `button/work`
- `button/neutral`
- `button/danger`

State minimal: `default`, `hover`, `focus`, `pressed`, `disabled`, `loading`.
