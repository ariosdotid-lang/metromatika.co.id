# Changelog

Catatan perubahan website PT Metromatika Teknologi Rekayasa.

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
