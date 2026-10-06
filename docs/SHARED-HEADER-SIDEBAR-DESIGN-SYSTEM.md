# Newsroom — Shared Header & Sidebar Design System
**Approved decision:** 23 September 2026; right-panel interaction fix QA on 24 September 2026 — sidebar bawah untuk informasi pengguna login. Berlaku untuk Editor, Dashboard, Tags dan setiap halaman CMS berikutnya.

## Ownership komponen
- **AppHeader:** logo dan konteks halaman di kiri; status pekerjaan / action khusus halaman di kanan. Tidak ada user login chip kedua di header. `dashboard.html` dan `tags.html` memakai `.nr-topbar` dari `styles/newsroom-design-system.css`. Halaman Editor mempertahankan header `.topbar` karena layout autosave dan sticky offset Text toolbar sudah disetujui/di-lock. Style identitas/sidebar dipusatkan di `styles/newsroom-shell.css`, jangan membuat header baru untuk setiap page.
- **AppSidebar:** navigasi menu, search, grouping dan footer user. Editor saat ini memakai `#cmsNavDrawer`, halaman standar `.nr-sidebar`; ukuran/spacing/interaksi tetap mengacu design system bersama. Footer `.cms-nav-bottom` / `.nr-sidebar-bottom` diisi oleh satu controller yang sama: `scripts/newsroom-shell.js`.
- **SidebarAccount:** inisial 38 × 38px, nama, role, chevron. Klik menampilkan informasi user (dan email bila tersedia). Klik luar/Escape menutup. Collapsed desktop hanya avatar dengan title nama/role; mobile drawer menampilkan seluruh informasi. Focus ring biru. Dropdown menampilkan **Profil Saya**, **Pengaturan Akun**, dan **Logout**, dengan separator sebelum Logout. Ketiganya berupa tombol disabled (hanya preview visual; belum melakukan navigasi/perubahan akun).
- **Newsroom AI:** slot lama sidebar bawah dihapus. Editor tetap dapat menggunakan rail AI existing. Lokasi AI global baru menunggu keputusan UX; jangan meletakkannya otomatis di footer akun.

## CollapsibleRightPanel — Editor baseline (2026-09-23)
- Article Settings owns its own toggle at the upper-left of the right panel. When minimized, the panel stays as a 56px-wide icon rail; never move the toggle into the global header or hide it entirely.
- The single rail toggle **replaces** both header Focus Mode and header Settings Drawer controls. Both legacy header controls remain visually hidden for old JavaScript compatibility. Collapsing the panel gives more width to the writing area without hiding the editor header, left navigation or autosave. In collapsed state a readable vertical **Article Settings** label sits beneath the icon; the entire rail is a pointer target, while the icon button is keyboard accessible.
- Expanded width: 390px on desktop; narrow screens allow an overlay no wider than the viewport. Collapsed width: 56px. The workspace center uses fluid width and recalculates the available area from the left (236px/64px) and right (390px/56px) panel widths; when both minimize, the writing canvas fills the newly available space. Keep current active Editorial/SEO/Validasi tab and field values on every toggle. Persist state under `newsroom:right-panel-collapsed`. On a first visit at width ≤1024px, start collapsed.
- Use `styles/newsroom-right-panel.css` and `scripts/newsroom-right-panel.js` as shared component sources. Because the static `index.html` preview may serve stale external assets, its current build embeds those two source files directly. Keep both copies synchronized whenever the right-panel pattern changes; other pages can load the shared files. The toggle markup is also included in the Editor HTML so the control is not delayed by dynamic insertion.
- **Header cleanup:** Focus Mode and legacy Settings Drawer controls are physically moved outside the Editor header into a hidden compatibility container for older JS. The separate legacy scripts that previously re-created a Focus Mode icon in the header and in the Writing View dropdown have also been updated to stop rendering these actions; a defensive shared CSS hide protects against stale clones. Expand/collapse must not affect the previously approved and protected Text toolbar sticky positions or corner geometry. Desktop header logo is increased within the original 68px header rather than enlarging header height.
- The right panel uses the same Lucide icon naming as the left CMS menu: `panel-right-close` while expanded, `panel-right-open` while collapsed. Its entire collapsed rail is a single accessible toggle.
- A body-class observer and responsive resizing synchronize real workspace left/right padding when either panel changes. Both state changes and canvas dimensions are verified by the headless Chromium `tests/editor-sidebar-smoke.cjs` test (GitHub Actions `editor-sidebar-smoke.yml`). Additional visual QA should cover browser zoom, mobile drawers, long scroll, field editing and restoration of active tab.

