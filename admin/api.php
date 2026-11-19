<?php
declare(strict_types=1);
define('METRO_CMS', true);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');

function respond(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_THROW_ON_ERROR);
    exit;
}
function input_string(array $body, string $key): string {
    if (!isset($body[$key]) || !is_string($body[$key])) throw new CmsError('Isi formulir tidak valid.', 422);
    return $body[$key];
}
function editor_state(array $state): array {
    $state['history'] = array_map(fn($item) => array_diff_key($item, ['values' => true]), $state['history']);
    return $state;
}
try {
    require dirname(__DIR__) . '/cms/bootstrap.php';
    cms_session();
    $action = $_GET['action'] ?? 'status';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!is_string($action)) throw new CmsError('Permintaan tidak valid.', 400);
    if ($method === 'GET' && $action === 'status') {
        $configured = is_file(CMS_PRIVATE . '/auth.json');
        respond([
            'configured' => $configured, 'authenticated' => cms_signed_in(),
            'username' => $_SESSION['user'] ?? null, 'csrf' => $_SESSION['csrf'],
            'storageFolder' => $configured ? null : basename(CMS_PRIVATE),
            'uploadLimit' => cms_upload_limit()
        ]);
    }
    if ($method !== 'GET' && $method !== 'POST') throw new CmsError('Metode tidak didukung.', 405);
    $body = [];
    if ($method === 'POST') {
        cms_csrf();
        if ($action !== 'upload') {
            if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 1500000) throw new CmsError('Isi permintaan terlalu besar.', 413);
            if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) throw new CmsError('Format permintaan tidak didukung.', 415);
            $raw = file_get_contents('php://input', false, null, 0, 1500001);
            if (strlen($raw) > 1500000) throw new CmsError('Isi permintaan terlalu besar.', 413);
            $body = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($body) || !str_starts_with(ltrim($raw), '{')) throw new CmsError('Permintaan tidak valid.', 400);
        }
    }
    if ($method === 'POST' && in_array($action, ['setup', 'login'], true)) {
        $result = cms_locked(function () use ($body, $action): array {
            cms_auth_attempt();
            $auth = cms_read_json(CMS_PRIVATE . '/auth.json');
            if ($action === 'setup') {
                if ($auth) throw new CmsError('Admin sudah diaktifkan. Gunakan halaman masuk.', 409);
                $key = is_file(CMS_PRIVATE . '/setup-key.txt') ? trim(file_get_contents(CMS_PRIVATE . '/setup-key.txt')) : '';
                if ($key === '' || !hash_equals($key, trim(input_string($body, 'key')))) {
                    cms_failed_attempt();
                    throw new CmsError('Kode aktivasi tidak sesuai.', 401);
                }
                $username = trim(input_string($body, 'username'));
                if (!preg_match('/^[a-zA-Z0-9._-]{3,60}$/', $username)) throw new CmsError('Nama admin perlu 3–60 huruf, angka, titik, garis bawah, atau tanda hubung.', 422);
                $password = input_string($body, 'password');
                cms_password($password);
                $auth = ['username' => $username, 'hash' => password_hash($password, PASSWORD_DEFAULT), 'version' => 1];
                cms_write_json(CMS_PRIVATE . '/auth.json', $auth);
                cms_write_json(CMS_PRIVATE . '/state.json', cms_state());
                unlink(CMS_PRIVATE . '/setup-key.txt');
            } else {
                $username = input_string($body, 'username');
                $password = input_string($body, 'password');
                $verified = $auth && strlen($password) <= 72 && !str_contains($password, chr(0)) && password_verify($password, $auth['hash']);
                if (!$verified || !hash_equals($auth['username'], $username)) {
                    cms_failed_attempt();
                    throw new CmsError('Nama admin atau kata sandi tidak sesuai.', 401);
                }
            }
            cms_login($auth);
            return ['username' => $auth['username'], 'csrf' => $_SESSION['csrf']];
        });
        respond($result);
    }
    cms_require_auth();
    if ($method === 'GET' && $action === 'content') {
        respond(cms_locked(fn() => ['schema' => cms_schema(), 'state' => editor_state(cms_state())]));
    }
    if ($method === 'GET' && $action === 'preview') {
        $page = $_GET['page'] ?? 'home';
        if (!is_string($page)) throw new CmsError('Halaman tidak ditemukan.', 404);
        $html = cms_locked(fn() => cms_render(cms_validate(cms_state()['draft']), $page));
        $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/');
        $base = ($base === '.' ? '' : $base) . '/';
        if ($page !== 'home') $base .= 'layanan/' . $page . '/';
        $html = preg_replace('/<head>/', '<head><base href="' . cms_escape($base) . '">', $html, 1);
        header('Content-Type: text/html; charset=utf-8');
        header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'self'; form-action 'none'; base-uri 'self'");
        echo $html;
        exit;
    }
    if ($method === 'GET' && $action === 'media') {
        $items = [];
        foreach (['assets/img', 'assets/uploads', 'assets/redesign'] as $directory) {
            if (!is_dir(CMS_ROOT . '/' . $directory)) continue;
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(CMS_ROOT . '/' . $directory, FilesystemIterator::SKIP_DOTS));
            foreach ($iterator as $file) {
                if ($file->isLink() || !$file->isFile() || !preg_match('/\.(png|jpe?g|webp)$/i', $file->getFilename())) continue;
                $relative = substr($file->getPathname(), strlen(CMS_ROOT) + 1);
                $items[] = ['path' => $relative, 'name' => $file->getFilename(), 'bytes' => $file->getSize()];
            }
        }
        usort($items, fn($a, $b) => strcmp($a['path'], $b['path']));
        respond(['items' => $items]);
    }
    if ($method !== 'POST') throw new CmsError('Permintaan tidak ditemukan.', 404);
    if ($action === 'logout') {
        $_SESSION = [];
        $params = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $params['path'], 'secure' => $params['secure'], 'httponly' => true, 'samesite' => 'Strict']);
        session_destroy();
        respond(['ok' => true]);
    }
    if ($action === 'upload') {
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > cms_upload_limit() + 65536) throw new CmsError('Ukuran unggahan melewati batas PHP. Periksa batas yang ditampilkan portal.', 413);
        $file = $_FILES['image'] ?? null;
        if (!$file || !is_array($file) || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) throw new CmsError('Gambar gagal diunggah. Pilih kembali berkas gambar.', 422);
        if ($file['size'] > cms_upload_limit()) throw new CmsError('Ukuran gambar melewati batas unggahan server.', 413);
        $info = @getimagesize($file['tmp_name']);
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        $extensions = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'];
        if (!$info || !isset($extensions[$mime]) || ($info['mime'] ?? '') !== $mime || $info[0] > 6000 || $info[1] > 6000) throw new CmsError('Gunakan PNG, JPG, atau WebP dengan dimensi maksimal 6000 piksel.', 422);
        $relative = 'assets/uploads/' . hash_file('sha256', $file['tmp_name']) . '.' . $extensions[$mime];
        cms_locked(function () use ($relative, $file): void {
            cms_require_auth();
            $directory = CMS_ROOT . '/assets/uploads';
            if (!is_dir($directory) && !mkdir($directory, 0755)) throw new CmsError('PHP perlu izin membuat folder assets/uploads.', 503);
            if (!is_file(CMS_ROOT . '/' . $relative)) cms_atomic_write(CMS_ROOT . '/' . $relative, file_get_contents($file['tmp_name']));
        });
        respond(['path' => $relative]);
    }
    $result = cms_locked(function () use ($action, $body): array {
        cms_require_auth();
        if ($action === 'password') {
            $auth = cms_read_json(CMS_PRIVATE . '/auth.json');
            if (!password_verify(input_string($body, 'current'), $auth['hash'])) throw new CmsError('Kata sandi saat ini tidak sesuai.', 422);
            $next = input_string($body, 'password');
            cms_password($next);
            $auth['hash'] = password_hash($next, PASSWORD_DEFAULT);
            $auth['version']++;
            cms_write_json(CMS_PRIVATE . '/auth.json', $auth);
            cms_login($auth);
            return ['csrf' => $_SESSION['csrf']];
        }
        $state = cms_state();
        cms_version($body, $state);
        if ($action === 'save') {
            if (!isset($body['values']) || !is_array($body['values'])) throw new CmsError('Konten draf tidak valid.', 422);
            $state['draft'] = cms_validate($body['values']);
            $state['savedAt'] = gmdate('c');
            $state['version']++;
            cms_write_json(CMS_PRIVATE . '/state.json', $state);
        } elseif ($action === 'publish') {
            $state = cms_publish($state);
        } elseif ($action === 'restore') {
            $id = input_string($body, 'id');
            $snapshot = null;
            foreach ($state['history'] as $item) if ($item['id'] === $id) $snapshot = $item;
            if (!$snapshot) throw new CmsError('Versi tersebut tidak ditemukan.', 404);
            $state['draft'] = cms_validate(array_replace(cms_defaults(), $snapshot['values']));
            $state['savedAt'] = gmdate('c');
            $state['version']++;
            cms_write_json(CMS_PRIVATE . '/state.json', $state);
        } else {
            throw new CmsError('Permintaan tidak ditemukan.', 404);
        }
        return ['state' => editor_state($state)];
    });
    respond($result);
} catch (JsonException $error) {
    respond(['error' => 'Format JSON tidak valid.'], 400);
} catch (Throwable $error) {
    $status = $error instanceof CmsError ? $error->status : 500;
    if ($status === 500) error_log('Metromatika CMS: ' . $error->getMessage());
    $message = $status === 500 ? 'CMS belum dapat menyimpan data. Periksa lokasi penyimpanan di luar document root, izin folder, dan log PHP.' : $error->getMessage();
    respond(['error' => $message], $status);
}
