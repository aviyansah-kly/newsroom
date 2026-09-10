# Newsroom

Newsroom adalah source of truth untuk prototype dan handoff CMS editorial Liputan6.

## Purpose

Repository ini hanya memuat versi yang sedang dipakai untuk delivery ke Product, IT, dan Frontend Engineer. Histori eksplorasi/alternatif tetap berada di repository lama `cms-liputan6-alternatif3` dan tidak dibawa ke sini.

## Structure

- `index.html` — current Newsroom editorial prototype, langsung dibuka dari root deployment.
- `design-system/` — foundations, reusable components, dan editorial patterns.
- `docs/` — frontend handoff dan mapping prototype ke design-system contract.

## Product naming

Canonical product name: **Newsroom**.

Target preview hostname: `newsroom.avi-yansah.workers.dev`.

## Handoff principle

Navigation menggunakan link/URL, action menggunakan button, toggle menggunakan button dengan state yang eksplisit. Prototype-only patches, versioned refinement scripts, dummy backend behavior, dan histori eksperimen tidak dianggap sebagai production contract.
