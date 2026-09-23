# Newsroom — Shared Header & Sidebar Design System
**Approved decision:** 23 September 2026 — sidebar bawah untuk informasi pengguna login. Berlaku untuk Editor, Dashboard, Tags dan setiap halaman CMS berikutnya.

## Ownership komponen
- **AppHeader:** logo dan konteks halaman di kiri; status pekerjaan / action khusus halaman di kanan. Tidak ada user login chip kedua di header. `dashboard.html` dan `tags.html` memakai `.nr-topbar` dari `styles/newsroom-design-system.css`. Halaman Editor mempertahankan header `.topbar` karena layout autosave dan sticky offset Text toolbar sudah disetujui/di-lock. Style identitas/sidebar dipusatkan di `styles/newsroom-shell.css`, jangan membuat header baru untuk setiap page.
- **AppSidebar:** navigasi menu, search, grouping dan footer user. Editor saat ini memakai `#cmsNavDrawer`, halaman standar `.nr-sidebar`; ukuran/spacing/interaksi tetap mengacu design system bersama. Footer `.cms-nav-bottom` / `.nr-sidebar-bottom` diisi oleh satu controller yang sama: `scripts/newsroom-shell.js`.
- **SidebarAccount:** inisial 38 × 38px, nama, role, chevron. Klik menampilkan informasi user (dan email bila tersedia). Klik luar/Escape menutup. Collapsed desktop hanya avatar dengan title nama/role; mobile drawer menampilkan seluruh informasi. Focus ring biru. Tidak membuat aksi logout/settings tiruan pada preview.
- **Newsroom AI:** slot lama sidebar bawah dihapus. Editor tetap dapat menggunakan rail AI existing. Lokasi AI global baru menunggu keputusan UX; jangan meletakkannya otomatis di footer akun.

## Shared tokens / assets
- `styles/newsroom-design-system.css`: struktur header/sidebar halaman CMS standar.
- `styles/newsroom-shell.css`: tokens dan implementasi visual akun yang sama untuk Editor, Dashboard dan Tags.
- `scripts/newsroom-shell.js`: render akun, interaksi popover dan penggantian slot AI lama.
- New pages **wajib** menyertakan stylesheet shell dan script shell, serta node `.nr-sidebar-bottom` pada sidebar dan header `.nr-topbar`. Editor mempertahankan mark-up khususnya untuk menjaga baseline sticky toolbar.

## Data contract (preview vs production)
Halaman preview tanpa autentikasi menampilkan `Avi Yansah / Editor` sebagai **contoh**, dan popover menjelaskan bahwa identitas ini belum berasal dari login asli. Frontend production harus menyuplai objek terautentikasi sebelum menjalankan script:

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
6. Identitas preview diberi penanda dalam popover; integrasi login membutuhkan data autentikasi yang benar.

**Perubahan UX header/sidebar selanjutnya wajib mengikuti kontrak ini di seluruh halaman**, bukan hanya halaman Editor.
