# Pembaruan animasi 0.4.3

Gunakan paket `metromatika-animasi-smooth-0.4.3.zip` untuk website yang sudah memakai CMS. ZIP ini berisi empat berkas animasi di `assets/redesign/`, serta README, changelog, dan panduan ini.

## Unggah melalui cPanel

1. Buka File Manager pada document root `metromatika.co.id`. Gunakan folder yang sudah berisi `index.html`, `assets/`, `admin/`, dan `cms/`.
2. Unggah ZIP, lalu pilih Extract pada folder yang sama. Timpa berkas dengan nama yang sama. Pertahankan isi website yang sudah ada; paket ini merupakan pembaruan aset.
3. Hapus ZIP dari folder publik setelah ekstraksi selesai.
4. Jika memakai cache hosting atau CDN, bersihkan cache untuk `assets/redesign/motion.bundle.js`, `scroll-motion.js`, dan `enterprise.css`. Muat ulang website dengan Cmd+Shift+R pada Mac atau Ctrl+Shift+R pada Windows/Linux.
5. Periksa animasi hero, pilihan konektivitas/cloud/keamanan, tombol jeda, dan perpindahan saat scroll. Preferensi pengurangan gerak pada perangkat tetap dihormati.

Tidak perlu memublikasikan ulang konten melalui portal. Paket tidak mengganti `index.html`, halaman layanan, template CMS, akun, draf, konfigurasi lokal, maupun media unggahan.

## Perubahan

Bagian server yang berulang kini digambar bersama, batas 30 fps dilepas, dan resolusi render menyesuaikan beban. Parallax bergerak menuju posisi tujuannya secara bertahap, lalu berhenti saat stabil. Konten yang sudah muncul tetap terbaca ketika menggulir kembali ke atas.

Pengujian lokal Chrome pada Mac M1 menunjukkan penurunan median panggilan gambar dari 392 ke 66 per frame dan interval frame dari 49,9 ke 16,7 ms. Perangkat lain, browser, mode hemat daya, dan beban tab dapat menghasilkan kelancaran yang berbeda. Ukuran layar diuji melalui emulasi browser; pemeriksaan pada perangkat fisik lain belum dilakukan.
