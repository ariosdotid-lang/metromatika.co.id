# Changelog

Catatan perubahan website PT Metromatika Teknologi Rekayasa.

## 0.3.0 — 2026-11-19

### Ditambahkan

- Demo pengajuan inventaris pada layanan Pengembangan Website dengan tahap pilih perangkat, tinjau, dan hasil.
- Validasi jumlah unit berdasarkan stok contoh, ringkasan permintaan, dan bukti simulasi DEMO-001.
- Pengurangan stok yang disinkronkan dengan ilustrasi, tabel, dan jumlah total perangkat.
- Pilihan mengubah permintaan sebelum disimpan serta mengulang demo dengan data awal.

### Keandalan dan aksesibilitas

- Penyimpanan simulasi hanya mengurangi stok satu kali meskipun tombol diklik berulang.
- Form memakai label, validasi bawaan browser, penanda tahap, status, dan perpindahan fokus.
- Demo berjalan di browser dengan data lokal dan pulih ke kondisi awal ketika halaman dimuat ulang.

### Validasi

- Menguji data kosong, nol, pecahan, jumlah melebihi stok, jumlah penuh, perubahan permintaan, dan reset.
- Memeriksa target sentuh serta overflow pada lebar 360, 390, 768, 1024, dan 1440 px.

## 0.2.0 — 2026-11-19

### Ditambahkan

- Urutan scroll hero dengan kamera mendekati modul jaringan, aplikasi dan cloud, lalu keamanan.
- Pembukaan modul 3D secara bertahap, detail rel tembaga, dan ventilasi perangkat.
- Caption penjelas serta penanda bab yang mengikuti posisi scroll.

### Diperbaiki

- Pilihan scene manual tetap aktif hingga scroll berikutnya.
- Tombol jeda membekukan urutan otomatis, dengan dukungan reduced motion dan viewport pendek.
- Preferensi gerak disinkronkan dengan animasi bagian lain.
- Render dibatasi hingga 30 fps dan sumber daya WebGL dilepas saat halaman ditutup.
- Bundle 3D diperbarui agar tetap bekerja melalui file lokal.

### Validasi

- Menguji kamera, pilihan scene, jeda, dan perubahan reduced motion di Chrome.
- Memeriksa overflow pada lebar 360, 390, 768, 1024, dan 1440 px.

## 0.1.0 — 2026-11-19

### Kondisi awal yang disimpan

- Menyimpan website lokal beserta beranda, enam halaman layanan, aset merek, dan pustaka yang digunakan.
- Menyertakan hero WebGL, pilihan scene, tombol jeda, animasi scroll, filter layanan, dan formulir konsultasi WhatsApp.
- Menyertakan enam panel data demo layanan, referensi konsep, metadata SEO, robots.txt, dan sitemap.xml.
- Memuat kode 3D sebagai bundle agar beranda dapat dibuka langsung melalui file lokal.
- Mengabaikan berkas metadata Finder melalui .gitignore.
