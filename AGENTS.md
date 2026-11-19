# Panduan kerja agent

Panduan ini berlaku untuk seluruh repositori Metromatika. Ikuti instruksi pengguna pada tugas aktif, termasuk batas perubahan, permintaan persetujuan, dan tujuan commit atau push.

## Sebelum mengubah berkas

- Baca `README.md`, `CHANGELOG.md`, dan panduan pada subdirektori yang akan disentuh jika tersedia.
- Periksa `git status --short`, cabang aktif, dan riwayat commit terbaru. Catat perubahan pengguna yang sudah ada.
- Gunakan cabang yang ditentukan tugas. Jika tidak ada arahan cabang, lanjutkan pada cabang aktif.
- Telusuri HTML, CSS, dan JavaScript yang benar-benar dimuat oleh halaman. Berkas warisan template masih tersimpan dalam repo.
- Jelaskan perubahan yang akan dikerjakan secara singkat. Jika pengguna secara eksplisit meminta persetujuan rencana, tunggu persetujuan sebelum implementasi.

## Implementasi

- Pertahankan logo, nama perusahaan, alamat, kontak, canonical, metadata SEO, dan tautan layanan kecuali tugas memang mengubahnya.
- Gunakan informasi bisnis yang sudah diberikan atau terverifikasi. Beri label pada data contoh dan catat sumbernya. Proyek, klien, hasil kerja, sertifikasi, serta angka pencapaian memerlukan bukti sebelum dipublikasikan sebagai fakta.
- Pertahankan pratinjau langsung dari `index.html` melalui `file://`. Aset runtime dan data demo perlu tersedia lokal.
- Edit scene 3D melalui `assets/redesign/motion.js`. Bangun ulang `motion.bundle.js` memakai perintah pada README dan commit kedua berkas bersama.
- Jaga tombol jeda, reduced motion, navigasi keyboard, fokus, kontras, dan tampilan ponsel ketika mengubah animasi.
- Tangani data dan keadaan demo melalui alur yang sudah ada. Pengulangan aksi harus menghasilkan stok dan status yang konsisten.
- Batasi perubahan pada lingkup tugas. Gunakan pola proyek yang sudah ada dan tulis kode yang mudah dibaca.
- Pertahankan atribusi template dan lisensi pustaka. Konfigurasi rahasia menggunakan berkas lokal yang diabaikan Git.

## CMS dan template

- Struktur halaman publik bersumber dari `cms/templates/`. Setelah perubahan struktur, gunakan `php cms/cli.php render` untuk menerbitkan template dengan konten terpublikasi yang sudah ada.
- `cms/defaults.json` berisi konten awal dan nilai kolom baru. Konten editor, akun, draf, riwayat, dan sesi disimpan di folder privat di luar document root.
- Pertahankan format data yang tersimpan, pemeriksaan versi draf, penguncian, escaping output, serta jurnal pemulihan publikasi saat mengubah backend.
- Unggahan media dan konfigurasi hosting merupakan data runtime. Jaga keduanya saat deployment dan gunakan contoh konfigurasi untuk dokumentasi.
- Uji perubahan CMS dengan `python3 tests/cms_test.py`, memakai `PHP_BIN` jika binary PHP berada di path khusus.
- Periksa alur editor dan hasil HTML publik setelah perubahan. Pengujian memakai akun serta penyimpanan QA yang terpisah dari akun pengguna.

## Validasi

- Jalankan pemeriksaan sintaks JavaScript yang relevan dan `git diff --check`.
- Setelah mengubah 3D, periksa bahwa sumber dan bundle sesuai serta hero dapat dimuat melalui `file://`.
- Untuk perubahan UI, periksa lebar 360, 390, 768, 1024, dan 1440 px serta zoom 200%. Periksa overflow, target sentuh minimal 44 × 44 px, fokus keyboard, menu mobile, filter, FAQ, dan pengurangan gerak.
- Untuk perubahan demo inventaris, uji validasi jumlah, tahap tinjau, konfirmasi, klik simpan berulang, perubahan stok, dan reset.
- Periksa formulir konsultasi dengan mencegat tautan WhatsApp atau mengamati pesan yang disiapkan. Pengiriman pesan ke pihak luar mengikuti otorisasi eksplisit pengguna.
- Saat mengubah konten atau navigasi, periksa aset, tautan internal, metadata, data terstruktur, dan kesesuaian sitemap dengan canonical.
- Gunakan pemeriksaan yang sesuai dengan perubahan. Untuk tugas dokumentasi, validasi isi, rujukan berkas, perintah, dan diff.
- Jika sebagian pemeriksaan tidak tersedia, lanjutkan pemeriksaan yang dapat dilakukan dan laporkan keterbatasannya secara spesifik. Nyatakan hasil sesuai bukti.

## Dokumentasi dan commit untuk setiap perubahan

- Setiap kelompok perubahan yang selesai harus diuji, dicatat pada `CHANGELOG.md`, lalu di-commit sebelum beralih ke kelompok berikutnya.
- Gunakan tanggal sesuai zona waktu pengguna. Jaga urutan changelog terbaru di bagian atas dan ringkas perubahan serta validasinya.
- Perbarui `README.md` ketika perilaku, struktur, perintah menjalankan atau build, dependensi, atau prosedur validasi berubah. Periksa kembali kesesuaiannya pada akhir tugas.
- Kelompokkan berkas berdasarkan perubahan yang logis. Stage hanya berkas yang termasuk tugas. Pertahankan perubahan pengguna yang tidak terkait.
- Gunakan pesan commit yang menjelaskan hasil dengan awalan seperti `feat:`, `fix:`, `docs:`, atau `chore:`.
- Periksa `git diff --cached` sebelum commit dan `git status --short` setelah commit.
- Pada akhir tugas, pastikan seluruh perubahan yang dikerjakan sudah masuk commit. Jelaskan jika ada perubahan tersisa beserta pemilik dan alasannya.

## Push dan pelaporan

- Push ketika diminta pengguna dalam tugas aktif. Gunakan otorisasi yang sudah diberikan selama lingkup dan tujuan tetap sama.
- Periksa URL remote, cabang tujuan, dan riwayat remote sebelum push. Jika ada perbedaan riwayat, pahami serta rekonsiliasi perubahan sambil mempertahankan pekerjaan yang ada.
- Push dengan alur normal. Penulisan ulang riwayat, force push, dan penghapusan cabang remote memerlukan instruksi pengguna yang sesuai.
- Setelah push, verifikasi SHA cabang remote cocok dengan commit yang dikirim dan periksa status upstream.
- Laporkan hasil, perubahan utama, commit, status push, dan keterbatasan pemeriksaan dengan bahasa yang jelas.
