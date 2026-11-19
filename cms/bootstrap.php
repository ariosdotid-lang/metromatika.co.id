<?php
declare(strict_types=1);
if (!defined('METRO_CMS')) { http_response_code(404); exit; }
define('CMS_ROOT', dirname(__DIR__));
final class CmsError extends RuntimeException {
    public function __construct(string $message, public int $status = 400) { parent::__construct($message); }
}
if (PHP_VERSION_ID < 80200) {
    throw new CmsError('Versi PHP domain belum memenuhi kebutuhan CMS. Gunakan PHP 8.2 atau lebih baru.', 503);
}
$missing = array_filter(['mbstring', 'fileinfo'], fn($name) => !extension_loaded($name));
if ($missing) {
    throw new CmsError('Ekstensi PHP belum aktif: ' . implode(', ', $missing) . '. Aktifkan untuk domain ini melalui pengaturan PHP hosting atau minta bantuan penyedia hosting.', 503);
}
$config = is_file(__DIR__ . '/config.local.php') ? require __DIR__ . '/config.local.php' : [];
if (!is_array($config)) throw new CmsError('Konfigurasi CMS tidak valid. Sesuaikan cms/config.local.php dengan config.example.php.', 503);
$storage = getenv('METROMATIKA_CMS_STORAGE') ?: ($config['storage'] ?? dirname(CMS_ROOT) . '/.metromatika-cms-' . substr(hash('sha256', CMS_ROOT), 0, 12));
if (!is_string($storage) || !str_starts_with($storage, '/')) throw new CmsError('Lokasi penyimpanan CMS harus berupa path absolut. Periksa cms/config.local.php atau METROMATIKA_CMS_STORAGE.', 503);
if (!is_dir($storage) && !@mkdir($storage, 0700, true)) throw new CmsError('PHP tidak dapat membuat folder privat CMS. Buat folder di luar document root dan atur lokasi serta izin tulisnya melalui cms/config.local.php.', 503);
$private = realpath($storage);
if (!$private || !is_writable($private)) throw new CmsError('Folder privat CMS tidak dapat diakses atau ditulis oleh PHP. Periksa lokasi, kepemilikan, dan izin folder pada hosting.', 503);
$documentRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : false;
foreach (array_filter([CMS_ROOT, $documentRoot]) as $public) {
    if ($private === $public || str_starts_with($private . '/', rtrim($public, '/') . '/')) {
        throw new CmsError('Penyimpanan privat CMS berada di dalam folder publik. Atur lokasi di luar document root melalui cms/config.local.php.', 503);
    }
}
define('CMS_PRIVATE', $private);
require __DIR__ . '/content.php';
require __DIR__ . '/storage.php';
require __DIR__ . '/auth.php';
cms_locked(function (): void {
    if (!is_file(CMS_PRIVATE . '/auth.json') && !is_file(CMS_PRIVATE . '/setup-key.txt')) {
        cms_atomic_write(CMS_PRIVATE . '/setup-key.txt', bin2hex(random_bytes(24)) . "\n");
    }
});
