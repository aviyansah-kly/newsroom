# Newsroom Editorial Patterns

## Writing-first workflow

Editor masuk ke composer dan fokus pada Judul Artikel → Short Description → isi Artikel. Metadata pendukung berada di Article Settings agar writing area tidak dipenuhi form administratif.

## Metadata & publishing

Article Settings dibagi menjadi Editorial, SEO, dan Validasi. Editorial menampung Headline Image, Category, Article Type, Location, Tags, Reporter/Editor, schedule, dan publishing metadata yang relevan. SEO berisi field SEO. Validasi menjadi tempat status/check yang memang membutuhkan perhatian user.

## Analyze Article

Analyze Article adalah explicit action. AI membaca title, short description, dan article content lalu menawarkan suggestion untuk metadata/SEO. User dapat Apply per field atau Apply All. Suggestion tidak boleh menimpa value user secara diam-diam.

## Media selection

Setiap image selection menyediakan dua sumber utama: Image Gallery dan Upload Image. Gallery dapat memiliki filter Gallery Artikel/Image Bank. Upload memiliki validation MIME/size dan preview sebelum Use Image. Implementasi production harus memakai media/upload service; Data URL prototype bukan persistence contract.

## Offline & autosave

Saat browser offline, Newsroom menampilkan status `Offline` dan menjelaskan bahwa perubahan disimpan lokal. Saat koneksi kembali, tampil feedback `Kembali online`. Production harus membedakan dengan jelas antara `saved locally` dan `synced to server`.

## Navigation

Desktop menggunakan AppSidebar expanded by default dan dapat collapse menjadi icon-only. Dashboard adalah bagian menu utama, Articles menjadi active context untuk editor artikel. Search membantu akses long-tail menu. Pada viewport sempit sidebar menjadi overlay/drawer.
