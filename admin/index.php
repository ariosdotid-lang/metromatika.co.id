<?php
declare(strict_types=1);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Portal Konten | Metromatika</title>
<link rel="icon" href="../assets/img/metromatika-mark.png">
<link rel="stylesheet" href="portal.css">
<script src="portal.js" defer></script>
</head>
<body>
<a class="skip-link" href="#editor">Lewati ke editor</a>
<div id="loading" class="loading" role="status">Membuka portal Metromatika…</div>
<section id="auth-view" class="auth-view" hidden>
  <div class="auth-brand"><a href="../index.html"><img src="../assets/img/metromatika-wordmark.png" width="572" height="150" alt="Metromatika"></a><p>Portal konten</p><h1>Kelola website.<br>Dari satu tempat.</h1><p>Ubah konten, tinjau draf, dan publikasikan pembaruan untuk pengunjung Anda.</p></div>
  <div class="auth-panel">
    <form id="login-form" hidden>
      <h2>Masuk ke portal</h2><p>Gunakan akun admin website.</p>
      <label for="login-user">Nama admin</label><input id="login-user" name="username" autocomplete="username" required maxlength="60">
      <label for="login-password">Kata sandi</label><input id="login-password" name="password" type="password" autocomplete="current-password" required>
      <button type="submit" class="primary full">Masuk</button>
    </form>
    <form id="setup-form" hidden>
      <h2>Aktifkan portal</h2><p>Buat akun admin pertama menggunakan kode aktivasi dari penyimpanan privat hosting.</p>
      <details class="setup-guide"><summary>Di mana kode aktivasi?</summary><p>Buka penyimpanan privat <code id="setup-folder"></code> melalui File Manager. Pada konfigurasi bawaan, lokasinya di folder induk document root website. Aktifkan tampilan berkas tersembunyi dan baca <code>setup-key.txt</code>. Jika lokasi penyimpanan disesuaikan, gunakan lokasi tersebut. Masukkan kodenya pada formulir ini.</p></details>
      <label for="setup-key">Kode aktivasi</label><input id="setup-key" name="key" autocomplete="off" required spellcheck="false">
      <label for="setup-user">Nama admin</label><input id="setup-user" name="username" autocomplete="username" required minlength="3" maxlength="60" pattern="[A-Za-z0-9._-]+">
      <label for="setup-password">Kata sandi baru</label><input id="setup-password" name="password" type="password" autocomplete="new-password" required minlength="12" aria-describedby="setup-password-help">
      <small id="setup-password-help">Gunakan setidaknya 12 karakter.</small>
      <label for="setup-confirm">Ulangi kata sandi</label><input id="setup-confirm" type="password" autocomplete="new-password" required minlength="12">
      <button type="submit" class="primary full">Aktifkan akun admin</button>
    </form>
    <p id="auth-message" class="message" role="status"></p>
  </div>
</section>
<div id="portal" class="portal" hidden>
  <aside class="sidebar">
    <a class="portal-brand" href="../index.html" target="_blank" rel="noopener noreferrer"><img src="../assets/img/metromatika-wordmark.png" width="572" height="150" alt="Metromatika"></a>
    <span class="portal-label">Portal konten</span>
    <nav aria-label="Menu portal" id="portal-nav">
      <button type="button" data-section="home">Beranda</button>
      <button type="button" data-section="services">Layanan & harga</button>
      <button type="button" data-section="about">Perusahaan & solusi</button>
      <button type="button" data-section="faq">Pertanyaan umum</button>
      <button type="button" data-section="contact">Kontak</button>
      <button type="button" data-section="seo">SEO halaman</button>
      <button type="button" data-section="media">Gambar & logo</button>
      <button type="button" data-section="history">Riwayat publikasi</button>
      <button type="button" data-section="account">Akun admin</button>
    </nav>
    <div class="sidebar-account"><span id="admin-name"></span><button type="button" id="logout">Keluar</button></div>
  </aside>
  <main id="editor" class="workspace" tabindex="-1">
    <header class="toolbar"><div><p>Website Metromatika</p><h1 id="section-title">Beranda</h1></div><div class="toolbar-actions"><button type="button" id="preview">Pratinjau</button><button type="button" id="save">Simpan draf</button><button type="button" id="publish" class="primary">Publikasikan</button></div></header>
    <div class="status-bar"><span id="draft-status" role="status"></span><span id="published-status"></span></div>
    <div id="editor-message" class="message editor-message" role="status"></div>
    <div id="conflict-actions" class="conflict-actions" hidden><p>Periksa dan salin perubahan lokal yang ingin dipertahankan sebelum memuat data terbaru.</p><button type="button" id="reload-content">Muat ulang dari server</button></div>
    <div class="content-area">
      <p id="section-help" class="section-help"></p>
      <div id="subsection-wrap" class="subsection" hidden><label for="subsection">Pilih layanan</label><select id="subsection"></select></div>
      <form id="content-form"><div id="fields"></div></form>
      <section id="media-library" hidden>
        <div class="media-toolbar"><div><h2>Perpustakaan gambar</h2><p id="upload-help">PNG, JPG, atau WebP, hingga 6000 piksel. Ukuran mengikuti batas PHP.</p></div><label class="upload-button" for="media-upload">Unggah gambar<input id="media-upload" type="file" accept="image/png,image/jpeg,image/webp"></label></div>
        <div id="media-target-wrap"><label for="media-target">Gunakan gambar untuk</label><select id="media-target"></select></div>
        <div id="media-grid" class="media-grid"></div>
      </section>
      <section id="history-view" hidden></section>
      <section id="account-view" hidden>
        <form id="password-form" class="field-group">
          <h2>Ubah kata sandi</h2><p>Perubahan ini mengakhiri sesi admin lain yang masih aktif.</p>
          <label for="current-password">Kata sandi saat ini</label><input id="current-password" name="current" type="password" autocomplete="current-password" required>
          <label for="new-password">Kata sandi baru</label><input id="new-password" name="password" type="password" autocomplete="new-password" minlength="12" required>
          <label for="confirm-password">Ulangi kata sandi baru</label><input id="confirm-password" type="password" autocomplete="new-password" minlength="12" required>
          <button type="submit" class="primary">Simpan kata sandi</button>
        </form>
      </section>
    </div>
  </main>
</div>
<dialog id="publish-dialog"><form method="dialog"><h2>Publikasikan draf?</h2><p>Pembaruan akan diterapkan ke beranda dan enam halaman layanan. Versi sebelumnya tersedia pada riwayat publikasi.</p><div class="dialog-actions"><button value="cancel">Kembali</button><button type="button" id="confirm-publish" class="primary">Publikasikan sekarang</button></div></form></dialog>
<dialog id="preview-dialog" class="preview-dialog"><div class="preview-toolbar"><label for="preview-page">Halaman pratinjau</label><select id="preview-page"></select><button type="button" id="close-preview">Tutup</button></div><iframe id="preview-frame" title="Pratinjau draf website" sandbox="allow-scripts allow-same-origin" referrerpolicy="same-origin"></iframe></dialog>
</body>
</html>
