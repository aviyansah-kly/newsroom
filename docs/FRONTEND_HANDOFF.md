# Newsroom — Frontend Handoff

## Source of truth

Repository ini adalah source of truth untuk prototype Newsroom yang dipakai. Repository `cms-liputan6-alternatif3` hanya archive eksplorasi dan histori iterasi.

## Current product structure

- Left: persistent `AppSidebar` sebagai navigasi utama CMS.
- Center: writing-first editor — Judul Artikel, Short Description, lalu content cards.
- Right: Article Settings dengan tab Editorial, SEO, dan Validasi.
- Header: autosave, connectivity/offline feedback, preview, dan publishing actions.

## Core UX contracts

1. Navigation harus berupa link/URL; action dalam halaman berupa button.
2. Desktop sidebar expanded by default dan dapat collapse. Mobile/tablet memakai overlay/drawer.
3. Dashboard adalah bagian navigasi utama; Articles menjadi active context saat editor artikel dibuka.
4. Import Draft sementara tidak ditampilkan.
5. Product UI text minimum 12px.
6. Active/focus state memakai blue, bukan orange.
7. AI suggestion hanya diterapkan setelah user review; jangan silent overwrite.
8. Offline state harus terlihat dan perubahan lokal tidak boleh diklaim sudah tersinkron ke server.

## Prototype-only behavior — jangan dianggap backend contract

Prototype saat ini masih memiliki simulated AI, dummy media metadata, local/session/in-memory autosave fallback, dan sebagian interaction berbasis DOM. Hal ini hanya untuk membuktikan flow dan visual behavior. Implementasi production perlu API contract, persistence, authentication/authorization, media upload service, validation, approval, dan publishing service yang disepakati tim IT.

## Recommended frontend decomposition

- `app-shell/`: AppHeader, AppSidebar, ConnectivityStatus, AutosaveStatus.
- `editor/`: ArticleComposer, ContentCard, WysiwygToolbar, AddContentMenu.
- `article-settings/`: EditorialSettings, SEOSettings, ValidationSettings, SettingsCluster.
- `media/`: HeadlineImage, ImagePicker, ContentImageCard.
- `shared/`: CategoryPicker, EntityPicker, TagInput, Tabs, Button, Input, Modal/Popover.
- `ai/`: AnalyzeArticle, AISuggestionReview.

## Definition of done for implementation

A production implementation should match layout hierarchy, component states, responsive behavior, keyboard/focus behavior, validation feedback, offline state, and editorial flows documented in this repo. Business/API behavior must use real services rather than prototype simulation.