## Shared tokens / assets
- `styles/newsroom-design-system.css`: struktur header/sidebar halaman CMS standar.
- `styles/newsroom-shell.css`: tokens dan implementasi visual akun yang sama untuk Editor, Dashboard dan Tags.
- `scripts/newsroom-shell.js`: render akun, interaksi popover dan penggantian slot AI lama.
- New pages **wajib** menyertakan stylesheet shell dan script shell, serta node `.nr-sidebar-bottom` pada sidebar dan header `.nr-topbar`. Editor mempertahankan mark-up khususnya untuk menjaga baseline sticky toolbar.

## Data contract (preview vs production)
Halaman preview tanpa autentikasi menampilkan `Avi Yansah / Editor` sebagai **contoh**, tanpa keterangan demo yang memenuhi area dropdown. Identitas tersebut masih dummy; ketiga menu akun tampil tetapi disabled sampai integrasi fitur akun tersedia. Frontend production harus menyuplai objek terautentikasi sebelum menjalankan script:

```js
window.NEWSROOM_AUTH_USER = {
  name: session.user.name,
  role: session.user.role,
  email: session.user.email
};
```

Jangan membaca identitas login dari `Reporter`, `Editor` yang ditugaskan di artikel, `presenceName`, atau data artikel lain.

## Acceptance checks
1. Editor, Dashboard dan Tags menampilkan posisi/properti profil yang sama di footer sidebar.
2. Header halaman standar tidak menduplikasi identitas. Header Editor beserta autosave, sticky offset, floating Text toolbar tidak berubah.
3. Account popover berfungsi dengan klik, klik luar, Escape; avatar tetap dapat digunakan saat sidebar collapsed.
4. Mobile drawer masih memperlihatkan identitas lengkap.
5. Tidak ada tombol Newsroom AI lama di sidebar bawah; AI Editor rail existing tetap tersedia.
6. Dropdown berisi Profil Saya, Pengaturan Akun, dan Logout; ketiga aksi belum berfungsi pada preview dan tidak membuat klaim logout berhasil. Integrasi login membutuhkan data autentikasi yang benar.

**Perubahan UX header/sidebar selanjutnya wajib mengikuti kontrak ini di seluruh halaman**, bukan hanya halaman Editor.

## Single source of truth untuk shell halaman (6 Oktober 2026)
- **Reference visual/IA:** Editor `index.html` di `/`. Logo KLY, site selector (Liputan6 / KapanLagi / Bola.com / Merdeka.com), urutan/cluster menu lengkap dan spacing diambil dari baseline Editor yang sudah disetujui.
- **Shared runtime:** `scripts/newsroom-global-navigation.js` menjadi sumber **tunggal** header kiri + navigation menu untuk semua halaman CMS standar: `articles.html`, `dashboard.html`, `tags.html`. Ini menggantikan sidebar/menu berbeda yang sebelumnya ditulis manual pada masing-masing halaman saat render.
- **Shared styling:** `styles/newsroom-global-navigation.css`; standard pages tidak boleh membuat header/site switcher/daftar menu baru sendiri.
- **Editor compatibility:** Editor tetap mempertahankan markup dan styling existing sebagai referensi karena JS/editor layout, autosave, dan sticky-toolbar sangat bergantung pada DOM Editor. Penyatuan render Editor ke shared runtime belum dilakukan; perubahan berikutnya pada baseline Editor harus disinkronkan ke komponen bersama sampai refactor tersebut aman.
- **Footer akun:** `scripts/newsroom-shell.js` dan `styles/newsroom-shell.css` dipakai semua halaman workspace.
- **Active navigation:** hanya menu aktif sesuai halaman yang berbeda. Menu Tags menuju `tags.html`, Articles menuju `articles.html`, klik KLY pada halaman standar menuju Dashboard.
- **Pengecualian:** `login.html` adalah halaman autentikasi sebelum aplikasi dibuka dan tidak menampilkan menu editorial/header workspace.
- **QA wajib:** periksa header site switcher, sidebar search, expand/collapse desktop, drawer mobile, account footer, zoom 125%/150%, navigation and autosave di Editor; pastikan menu terlihat sama di Editor, Articles, Dashboard, Tags.
