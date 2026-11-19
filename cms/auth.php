<?php
declare(strict_types=1);
if (!defined('METRO_CMS')) { http_response_code(404); exit; }
function cms_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $path = CMS_PRIVATE . '/sessions';
    if (!is_dir($path)) mkdir($path, 0700);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_save_path($path);
    session_name('METROMATIKA_CMS');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true, 'samesite' => 'Strict'
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
function cms_signed_in(): bool {
    $auth = cms_read_json(CMS_PRIVATE . '/auth.json');
    if (empty($auth) || empty($_SESSION['user'])) return false;
    $valid = ($_SESSION['authVersion'] ?? null) === $auth['version']
        && time() - ($_SESSION['lastSeen'] ?? 0) < 1800
        && time() - ($_SESSION['started'] ?? 0) < 28800;
    if (!$valid) { unset($_SESSION['user']); return false; }
    $_SESSION['lastSeen'] = time();
    return true;
}
function cms_require_auth(): void {
    if (!cms_signed_in()) throw new CmsError('Sesi berakhir. Silakan masuk kembali.', 401);
}
function cms_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) throw new CmsError('Sesi formulir berubah. Muat ulang portal dan coba lagi.', 403);
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $scheme = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
        if ($origin !== $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '')) throw new CmsError('Asal permintaan tidak diizinkan.', 403);
    }
}
function cms_password(string $password): void {
    if (mb_strlen($password) < 12 || strlen($password) > 72 || str_contains($password, chr(0))) throw new CmsError('Gunakan minimal 12 karakter dengan panjang maksimal 72 byte.', 422);
}
function cms_attempt_key(): string {
    return hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'local');
}
function cms_auth_attempt(): void {
    $attempts = cms_read_json(CMS_PRIVATE . '/attempts.json');
    $attempt = $attempts[cms_attempt_key()] ?? ['count' => 0, 'since' => time()];
    if (time() - $attempt['since'] < 900 && $attempt['count'] >= 10) throw new CmsError('Terlalu banyak percobaan. Tunggu 15 menit sebelum mencoba kembali.', 429);
}
function cms_failed_attempt(): void {
    $attempts = cms_read_json(CMS_PRIVATE . '/attempts.json');
    $attempts = array_filter($attempts, fn($item) => time() - $item['since'] < 900);
    $key = cms_attempt_key();
    $attempt = $attempts[$key] ?? ['count' => 0, 'since' => time()];
    $attempt['count']++;
    $attempts[$key] = $attempt;
    cms_write_json(CMS_PRIVATE . '/attempts.json', $attempts);
}
function cms_login(array $auth): void {
    session_regenerate_id(true);
    $_SESSION = [
        'user' => $auth['username'], 'authVersion' => $auth['version'],
        'started' => time(), 'lastSeen' => time(), 'csrf' => bin2hex(random_bytes(32))
    ];
    $attempts = cms_read_json(CMS_PRIVATE . '/attempts.json');
    unset($attempts[cms_attempt_key()]);
    cms_write_json(CMS_PRIVATE . '/attempts.json', $attempts);
}

function cms_upload_limit(): int {
    $limits = [];
    foreach (['upload_max_filesize', 'post_max_size'] as $name) {
        $raw = strtolower(trim((string)ini_get($name)));
        $factor = match (substr($raw, -1)) { 'g' => 1073741824, 'm' => 1048576, 'k' => 1024, default => 1 };
        $bytes = (int)((float)$raw * $factor);
        $limits[$name] = $bytes > 0 ? $bytes : PHP_INT_MAX;
    }
    return max(0, min(5000000, $limits['upload_max_filesize'], $limits['post_max_size'] - 65536));
}
