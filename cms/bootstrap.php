<?php
declare(strict_types=1);
if (!defined('METRO_CMS')) { http_response_code(404); exit; }
define('CMS_ROOT', dirname(__DIR__));
final class CmsError extends RuntimeException {
    public function __construct(string $message, public int $status = 400) { parent::__construct($message); }
}
if (PHP_VERSION_ID < 80200 || !extension_loaded('mbstring') || !extension_loaded('fileinfo')) {
    throw new RuntimeException('CMS memerlukan PHP 8.2+ dengan ekstensi mbstring dan fileinfo.');
}
$config = is_file(__DIR__ . '/config.local.php') ? require __DIR__ . '/config.local.php' : [];
$storage = getenv('METROMATIKA_CMS_STORAGE') ?: ($config['storage'] ?? dirname(CMS_ROOT) . '/.metromatika-cms-' . substr(hash('sha256', CMS_ROOT), 0, 12));
if (!is_string($storage) || !str_starts_with($storage, '/')) throw new RuntimeException('Lokasi penyimpanan CMS harus berupa path absolut.');
if (!is_dir($storage) && !mkdir($storage, 0700, true)) throw new RuntimeException('PHP perlu izin membuat penyimpanan CMS di luar folder publik.');
$private = realpath($storage);
$documentRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : false;
foreach (array_filter([CMS_ROOT, $documentRoot]) as $public) {
    if ($private === $public || str_starts_with($private . '/', rtrim($public, '/') . '/')) {
        throw new RuntimeException('Atur penyimpanan CMS di luar document root menggunakan cms/config.local.php.');
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
