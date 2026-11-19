<?php
declare(strict_types=1);
if (!defined('METRO_CMS')) { http_response_code(404); exit; }

function cms_atomic_write(string $path, string $data): void {
    $temporary = tempnam(dirname($path), '.cms-');
    if ($temporary === false) throw new RuntimeException('Gagal menyiapkan berkas sementara.');
    if (dirname($temporary) !== dirname($path)) {
        unlink($temporary);
        throw new RuntimeException('Folder tujuan perlu dapat ditulis oleh PHP.');
    }
    try {
        if (file_put_contents($temporary, $data, LOCK_EX) !== strlen($data)) throw new RuntimeException('Gagal menulis berkas.');
        chmod($temporary, str_starts_with($path, CMS_PRIVATE . '/') ? 0600 : 0644);
        if (!rename($temporary, $path)) throw new RuntimeException('Gagal mengganti berkas.');
    } finally {
        if (is_file($temporary)) unlink($temporary);
    }
}
function cms_write_json(string $path, array $data): void {
    cms_atomic_write($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n");
}
function cms_read_json(string $path, array $fallback = []): array {
    return is_file($path) ? json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR) : $fallback;
}
function cms_recover_publish(): void {
    $path = CMS_PRIVATE . '/journal.json';
    if (!is_file($path)) return;
    $journal = cms_read_json($path);
    $allowed = array_values(cms_pages());
    foreach ($journal['pages'] as $relative => $html) {
        if (!in_array($relative, $allowed, true)) throw new RuntimeException('Jurnal publikasi tidak valid.');
        cms_atomic_write(CMS_ROOT . '/' . $relative, $html);
    }
    cms_write_json(CMS_PRIVATE . '/state.json', $journal['state']);
    if (!unlink($path)) throw new RuntimeException('Gagal menyelesaikan pemulihan publikasi.');
}
function cms_locked(callable $operation): mixed {
    $lock = fopen(CMS_PRIVATE . '/write.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Penyimpanan sedang tidak tersedia.');
    try {
        cms_recover_publish();
        return $operation();
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
function cms_state(): array {
    $defaults = cms_defaults();
    $state = cms_read_json(CMS_PRIVATE . '/state.json', [
        'version' => 1, 'draft' => $defaults, 'published' => $defaults,
        'savedAt' => null, 'publishedAt' => null, 'history' => []
    ]);
    // New fields receive their tracked defaults after a code update.
    $state['draft'] = array_replace($defaults, array_intersect_key($state['draft'], $defaults));
    $state['published'] = array_replace($defaults, array_intersect_key($state['published'], $defaults));
    return $state;
}
function cms_version(array $body, array $state): void {
    if (($body['version'] ?? null) !== $state['version']) throw new CmsError('Konten sudah diubah pada sesi lain. Muat ulang data sebelum menyimpan kembali.', 409);
}
function cms_apply_publication(array $values, array $state, array $next): array {
    $pages = [];
    $previous = [];
    foreach (cms_pages() as $page => $relative) {
        $path = CMS_ROOT . '/' . $relative;
        if (!is_file($path) || !is_writable(dirname($path))) throw new CmsError('PHP perlu izin menulis halaman publik. Periksa izin folder website.', 503);
        $pages[$relative] = cms_render($values, $page);
        $previous[$relative] = file_get_contents($path);
    }
    // A journal restores every page and the prior state after a partial write or crash.
    cms_write_json(CMS_PRIVATE . '/journal.json', ['pages' => $previous, 'state' => $state]);
    try {
        foreach ($pages as $relative => $html) cms_atomic_write(CMS_ROOT . '/' . $relative, $html);
        cms_write_json(CMS_PRIVATE . '/state.json', $next);
        if (!unlink(CMS_PRIVATE . '/journal.json')) throw new RuntimeException('Gagal menyelesaikan publikasi.');
        return $next;
    } catch (Throwable $error) {
        cms_recover_publish();
        throw $error;
    }
}

function cms_publish(array $state): array {
    $values = cms_validate($state['draft']);
    $next = $state;
    array_unshift($next['history'], [
        'id' => bin2hex(random_bytes(12)), 'publishedAt' => $state['publishedAt'],
        'version' => $state['version'], 'values' => $state['published']
    ]);
    $next['history'] = array_slice($next['history'], 0, 10);
    $next['published'] = $values;
    $next['publishedAt'] = gmdate('c');
    $next['version']++;
    return cms_apply_publication($values, $state, $next);
}
