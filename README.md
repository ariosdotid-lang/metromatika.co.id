# Metromatika

Website PT Metromatika Teknologi Rekayasa untuk layanan produk digital, konektivitas, cloud, dan keamanan siber.

Beranda memuat hero WebGL yang mengikuti scroll, penjelajah layanan, enam panel data demo, simulasi pengajuan inventaris, FAQ, dan formulir konsultasi WhatsApp. Enam halaman layanan berisi rincian pekerjaan dan kontak konsultasi.

## Menjalankan website

Buka `index.html` langsung di browser. Aset, font, data contoh, dan bundle 3D disimpan di repositori sehingga pratinjau `file://` dapat digunakan.

Untuk pengembangan melalui server lokal, jalankan dari direktori repositori.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Kemudian buka [pratinjau lokal](http://127.0.0.1:8000). Pengunjung membutuhkan browser yang mendukung WebGL untuk melihat scene 3D. Gambar pengganti tampil ketika WebGL tidak tersedia. Tombol jeda dan preferensi pengurangan gerak mengendalikan animasi. Urutan scroll hero aktif pada viewport dengan tinggi minimal 760 px ketika pengurangan gerak dimatikan dan konten muat di layar. Viewport yang lebih pendek atau konten yang lebih panjang menggunakan hero tanpa penahanan scroll.

## Struktur proyek

| Lokasi | Isi |
| --- | --- |
| `index.html` | Snapshot publik beranda yang diterbitkan dari template CMS |
| `layanan/*/index.html` | Snapshot publik enam halaman detail layanan |
| `assets/redesign/styles.css` | Gaya dasar situs |
| `assets/redesign/enterprise.css` | Desain aktif, tampilan responsif, dan animasi |
| `assets/redesign/app.js` | Navigasi, filter layanan, dan formulir WhatsApp |
| `assets/redesign/scroll-motion.js` | Pilihan layanan dan animasi bagian halaman |
| `assets/redesign/motion.js` | Sumber scene 3D Three.js |
| `assets/redesign/motion.bundle.js` | Bundle browser yang dimuat beranda |
| `assets/redesign/equipment-demo.js` | Simulasi permintaan perangkat dan stok |
| `assets/img/` | Logo dan aset gambar |
| `robots.txt`, `sitemap.xml` | Petunjuk crawler dan URL canonical |
| `admin/` | Antarmuka portal dan API PHP |
| `cms/` | Renderer, autentikasi, template, schema, dan konten awal |
| `tests/cms_test.py` | Uji regresi backend dalam lingkungan sementara |
| `AGENTS.md` | Alur kerja untuk agent yang mengerjakan repo |
| `CHANGELOG.md` | Riwayat perubahan yang dikirim dalam commit |

Berkas di `assets/css/`, `assets/js/`, beberapa halaman HTML tambahan, dan `forms/` berasal dari template awal. Periksa tag stylesheet serta script pada halaman yang sedang dikerjakan untuk menentukan berkas aktif.

## Mengubah scene 3D

Pemeriksaan sintaks dan build bundle menggunakan Node.js serta npm.

Website memakai Three.js 0.170.0 yang tersimpan lokal. Edit `assets/redesign/motion.js`, lalu bangun ulang bundle dari direktori repositori.

```sh
npx esbuild@0.25.0 assets/redesign/motion.js --bundle --format=iife --target=es2020 --minify --legal-comments=eof --outfile=assets/redesign/motion.bundle.js
```

Pengambilan esbuild melalui `npx` memerlukan akses registry pada penggunaan pertama. Commit sumber dan bundle bersama dalam satu perubahan. Format IIFE memungkinkan script dimuat melalui `file://`. Lisensi Three.js tersedia di `assets/redesign/three-LICENSE.txt`.

## Data demo dan konsultasi

Data inventaris memakai cuplikan dataset DummyJSON. Panel kategori lainnya menggunakan data simulasi berdasarkan referensi teknis yang ditautkan pada masing-masing panel.

Demo inventaris menyimpan keadaan selama halaman terbuka. Stok berkurang setelah konfirmasi simulasi. Tombol reset atau pemuatan ulang memulihkan data awal. Semua contoh harus tetap diberi label data demo.

Formulir konsultasi menyiapkan pesan melalui tautan WhatsApp. Pengunjung menekan kirim di WhatsApp untuk mengirim pesan. `forms/contact.php` adalah endpoint warisan template yang belum dikonfigurasi, sedangkan formulir beranda menggunakan alur WhatsApp.

## CMS / portal konten

Portal tersedia di `/admin/index.php` pada server PHP. Portal mengelola 131 kolom konten yang mencakup pembuka, layanan, harga, lingkup pekerjaan, contoh solusi, proses kerja, FAQ, kontak, SEO, logo, dan gambar.

### Kebutuhan dan pratinjau lokal

Gunakan PHP 8.2 atau lebih baru dengan ekstensi `mbstring` dan `fileinfo`. Implementasi sudah diuji memakai PHP 8.4. Penyimpanan menggunakan JSON privat dan penguncian berkas.

Jalankan dari direktori repo.

```sh
php -S 127.0.0.1:8000 -t .
```

Buka [portal lokal](http://127.0.0.1:8000/admin/index.php). Pada Mac dengan formula Homebrew `php@8.4`, binary dapat dipanggil melalui `/opt/homebrew/opt/php@8.4/bin/php`.

Halaman HTML publik tetap dapat dibuka melalui `file://` setelah publikasi.

### Aktivasi admin pertama

1. Unggah kode ke document root domain pada hosting PHP dan gunakan HTTPS.
2. Buka `/admin/index.php`. CMS membuat folder privat di luar folder website.
3. Di File Manager, aktifkan tampilan berkas tersembunyi. Pada konfigurasi bawaan, folder privat berada di induk document root dengan nama `.metromatika-cms-<hash>` yang ditampilkan portal.
4. Baca `setup-key.txt`, lalu gunakan kode tersebut untuk membuat nama admin dan kata sandi melalui portal.
5. Setelah aktivasi, kode dihapus dan portal beralih ke login admin.

PHP perlu izin menulis folder privat, tujuh halaman HTML publik, dan `assets/uploads/`. Gunakan kepemilikan berkas yang sesuai dengan akun PHP hosting. CMS menyimpan berkas privat dengan izin 0600 dan membuat folder privat dengan izin 0700.

Jika hosting membatasi akses ke folder induk atau website dipasang di subdirektori, salin `cms/config.example.php` menjadi `cms/config.local.php`. Isi path absolut folder yang dapat ditulis PHP dan berada di luar seluruh document root publik. Alternatifnya, gunakan environment variable `METROMATIKA_CMS_STORAGE`. Konfigurasi lokal diabaikan Git.

Kode aktivasi yang perlu diperbarui sebelum admin pertama dibuat dapat diterbitkan melalui terminal hosting.

```sh
php cms/cli.php setup-key
```

### Mengedit dan menerbitkan

- Edit konten melalui menu portal, lalu pilih **Simpan draf**.
- **Pratinjau** menampilkan draf tersimpan untuk beranda atau halaman layanan yang dipilih.
- **Publikasikan** menerapkan draf ke tujuh halaman HTML dalam satu operasi dengan jurnal pemulihan.
- **Riwayat publikasi** menyimpan sepuluh versi sebelumnya. Pemulihan mengisi draf untuk ditinjau dan dipublikasikan kembali.
- Harga dapat diaktifkan per layanan. Lengkapi angka rupiah, satuan atau periode, serta keterangan cakupannya.
- Unggah media berupa PNG, JPG, atau WebP dengan ukuran hingga 5 MB dan dimensi maksimal 6000 piksel. Portal menampilkan batas aktif sesuai konfigurasi PHP hosting. Pilih penggunaannya sebagai logo, ikon, gambar sosial, atau gambar pengganti 3D.
- Menu **Akun admin** mengganti kata sandi dan mengakhiri sesi admin lain.
- Konflik versi draf ditolak agar penyuntingan dari tab lain dapat ditinjau terlebih dahulu.

Cadangkan folder privat CMS dan `assets/uploads/` secara berkala. Keduanya menyimpan keadaan runtime yang perlu dipertahankan saat pembaruan kode.

### Mengembangkan template dan memperbarui hosting

`cms/templates/` adalah sumber struktur tujuh halaman publik. `cms/schema.json` mendefinisikan kolom editor dan `cms/defaults.json` menyediakan isi awal serta nilai untuk kolom baru. Marker template memakai nilai teks yang di-escape oleh renderer.

Saat mengubah struktur halaman, edit template yang sesuai. Untuk menerapkan struktur dengan konten yang sudah terpublikasi, jalankan perintah berikut.

```sh
php cms/cli.php check
php cms/cli.php render
```

Perintah `render` mempertahankan draf dan menggunakan konten terpublikasi dari penyimpanan privat. Pada instalasi baru, renderer menggunakan isi awal. Commit perubahan template bersama hasil render HTML yang relevan pada checkout pengembangan.

Saat memperbarui hosting yang sudah memakai CMS, pertahankan folder privat dan media unggahan. Setelah kode serta template diperbarui, jalankan `render` untuk menerapkan konten terpublikasi pada template terbaru. Hindari menimpa konten hosting dengan snapshot HTML bawaan repo selama pembaruan.

### Pengujian CMS

```sh
python3 tests/cms_test.py
```

Jika binary PHP memakai path khusus, tentukan lewat `PHP_BIN`.

```sh
PHP_BIN=/opt/homebrew/opt/php@8.4/bin/php python3 tests/cms_test.py
```

Pengujian memakai salinan website dan penyimpanan sementara. Cakupannya meliputi aktivasi, login, CSRF, konflik draf, escaping konten, pratinjau, publikasi, pemulihan setelah penulisan terputus, unggah gambar, perubahan kata sandi, pencabutan sesi, dan pembatasan percobaan login.

## Pemeriksaan perubahan

Jalankan pemeriksaan sintaks sesuai berkas yang diubah.

```sh
node --check assets/redesign/app.js
node --check assets/redesign/scroll-motion.js
node --check assets/redesign/equipment-demo.js
node --check assets/redesign/motion.js
node --check assets/redesign/motion.bundle.js
git diff --check
```

Untuk perubahan antarmuka, periksa lebar 360, 390, 768, 1024, dan 1440 px serta zoom browser 200%. Uji navigasi keyboard, fokus, target sentuh, kontras, overflow, pengurangan gerak, tombol jeda, filter, FAQ, dan formulir WhatsApp dengan pencegatan pengiriman. Perubahan scene 3D juga perlu diperiksa melalui `file://`.

Pada demo inventaris, uji jumlah kosong, nol, pecahan, melebihi stok, jumlah penuh, perubahan sebelum konfirmasi, klik simpan berulang, dan reset. Pengujian melalui simulasi ukuran layar perlu dibedakan dari pengujian pada perangkat fisik.

## Git dan dokumentasi

1. Baca `AGENTS.md`, status Git, dan riwayat terbaru sebelum bekerja.
2. Kerjakan perubahan dalam satu kelompok yang dapat ditinjau dan diuji.
3. Perbarui `CHANGELOG.md` untuk setiap kelompok perubahan. Perbarui README ketika perilaku, struktur, cara menjalankan, build, atau pemeriksaan berubah.
4. Periksa diff, jalankan validasi yang relevan, lalu commit kelompok perubahan tersebut.
5. Ulangi sampai tugas selesai dan periksa kembali status Git.
6. Push ketika diminta pengguna. Periksa remote dan cabang tujuan, lalu verifikasi commit yang diterima remote.

Gunakan pesan commit yang menjelaskan hasil, misalnya `feat: add inventory demo`, `fix: support local file preview`, atau `docs: document repository workflow`.

## Identitas dan atribusi

Logo serta informasi bisnis Metromatika berada pada aset dan konten situs. Proyek memakai aset warisan FlexBiz dari BootstrapMade. `Readme.txt` menyimpan atribusi dan tautan lisensi template. Pertahankan juga pemberitahuan lisensi pustaka yang disertakan.
