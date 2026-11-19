# Metromatika

Website PT Metromatika Teknologi Rekayasa untuk layanan produk digital, konektivitas, cloud, dan keamanan siber.

Beranda memuat hero WebGL yang mengikuti scroll, penjelajah layanan, enam panel data demo, simulasi pengajuan inventaris, FAQ, dan formulir konsultasi WhatsApp. Enam halaman layanan berisi rincian pekerjaan dan kontak konsultasi.

## Menjalankan website

Buka `index.html` langsung di browser. Aset, font, data contoh, dan bundle 3D disimpan di repositori sehingga pratinjau `file://` dapat digunakan.

Untuk pengembangan melalui server lokal, jalankan dari direktori repositori.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Kemudian buka [pratinjau lokal](http://127.0.0.1:8000). Pengunjung membutuhkan browser yang mendukung WebGL untuk melihat scene 3D. Gambar pengganti tampil ketika WebGL tidak tersedia. Tombol jeda dan preferensi pengurangan gerak mengendalikan animasi. Urutan scroll hero aktif pada viewport dengan tinggi minimal 760 px ketika pengurangan gerak dimatikan. Viewport yang lebih pendek menggunakan hero ringkas.

## Struktur proyek

| Lokasi | Isi |
| --- | --- |
| `index.html` | Beranda, data demo layanan, dan struktur formulir |
| `layanan/*/index.html` | Enam halaman detail layanan |
| `assets/redesign/styles.css` | Gaya dasar situs |
| `assets/redesign/enterprise.css` | Desain aktif, tampilan responsif, dan animasi |
| `assets/redesign/app.js` | Navigasi, filter layanan, dan formulir WhatsApp |
| `assets/redesign/scroll-motion.js` | Pilihan layanan dan animasi bagian halaman |
| `assets/redesign/motion.js` | Sumber scene 3D Three.js |
| `assets/redesign/motion.bundle.js` | Bundle browser yang dimuat beranda |
| `assets/redesign/equipment-demo.js` | Simulasi permintaan perangkat dan stok |
| `assets/img/` | Logo dan aset gambar |
| `robots.txt`, `sitemap.xml` | Petunjuk crawler dan URL canonical |
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
