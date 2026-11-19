<?php
declare(strict_types=1);
if (!defined('METRO_CMS')) { http_response_code(404); exit; }

function cms_schema(): array {
    static $schema;
    return $schema ??= json_decode(file_get_contents(CMS_ROOT . '/cms/schema.json'), true, 512, JSON_THROW_ON_ERROR);
}
function cms_defaults(): array {
    static $defaults;
    return $defaults ??= json_decode(file_get_contents(CMS_ROOT . '/cms/defaults.json'), true, 512, JSON_THROW_ON_ERROR);
}
function cms_escape(string $text): string {
    return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function cms_text(string $text): string {
    return nl2br(cms_escape($text), false);
}
function cms_validate(array $input): array {
    $values = [];
    foreach (cms_schema()['fields'] as $field) {
        $id = $field['id'];
        $value = array_key_exists($id, $input) ? $input[$id] : cms_defaults()[$id];
        $label = $field['label'];
        if ($field['type'] === 'boolean') {
            if (!is_bool($value)) throw new CmsError("$label harus berupa pilihan aktif atau nonaktif.", 422);
        } elseif ($field['type'] === 'number') {
            if (!is_int($value) || $value < 0 || $value > 100000000000) throw new CmsError("$label harus berupa angka rupiah yang valid.", 422);
        } elseif (in_array($field['type'], ['faq', 'features'], true)) {
            if (!is_array($value) || !array_is_list($value) || count($value) < 1 || count($value) > 20) throw new CmsError("$label perlu berisi 1 sampai 20 butir.", 422);
            $keys = $field['type'] === 'faq' ? ['question', 'answer'] : ['title', 'body'];
            $clean = [];
            foreach ($value as $item) {
                if (!is_array($item)) throw new CmsError("$label tidak valid.", 422);
                $record = [];
                foreach ($keys as $key) {
                    $text = $item[$key] ?? null;
                    $limit = in_array($key, ['question', 'title'], true) ? 250 : $field['maxLength'];
                    if (!is_string($text) || trim($text) === '' || mb_strlen($text) > $limit) throw new CmsError("Isi $label belum lengkap atau terlalu panjang.", 422);
                    $record[$key] = trim($text);
                }
                $clean[] = $record;
            }
            $value = $clean;
        } else {
            if (!is_string($value) || mb_strlen($value) > $field['maxLength'] || str_contains($value, "\0")) throw new CmsError("$label terlalu panjang atau tidak valid.", 422);
            $value = trim($value);
            if ($value === '' && !str_ends_with($id, '.price_unit')) throw new CmsError("$label wajib diisi.", 422);
            if ($field['type'] === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) throw new CmsError('Alamat email tidak valid.', 422);
            if ($field['type'] === 'phone' && !preg_match('/^[1-9][0-9]{7,14}$/', $value)) throw new CmsError('Nomor WhatsApp perlu kode negara dan 8–15 digit, misalnya 6282166615433.', 422);
            if ($field['type'] === 'image') {
                if (!preg_match('~^assets/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp)$~i', $value) || str_contains($value, '..')) throw new CmsError('Pilih gambar lokal dari perpustakaan media.', 422);
                $path = realpath(CMS_ROOT . '/' . $value);
                if (!$path || !str_starts_with($path, CMS_ROOT . '/assets/') || !is_file($path)) throw new CmsError('Gambar yang dipilih tidak ditemukan.', 422);
            }
        }
        $values[$id] = $value;
    }
    foreach (cms_schema()['services'] as $slug) {
        if ($values["services.$slug.price_visible"] && $values["services.$slug.price_unit"] === '') {
            throw new CmsError('Lengkapi satuan atau periode harga untuk ' . $values["services.$slug.name"] . '.', 422);
        }
    }
    return $values;
}
function cms_faq(array $records): string {
    $html = '';
    foreach ($records as $record) {
        $html .= '<details><summary>' . cms_escape($record['question']) . '<span class="faq-plus" aria-hidden="true">+</span></summary><p>' . cms_text($record['answer']) . '</p></details>';
    }
    return $html;
}
function cms_price(array $values, string $slug, bool $detail): string {
    $prefix = "services.$slug.";
    if (!$values[$prefix . 'price_visible']) {
        return $detail ? '<h2>Minta penawaran</h2><p>' . cms_text($values[$prefix . 'price_notes']) . '</p>' : '';
    }
    $price = 'Rp ' . number_format($values[$prefix . 'price_amount'], 0, ',', '.') . ' ' . $values[$prefix . 'price_unit'];
    if ($detail) return '<h2>' . cms_escape($price) . '</h2><p>' . cms_text($values[$prefix . 'price_notes']) . '</p>';
    return '<p class="service-price"><strong>' . cms_escape($price) . '</strong><small>' . cms_text($values[$prefix . 'price_notes']) . '</small></p>';
}
function cms_structured_data(array $values, string $page): string {
    $organization = [
        '@context' => 'https://schema.org', '@type' => 'Organization',
        '@id' => 'https://metromatika.co.id/#organization',
        'name' => $values['site.company'], 'alternateName' => 'Metromatika',
        'url' => 'https://metromatika.co.id/', 'email' => $values['site.email'],
        'telephone' => '+' . $values['site.whatsapp'],
        'address' => [
            ['@type' => 'PostalAddress', 'streetAddress' => $values['site.jakarta'], 'addressLocality' => 'Jakarta Selatan', 'addressCountry' => 'ID'],
            ['@type' => 'PostalAddress', 'streetAddress' => $values['site.medan'], 'addressLocality' => 'Medan', 'addressCountry' => 'ID']
        ]
    ];
    $faq = $values[$page === 'home' ? 'home.faq' : "services.$page.faq"];
    $records = [$organization];
    if ($page !== 'home') {
        $service = [
            '@context' => 'https://schema.org', '@type' => 'Service',
            'name' => $values["services.$page.name"], 'description' => $values["services.$page.summary"],
            'url' => "https://metromatika.co.id/layanan/$page/",
            'provider' => ['@id' => 'https://metromatika.co.id/#organization']
        ];
        if ($values["services.$page.price_visible"]) {
            $service['offers'] = [
                '@type' => 'Offer', 'price' => $values["services.$page.price_amount"],
                'priceCurrency' => 'IDR', 'description' => trim($values["services.$page.price_unit"] . ' ' . $values["services.$page.price_notes"])
            ];
        }
        $records[] = $service;
    }
    $records[] = [
        '@context' => 'https://schema.org', '@type' => 'FAQPage',
        'mainEntity' => array_map(fn($item) => [
            '@type' => 'Question', 'name' => $item['question'],
            'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['answer']]
        ], $faq)
    ];
    return json_encode($records, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
}
function cms_pages(): array {
    $pages = ['home' => 'index.html'];
    foreach (cms_schema()['services'] as $slug) $pages[$slug] = "layanan/$slug/index.html";
    return $pages;
}
function cms_render(array $values, string $page): string {
    $pages = cms_pages();
    if (!isset($pages[$page])) throw new CmsError('Halaman tidak ditemukan.', 404);
    $template = file_get_contents(CMS_ROOT . '/cms/templates/' . $pages[$page]);
    return preg_replace_callback('/\{\{([a-zA-Z0-9_.@-]+)\}\}/', function ($match) use ($values) {
        $key = $match[1];
        if (array_key_exists($key, $values) && is_string($values[$key])) return cms_text($values[$key]);
        if (str_starts_with($key, '@attr.') && isset($values[substr($key, 6)])) return cms_escape($values[substr($key, 6)]);
        if ($key === '@social_image') return cms_escape('https://metromatika.co.id/' . $values['site.social_image']);
        if ($key === '@service_options') {
            $options = '<option value="">Pilih layanan</option>';
            foreach (cms_schema()['services'] as $slug) $options .= '<option>' . cms_escape($values["services.$slug.name"]) . '</option>';
            return $options . '<option>Konsultasi IT &amp; solusi lainnya</option>';
        }
        if (str_starts_with($key, '@whatsapp.')) {
            $page = substr($key, 10);
            $message = $page === 'home' ? '' : '?text=' . rawurlencode('Halo Metromatika, saya ingin berkonsultasi tentang ' . $values["services.$page.name"] . '.');
            return cms_escape('https://wa.me/' . $values['site.whatsapp'] . $message);
        }
        if (str_starts_with($key, '@schema.')) return cms_structured_data($values, substr($key, 8));
        if (str_starts_with($key, '@faq.')) {
            $page = substr($key, 5);
            return cms_faq($values[$page === 'home' ? 'home.faq' : "services.$page.faq"]);
        }
        if (str_starts_with($key, '@scope.')) {
            $slug = substr($key, 7);
            $html = '';
            foreach ($values["services.$slug.scope"] as $item) {
                $html .= '<article><h3>' . cms_escape($item['title']) . '</h3><p>' . cms_text($item['body']) . '</p></article>';
            }
            return $html;
        }
        if (str_starts_with($key, '@price.home.')) return cms_price($values, substr($key, 12), false);
        if (str_starts_with($key, '@price.detail.')) return cms_price($values, substr($key, 14), true);
        throw new RuntimeException('Marker template tidak dikenal: ' . $key);
    }, $template);
}
