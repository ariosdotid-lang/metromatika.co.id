# Unggah Metromatika ke cPanel

Paket ZIP berisi website, aset lokal, animasi 3D, CMS, template, dokumentasi, dan pengujian. `index.html`, `admin/`, `cms/`, dan `assets/` berada langsung di akar ZIP sehingga dapat diekstrak ke folder domain. Aturan `.htaccess` ikut disertakan.

Riwayat Git, cache, berkas kerja, konfigurasi lokal, kode aktivasi, akun, sesi, dan data privat CMS dari laptop tidak disertakan. Instalasi hosting membuat penyimpanan serta kode aktivasi sendiri. Media unggahan runtime tidak termasuk dalam arsip Git; cadangkan dan pindahkan secara terpisah jika sudah digunakan.

## Instalasi pertama

1. Di cPanel, periksa **Domains** untuk mengetahui document root `metromatika.co.id`. Gunakan folder tersebut; namanya dapat berbeda dari `public_html`.
2. Cadangkan website lama melalui File Manager sebelum mengganti berkas.
3. Unggah ZIP ke document root, lalu pilih **Extract** di folder yang sama. Pastikan `index.html` langsung berada di document root, bukan di dalam satu folder tambahan. Aturan `admin/.htaccess`, `cms/.htaccess`, dan `assets/uploads/.htaccess` harus ikut terekstrak. File Manager perlu menampilkan berkas tersembunyi untuk melihatnya.
4. Pastikan domain memakai PHP 8.2 atau lebih baru, dengan `mbstring` dan `fileinfo`. CMS diuji pada PHP 8.4. Pengaturan native PHP pada screenshot hosting belum membuktikan ekstensi atau izin tulisnya; periksa pesan portal dan log PHP bila diperlukan.
5. Buka `https://metromatika.co.id/` dan `https://metromatika.co.id/admin/index.php`.
6. Pada halaman aktivasi, catat nama folder privat `.metromatika-cms-<hash>`. Dengan pengaturan bawaan, folder itu dibuat di induk document root. Aktifkan **Show Hidden Files** pada File Manager, lalu baca `setup-key.txt` di folder tersebut.
7. Masukkan kode pada portal dan tentukan nama admin serta kata sandi Anda. Kode aktivasi dihapus setelah akun dibuat.
8. Hapus ZIP dari folder publik setelah ekstraksi selesai.

PHP perlu dapat menulis folder privat, folder tujuh halaman HTML, serta `assets/uploads/`. Kepemilikan berkas harus sesuai dengan akun PHP hosting. Instalasi ini tidak memerlukan database.

## Bila admin menampilkan error setelah unggah

Jika log PHP memuat `syntax error, unexpected public` ketika CMS dimuat, runtime domain belum mendukung sintaks PHP 8. CMS memerlukan PHP 8.2+, dan diuji pada PHP 8.4.

1. Pada **PHP Selector → Per Domain Settings**, periksa versi yang benar-benar diterapkan ke `metromatika.co.id`. Bila hosting memakai **MultiPHP Manager**, pilih domain yang sama dan gunakan PHP 8.4, lalu **Apply**. Label global akun saja belum membuktikan versi handler domain.
2. Muat ulang `/admin/index.php`. Jika versi sudah diperbarui, lanjutkan aktivasi. Bila masih gagal, periksa `/admin/api.php?action=status` dan baris terbaru `Metromatika CMS` dalam log PHP.
3. Jika pesan menyebut ekstensi, aktifkan `mbstring` dan `fileinfo` pada konfigurasi PHP domain atau hubungi penyedia hosting.
4. Jika pesan menyebut folder privat atau sesi, periksa lokasi dan izin tulis sesuai petunjuk berikut. Jangan menambahkan berkas phpinfo publik untuk pemeriksaan ini.

Paket perbaikan `cms-startup-fix` hanya mengganti kode awal CMS serta dokumentasinya. Ekstrak dari document root, timpa berkas dengan nama yang sama, lalu muat ulang portal. Paket tersebut tidak menyertakan halaman publik, konten, akun, konfigurasi lokal, atau data privat. Perbaikan pesan ini tidak menggantikan kebutuhan memperbarui versi PHP domain.

## Bila penyimpanan privat tidak dapat dibuat

Buat folder privat yang dapat ditulis PHP di luar seluruh document root publik, misalnya `/home/NAMA_AKUN/metromatika-private`. Sesuaikan contoh dengan struktur akun Anda.

Salin `cms/config.example.php` menjadi `cms/config.local.php`, lalu isi nilai `storage` dengan path absolut folder tersebut. Jangan meletakkan folder privat di `public_html`, document root domain lain, atau folder yang dapat diakses melalui web. Konfigurasi lokal tidak ikut Git.

## Pemeriksaan setelah unggah

- Buka beranda dan keenam halaman layanan; periksa logo, font, dan gambar.
- Periksa navigasi mobile, filter layanan, FAQ, dan animasi sesuai pengaturan gerak browser.
- Masuk ke portal, simpan perubahan sebagai draf, lalu periksa pratinjau sebelum publikasi.
- Publikasikan pembaruan yang memang ingin ditampilkan dan periksa hasilnya di halaman publik.
- Pastikan unggahan gambar dapat ditampilkan. Batas ukuran mengikuti PHP hosting, maksimal aplikasi 5 MB.
- Periksa formulir WhatsApp sampai pesan disiapkan, tanpa mengirimkannya.

Pengujian lokal tidak memastikan konfigurasi hosting, HTTPS, atau izin tulis di cPanel. Periksa bagian tersebut setelah unggah.

## Pembaruan setelah CMS sudah digunakan

Cadangkan folder privat CMS, `assets/uploads/`, konfigurasi lokal, dan halaman publik. Pertahankan data tersebut saat mengunggah kode baru.

Snapshot HTML di ZIP berasal dari checkout pengembangan. Menggantinya langsung dapat menampilkan konten bawaan. Setelah memperbarui template dan kode, gunakan Terminal cPanel dari document root untuk menerapkan konten hosting yang sudah terpublikasi:

```sh
php cms/cli.php render
```

Perintah tersebut mempertahankan draf. Jika Terminal tidak tersedia, publikasikan kembali melalui portal hanya setelah memastikan draf yang tersimpan memang siap ditampilkan.

## Membuat ulang paket

Dari repositori yang bersih dan sudah di-commit:

```sh
git archive --format=zip --output=../metromatika-cpanel.zip HEAD
```

Arsip ini berisi berkas yang dilacak Git. Data privat dan media unggahan runtime perlu pencadangan tersendiri.
