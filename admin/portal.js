(() => {
  const get = selector => document.querySelector(selector);
  const sections = {
    home: ['Beranda', 'Atur pembuka, pengantar layanan, dan proses kerja. Baris baru pada judul menjadi pergantian baris pada halaman publik.'],
    services: ['Layanan & harga', 'Ubah rincian layanan, lingkup pekerjaan, FAQ, dan harga. Lengkapi satuan serta ketentuan ketika harga ditampilkan.'],
    about: ['Perusahaan & solusi', 'Kelola penjelasan perusahaan dan contoh solusi. Gunakan label yang jelas untuk konten ilustrasi.'],
    faq: ['Pertanyaan umum', 'Kelola pertanyaan yang sering diajukan pengunjung.'],
    contact: ['Kontak', 'Informasi ini digunakan pada beranda, footer, tautan konsultasi, dan data organisasi.'],
    seo: ['SEO halaman', 'Kelola judul serta deskripsi pencarian setiap halaman. URL canonical mengikuti struktur website.'],
    media: ['Gambar & logo', 'Pilih logo, ikon, gambar sosial, dan gambar pengganti hero.'],
    history: ['Riwayat publikasi', 'Pulihkan salah satu dari sepuluh versi sebelumnya ke draf untuk ditinjau.'],
    account: ['Akun admin', 'Kelola kata sandi akun yang sedang digunakan.']
  };
  let csrf = '';
  let uploadLimit = 5000000;
  let schema = null;
  let state = null;
  let values = null;
  let version = 0;
  let dirty = false;
  let edits = 0;
  let busy = false;
  let section = 'home';
  let subsection = '';
  let mediaTarget = 'site.logo';
  let mediaReturn = null;
  let authenticated = false;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function message(text = '', auth = false, error = false) {
    const target = get(auth ? '#auth-message' : '#editor-message');
    target.textContent = text;
    target.classList.toggle('error', error);
  }
  function formatTime(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value)) + ' WIB' : 'Belum dipublikasikan dari portal';
  }
  function updateStatus() {
    get('#draft-status').textContent = dirty ? 'Ada perubahan yang belum disimpan' : state?.savedAt ? 'Draf disimpan ' + formatTime(state.savedAt) : 'Konten awal website';
    get('#published-status').textContent = state ? (state.publishedAt ? 'Publikasi terakhir ' : '') + formatTime(state.publishedAt) : '';
  }
  function changed() {
    edits++;
    dirty = true;
    updateStatus();
  }
  function showAuth(configured) {
    authenticated = false;
    get('#loading').hidden = true;
    get('#portal').hidden = true;
    get('#auth-view').hidden = false;
    get('#login-form').hidden = !configured;
    get('#setup-form').hidden = configured;
  }
  async function request(action, payload, upload = false) {
    const options = { credentials: 'same-origin', headers: {} };
    if (payload !== undefined) {
      options.method = 'POST';
      options.headers['X-CSRF-Token'] = csrf;
      if (upload) options.body = payload;
      else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(payload);
      }
    }
    const response = await fetch('api.php?action=' + encodeURIComponent(action), options);
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401 && authenticated) {
        showAuth(true);
        message('Sesi berakhir. Masuk kembali untuk melanjutkan. Perubahan lokal masih tersedia di tab ini.', true);
      }
      if (response.status === 409) get('#conflict-actions').hidden = false;
      const error = new Error(data.error || 'Permintaan belum berhasil.');
      error.status = response.status;
      throw error;
    }
    if (data.csrf) csrf = data.csrf;
    return data;
  }
  async function run(operation, auth = false) {
    if (busy) return;
    busy = true;
    for (const button of document.querySelectorAll('.toolbar-actions button, #confirm-publish, #auth-view button[type=submit]')) button.disabled = true;
    message('', auth);
    try { await operation(); }
    catch (error) { message(error.message, auth || !authenticated, true); }
    finally {
      busy = false;
      for (const button of document.querySelectorAll('.toolbar-actions button, #confirm-publish, #auth-view button[type=submit]')) button.disabled = false;
    }
  }

  function labelInput(field, container) {
    const id = 'field-' + field.id.replaceAll('.', '-');
    if (field.type === 'boolean') {
      const label = element('label', undefined, 'check-field');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.checked = values[field.id];
      input.addEventListener('change', () => { values[field.id] = input.checked; changed(); });
      label.append(input, element('span', field.label));
      container.append(label);
      return;
    }
    container.append(element('label', field.label));
    container.lastChild.htmlFor = id;
    if (field.type === 'faq' || field.type === 'features') {
      container.lastChild.remove();
      container.append(element('h3', field.label));
      const keys = field.type === 'faq' ? ['question', 'answer'] : ['title', 'body'];
      const labels = field.type === 'faq' ? ['Pertanyaan', 'Jawaban'] : ['Judul lingkup', 'Penjelasan'];
      for (const [index, record] of values[field.id].entries()) {
        const item = element('div', undefined, 'collection-item');
        for (const [position, key] of keys.entries()) {
          const label = element('label', labels[position] + ' ' + (index + 1));
          const input = document.createElement(position === 0 ? 'input' : 'textarea');
          input.id = id + '-' + index + '-' + key;
          label.htmlFor = input.id;
          input.value = record[key];
          input.required = true;
          input.maxLength = position === 0 ? 250 : field.maxLength;
          input.addEventListener('input', () => { values[field.id][index][key] = input.value; changed(); });
          item.append(label, input);
        }
        const remove = element('button', 'Hapus butir');
        remove.type = 'button';
        remove.disabled = values[field.id].length === 1;
        remove.addEventListener('click', () => { values[field.id].splice(index, 1); changed(); renderFields(); });
        item.append(remove);
        container.append(item);
      }
      const add = element('button', 'Tambah butir');
      add.type = 'button';
      add.disabled = values[field.id].length >= 20;
      add.addEventListener('click', () => {
        values[field.id].push(Object.fromEntries(keys.map(key => [key, ''])));
        changed();
        renderFields();
        get('#' + id + '-' + (values[field.id].length - 1) + '-' + keys[0]).focus();
      });
      container.append(add);
      return;
    }
    const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
    input.id = id;
    input.value = values[field.id];
    if (input.tagName === 'INPUT') input.type = { email: 'email', phone: 'tel', number: 'number' }[field.type] || 'text';
    input.required = !field.id.endsWith('.price_unit');
    if (field.type === 'number') { input.min = '0'; input.max = '100000000000'; input.step = '1'; }
    else input.maxLength = field.maxLength;
    if (field.type === 'phone') input.pattern = '[1-9][0-9]{7,14}';
    if (field.type === 'image') {
      input.readOnly = true;
      const row = element('div', undefined, 'image-field');
      const thumbnail = document.createElement('img');
      thumbnail.src = '../' + values[field.id];
      thumbnail.alt = 'Gambar untuk ' + field.label;
      const control = element('div');
      const choose = element('button', 'Pilih gambar');
      choose.type = 'button';
      choose.setAttribute('aria-label', 'Pilih gambar untuk ' + field.label);
      choose.addEventListener('click', () => {
        mediaTarget = field.id;
        mediaReturn = section;
        section = 'media';
        renderSection();
        get('#media-library').scrollIntoView({ behavior: 'instant' });
      });
      control.append(input, choose);
      row.append(thumbnail, control);
      container.append(row);
    } else {
      input.addEventListener('input', () => { values[field.id] = field.type === 'number' ? input.valueAsNumber : input.value; changed(); });
      container.append(input);
    }
  }
  function renderFields() {
    const host = get('#fields');
    host.replaceChildren();
    const fields = schema.fields.filter(field => field.group === section && (!subsection || field.section === subsection));
    let current = null;
    let group = null;
    for (const field of fields) {
      const name = field.section || sections[section][0];
      if (name !== current) {
        current = name;
        group = element('section', undefined, 'field-group');
        group.append(element('h2', name));
        host.append(group);
      }
      const wrapper = element('div', undefined, 'field');
      labelInput(field, wrapper);
      group.append(wrapper);
    }
  }
  function fillPreviewPages() {
    const select = get('#preview-page');
    select.replaceChildren(new Option('Beranda', 'home'));
    for (const slug of schema.services) select.add(new Option(values['services.' + slug + '.name'], slug));
  }
  function renderSection() {
    if (!schema) return;
    get('#section-title').textContent = sections[section][0];
    get('#section-help').textContent = sections[section][1];
    for (const button of get('#portal-nav').querySelectorAll('button')) {
      if (button.dataset.section === section) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    const groups = [...new Set(schema.fields.filter(field => field.group === section).map(field => field.section).filter(Boolean))];
    const withSubsection = section === 'services' || section === 'seo';
    get('#subsection-wrap').hidden = !withSubsection;
    if (withSubsection) {
      if (!groups.includes(subsection)) subsection = groups[0];
      get('#subsection').replaceChildren(...groups.map(name => new Option(name, name)));
      get('#subsection').value = subsection;
      document.querySelector('label[for=subsection]').textContent = section === 'services' ? 'Pilih layanan' : 'Pilih halaman';
    } else subsection = '';
    get('#content-form').hidden = section === 'history' || section === 'account';
    get('#media-library').hidden = section !== 'media';
    get('#history-view').hidden = section !== 'history';
    get('#account-view').hidden = section !== 'account';
    renderFields();
    if (section === 'media') renderMedia().catch(error => message(error.message));
    if (section === 'history') renderHistory();
  }

  async function renderMedia() {
    const target = get('#media-target');
    const imageFields = schema.fields.filter(field => field.type === 'image');
    target.replaceChildren(...imageFields.map(field => new Option(field.label, field.id)));
    target.value = mediaTarget;
    const data = await request('media');
    if (section !== 'media') return;
    const grid = get('#media-grid');
    grid.replaceChildren();
    for (const item of data.items) {
      const card = element('article', undefined, 'media-item');
      const image = document.createElement('img');
      image.src = '../' + item.path;
      image.alt = item.name;
      image.loading = 'lazy';
      const use = element('button', 'Gunakan gambar');
      use.type = 'button';
      use.setAttribute('aria-label', 'Gunakan gambar ' + item.name);
      use.addEventListener('click', () => {
        values[mediaTarget] = item.path;
        changed();
        message('Gambar dipilih. Simpan draf dan publikasikan untuk menerapkannya.');
        if (mediaReturn) { section = mediaReturn; mediaReturn = null; renderSection(); }
        else renderFields();
      });
      card.append(image, element('p', item.name + ' · ' + Math.ceil(item.bytes / 1024) + ' KB'), use);
      grid.append(card);
    }
  }
  function renderHistory() {
    const host = get('#history-view');
    host.replaceChildren();
    if (!state.history.length) { host.append(element('p', 'Versi sebelumnya akan muncul setelah publikasi pertama.')); return; }
    for (const item of state.history) {
      const card = element('article', undefined, 'history-item');
      const button = element('button', 'Pulihkan ke draf');
      button.type = 'button';
      button.addEventListener('click', () => run(async () => {
        if (dirty && !confirm('Ganti perubahan lokal yang belum disimpan dengan versi ini?')) return;
        const startedAt = edits;
        const result = await request('restore', { version, id: item.id });
        const clean = acceptWrite(result.state, startedAt);
        message(clean ? 'Versi dipulihkan ke draf. Tinjau melalui pratinjau sebelum publikasi.' : 'Versi dipulihkan di server. Perubahan lokal baru tetap tersedia dan perlu disimpan.');
      }));
      card.append(element('h2', item.publishedAt ? 'Versi sebelum publikasi #' + item.version : 'Konten awal'), element('p', formatTime(item.publishedAt)), button);
      host.append(card);
    }
  }
  function applyState(next) {
    state = next;
    values = structuredClone(state.draft);
    version = state.version;
    dirty = false;
    get('#conflict-actions').hidden = true;
    updateStatus();
    fillPreviewPages();
  }
  function acceptWrite(next, startedAt) {
    if (edits === startedAt) {
      applyState(next);
      renderFields();
      return true;
    }
    // Keep typing that happened after the request payload was sent.
    state = next;
    version = next.version;
    dirty = true;
    updateStatus();
    fillPreviewPages();
    return false;
  }
  async function loadContent(keepLocal = false) {
    const result = await request('content');
    schema = result.schema;
    if (keepLocal && values) {
      state = result.state;
      if (version !== state.version) get('#conflict-actions').hidden = false;
      updateStatus();
      fillPreviewPages();
    } else applyState(result.state);
    renderSection();
  }
  async function saveDraft() {
    if (!get('#content-form').reportValidity()) throw new Error('Lengkapi kolom yang ditandai sebelum menyimpan.');
    const startedAt = edits;
    const result = await request('save', { version, values });
    return acceptWrite(result.state, startedAt);
  }
  async function start() {
    try {
      const status = await request('status');
      csrf = status.csrf;
      uploadLimit = status.uploadLimit;
      get('#upload-help').textContent = 'PNG, JPG, atau WebP. Maksimal ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(uploadLimit / 1000000) + ' MB dan 6000 piksel.';
      get('#loading').hidden = true;
      if (!status.authenticated) {
        showAuth(status.configured);
        get('#setup-folder').textContent = status.storageFolder || '';
        return;
      }
      authenticated = true;
      get('#auth-view').hidden = true;
      get('#portal').hidden = false;
      get('#admin-name').textContent = status.username;
      await loadContent(dirty);
    } catch (error) {
      get('#loading').textContent = location.protocol === 'file:'
        ? 'Portal perlu dibuka melalui server PHP, bukan langsung sebagai berkas. Buka URL /admin/index.php pada server lokal atau hosting.'
        : error.message;
    }
  }
  for (const id of ['login-form', 'setup-form']) get('#' + id).addEventListener('submit', event => {
    event.preventDefault();
    run(async () => {
      const form = event.currentTarget;
      if (id === 'setup-form' && get('#setup-password').value !== get('#setup-confirm').value) throw new Error('Pengulangan kata sandi belum sesuai.');
      const body = Object.fromEntries(new FormData(form));
      await request(id === 'setup-form' ? 'setup' : 'login', body);
      form.reset();
      await start();
    }, true);
  });
  get('#content-form').addEventListener('submit', event => { event.preventDefault(); run(() => saveDraft()); });
  get('#save').addEventListener('click', () => run(async () => { const clean = await saveDraft(); message(clean ? 'Draf disimpan. Gunakan pratinjau untuk meninjau hasilnya.' : 'Draf disimpan. Ada perubahan baru yang masih perlu disimpan.'); }));
  get('#portal-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-section]');
    if (!button) return;
    section = button.dataset.section;
    mediaReturn = null;
    renderSection();
    get('#editor').focus({ preventScroll: true });
  });
  get('#subsection').addEventListener('change', event => { subsection = event.target.value; renderFields(); });
  get('#media-target').addEventListener('change', event => { mediaTarget = event.target.value; });
  get('#media-upload').addEventListener('change', event => run(async () => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > uploadLimit) throw new Error('Ukuran gambar melewati batas unggahan yang ditampilkan portal.');
    const body = new FormData();
    body.append('image', file);
    await request('upload', body, true);
    event.target.value = '';
    await renderMedia();
    message('Gambar diunggah. Pilih Gunakan gambar untuk menerapkannya pada draf.');
  }));
  get('#publish').addEventListener('click', () => get('#publish-dialog').showModal());
  get('#confirm-publish').addEventListener('click', () => run(async () => {
    if (dirty && !await saveDraft()) throw new Error('Ada perubahan baru selama penyimpanan. Simpan kembali sebelum melanjutkan.');
    const startedAt = edits;
    const result = await request('publish', { version });
    const clean = acceptWrite(result.state, startedAt);
    get('#publish-dialog').close();
    message(clean ? 'Pembaruan dipublikasikan ke tujuh halaman website.' : 'Versi yang disimpan telah dipublikasikan. Ada perubahan lokal baru yang belum disimpan.');
    if (section === 'history') renderHistory();
  }));
  get('#preview').addEventListener('click', () => run(async () => {
    if (dirty && !await saveDraft()) throw new Error('Ada perubahan baru selama penyimpanan. Simpan kembali sebelum melanjutkan.');
    fillPreviewPages();
    get('#preview-frame').src = 'api.php?action=preview&page=' + encodeURIComponent(get('#preview-page').value);
    get('#preview-dialog').showModal();
  }));
  get('#preview-page').addEventListener('change', event => {
    get('#preview-frame').src = 'api.php?action=preview&page=' + encodeURIComponent(event.target.value);
  });
  get('#close-preview').addEventListener('click', () => get('#preview-dialog').close());
  get('#preview-dialog').addEventListener('close', () => { get('#preview-frame').src = 'about:blank'; });
  get('#reload-content').addEventListener('click', () => run(async () => {
    if (dirty && !confirm('Muat ulang konten server dan lepaskan perubahan lokal yang belum disimpan?')) return;
    await loadContent();
    message('Konten terbaru dimuat.');
  }));
  get('#logout').addEventListener('click', () => run(async () => {
    if (dirty && !confirm('Keluar dan lepaskan perubahan lokal yang belum disimpan?')) return;
    await request('logout', {});
    dirty = false;
    values = state = null;
    await start();
  }));
  get('#password-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    run(async () => {
      if (get('#new-password').value !== get('#confirm-password').value) throw new Error('Pengulangan kata sandi belum sesuai.');
      await request('password', Object.fromEntries(new FormData(form)));
      form.reset();
      message('Kata sandi diperbarui.');
    });
  });
  addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  addEventListener('keydown', event => {
    if (authenticated && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      run(() => saveDraft());
    }
  });
  start();
})();
