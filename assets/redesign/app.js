const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

if (menu && navigation) {
  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    navigation.classList.toggle('open', open);
  }

  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  matchMedia('(max-width: 820px)').addEventListener('change', () => setMenu(false));
}

const filters = document.querySelectorAll('[data-filter]');
const serviceGroups = document.querySelectorAll('.service-group[data-category]');
const filterStatus = document.querySelector('#filter-status');

if (filters.length && serviceGroups.length && filterStatus) {
  filters[0].closest('.filter-row').hidden = false;

  for (const button of filters) {
    button.addEventListener('click', () => {
      for (const filter of filters) {
        filter.classList.toggle('active', filter === button);
        filter.setAttribute('aria-pressed', String(filter === button));
      }
      let count = 0;
      for (const group of serviceGroups) {
        group.hidden = button.dataset.filter !== 'all' && group.dataset.category !== button.dataset.filter;
        if (!group.hidden) count += group.querySelectorAll('.service-option').length;
      }
      filterStatus.textContent = `${count} layanan ditampilkan`;
      document.dispatchEvent(new Event('service-filter-change'));
    });
  }
}

const form = document.querySelector('#consultation-form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = data.get('name').trim();
  const service = data.get('service');
  const request = data.get('message').trim();
  const message = `Halo Metromatika, saya ${name}.\n\nSaya ingin berkonsultasi tentang ${service}.\n\n${request}`;
  const link = document.createElement('a');
  link.href = 'https://wa.me/' + (form.dataset.whatsapp || '6282166615433') + '?text=' + encodeURIComponent(message);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
  document.querySelector('#form-status').textContent = 'Pesan telah disiapkan. Periksa dan kirim pesan melalui WhatsApp.';
});
