# Changelog

Catatan perubahan website PT Metromatika Teknologi Rekayasa.

## 0.4.0 — 2026-11-19

### CMS dan portal

- Menambahkan portal PHP untuk 131 kolom konten beranda dan enam halaman layanan.
- Menambahkan login admin, aktivasi dengan kode privat sekali pakai, dan pergantian kata sandi.
- Menambahkan simpan draf, pratinjau, publikasi HTML, dan pemulihan sepuluh versi sebelumnya.
- Menambahkan pengelolaan harga, FAQ, lingkup layanan, kontak, SEO, logo, serta media unggahan.
- Memisahkan template, schema editor, konten awal, dan penyimpanan runtime privat.
- Menyambungkan nomor WhatsApp serta keterangan visual layanan dengan konten CMS.

### Keandalan dan aksesibilitas

- Mengunci penulisan dan menolak penyimpanan dari versi draf yang sudah berubah.
- Memakai jurnal untuk memulihkan halaman serta keadaan setelah publikasi terputus.
- Mengamankan sesi, CSRF, pembatasan percobaan login, validasi gambar, dan escaping konten.
- Mempertahankan input baru yang diketik selama respons penyimpanan masih ditunggu.
- Menyesuaikan tata letak untuk judul panjang, nama layanan panjang, dan proporsi logo yang berbeda.
- Menambahkan antarmuka responsif, label formulir, fokus, dialog pratinjau, dan dukungan pengurangan gerak.

### Dokumentasi dan validasi

- Memperbarui README, AGENTS.md, pola ignore, serta aturan crawler portal.
- Menguji backend pada PHP 8.4 dengan penyimpanan sementara dan menjalankan pemeriksaan sintaks.
- Memeriksa alur aktivasi, edit, draf, pratinjau, publikasi, media, riwayat, dan akun melalui browser.
- Memeriksa overflow portal pada lebar 360, 390, 768, 1024, dan 1440 px.

## 0.3.1 — 2026-11-19

### Dokumentasi dan workflow

- Menambahkan README.md proyek yang menjelaskan pratinjau lokal, struktur berkas, build bundle 3D, data demo, dan pemeriksaan perubahan.
- Menambahkan AGENTS.md untuk menjaga workflow implementasi, validasi, pembaruan dokumentasi, commit setiap kelompok perubahan, dan push yang diminta pengguna.
- Memperluas .gitignore untuk metadata editor, konfigurasi lokal, dependensi, cache, log, dan keluaran pemeriksaan.
- Mempertahankan Readme.txt sebagai atribusi template awal.

### Validasi

- Memeriksa rujukan berkas dan perintah pada dokumentasi serta sintaks JavaScript aktif.
- Memeriksa pola ignore, berkas yang dilacak, diff, dan tujuan remote sebelum commit serta push.

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
