# Newsroom Components

Komponen di bawah adalah kandidat kontrak reusable untuk implementasi Frontend. Nama komponen bersifat referensi arsitektur; engineer boleh menyesuaikan framework selama behavior dan state tetap konsisten.

## Application shell

- `AppHeader` — shell header di seluruh CMS: logo, konteks halaman, dan status/aksi pekerjaan yang relevan. Standard pages menggunakan `.nr-topbar`, `.nr-brand`, `.nr-header-context`; Editor mempertahankan `.topbar` dengan status autosave dan action kontekstual karena layout menulis yang sudah disetujui. Jangan menaruh identitas login duplikat di header. Keduanya wajib mengikuti [Shared shell contract](../../docs/SHARED-HEADER-SIDEBAR-DESIGN-SYSTEM.md).
- `AppSidebar` — navigation utama CMS, termasuk user account permanen di kiri bawah. Gunakan stylesheet `styles/newsroom-shell.css` dan controller `scripts/newsroom-shell.js` bersama pada Editor, Dashboard dan Tags; nav per halaman hanya berbeda pada active item atau cluster terbuka.
- `SidebarGroup` — cluster menu yang dapat expand/collapse.
- `SidebarItem` — navigation item dengan icon, label, active, hover, focus, dan collapsed tooltip state.
- `SidebarAccount` — avatar inisial, nama, role, expandable account info dan demo-state yang jelas; sama di semua halaman. Identity production disuplai `window.NEWSROOM_AUTH_USER` dari autentikasi CMS, bukan dari reporter/editor artikel. Sidebar collapsed hanya memperlihatkan avatar; tablet/mobile tetap memperlihatkan detail di drawer.
- `ConnectivityStatus` — Offline / reconnect feedback.
- `AutosaveStatus` — Saving / Saved / failure state.

## Editorial inputs

- `SelectControl` — dropdown standar menggunakan class `.nr-select`. Chevron memiliki safe-area di kanan dan tidak boleh menempel pada border control.
- `CategoryPicker` — searchable hierarchical category picker.
- `EntityPicker` — reusable multi-select untuk Reporter, Editor, dan entity lain.
- `TagInput` — tags + suggested candidates + removable chips.
- `SettingsCluster` — group metadata pada Article Settings dengan separator dan spacing konsisten.
- `Tabs` — Editorial / SEO / Validasi. Hanya Validasi boleh memiliki count/status badge.

## Media

- `HeadlineImage` — 16:9 selected/empty state, Gallery atau Upload Image.
- `ImagePicker` — Gallery Artikel / Image Bank / Upload Image, selection preview, Use Image.
- `ContentImageCard` — information left, action/preview right.

## Writing

- `ContentCard` — Text, Photo, Video, Page Break, Embed, Klasemen.
- `WysiwygToolbar` — formatting dan editorial inserts.
- `ContentAddMenu` — one-row add-content actions.

## AI

- `AnalyzeArticle` — explicit user-triggered analysis setelah title, short description, dan article content tersedia. Primary AI generation action uses the purple AI provenance color so the trigger visually matches AI-filled review states.
- `AISuggestionReview` — suggestion per field dengan Apply individual dan Apply All. Tidak boleh silent overwrite.
- `AIFieldReviewState` — reusable state untuk setiap field yang diisi AI. Gunakan purple provenance tokens, animated outline selama belum direview, dan compact sparkle review control tanpa text label. State kembali normal setelah editor menandai reviewed atau mengubah value secara manual.

## Button hierarchy

Gunakan semantic role, bukan memilih warna langsung.

- `CommitButton` — orange. Hanya untuk aksi final/commit yang berdampak besar: Review & Publish, Publish, Submit, Confirm, Use Image.
- `WorkButton` — blue. Untuk aksi kerja/editorial: Pilih dari Gallery, Analyze Article, Generate SEO, Apply Suggestion, Apply All, add/select action.
- `NeutralButton` — white/gray. Untuk Preview, Mode Fokus, Upload Image, Cancel, Back, More.
- `DangerButton` — red. Hanya untuk Delete, Remove, Discard yang destructive.
- Green dan amber adalah warna status/feedback, bukan default CTA.

Dalam satu action group, idealnya hanya ada satu `CommitButton`. Focus, selected state, active tab, dan selection outline selalu menggunakan blue system color.

## State contract

Setiap komponen interaktif minimal mendokumentasikan state yang relevan: `default`, `hover`, `focus`, `active/selected`, `disabled`, `loading`, `empty`, `error`, dan `success`. Focus/active product state menggunakan blue system color. Product UI text minimum 12px.
