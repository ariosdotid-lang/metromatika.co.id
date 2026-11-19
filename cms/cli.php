<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('METRO_CMS', true);
require __DIR__ . '/bootstrap.php';
$command = $argv[1] ?? 'help';
if ($command === 'render') {
    cms_locked(function (): void {
        $state = cms_state();
        cms_apply_publication(cms_validate($state['published']), $state, $state);
    });
    echo "Tujuh halaman dirender dari template dan konten terpublikasi. Draf tetap tersimpan.\n";
} elseif ($command === 'setup-key') {
    cms_locked(function (): void {
        if (is_file(CMS_PRIVATE . '/auth.json')) throw new RuntimeException('Admin sudah diaktifkan.');
        $key = bin2hex(random_bytes(24));
        cms_atomic_write(CMS_PRIVATE . '/setup-key.txt', $key . "\n");
        echo "Kode aktivasi baru\n" . $key . "\n";
    });
} elseif ($command === 'check') {
    $values = cms_validate(cms_defaults());
    foreach (cms_pages() as $page => $relative) {
        $html = cms_render($values, $page);
        if (str_contains($html, '{{@')) throw new RuntimeException('Marker tidak terselesaikan pada ' . $relative);
        echo $relative . " OK\n";
    }
} else {
    echo "php cms/cli.php check\nphp cms/cli.php render\nphp cms/cli.php setup-key\n";
}
