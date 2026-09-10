# Newsroom Components

Komponen di bawah adalah kandidat kontrak reusable untuk implementasi Frontend. Nama komponen bersifat referensi arsitektur; engineer boleh menyesuaikan framework selama behavior dan state tetap konsisten.

## Application shell

- `AppSidebar` — navigation utama CMS. Expanded default di desktop, dapat collapse ke icon-only, overlay drawer di viewport sempit.
- `SidebarGroup` — cluster menu yang dapat expand/collapse.
- `SidebarItem` — navigation item dengan icon, label, active, hover, focus, dan collapsed tooltip state.
- `ConnectivityStatus` — Offline / reconnect feedback.
- `AutosaveStatus` — Saving / Saved / failure state.

## Editorial inputs

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

- `AnalyzeArticle` — explicit user-triggered analysis setelah title, short description, dan article content tersedia.
- `AISuggestionReview` — suggestion per field dengan Apply individual dan Apply All. Tidak boleh silent overwrite.

## State contract

Setiap komponen interaktif minimal mendokumentasikan state yang relevan: `default`, `hover`, `focus`, `active/selected`, `disabled`, `loading`, `empty`, `error`, dan `success`. Focus/active product state menggunakan blue system color. Product UI text minimum 12px.
