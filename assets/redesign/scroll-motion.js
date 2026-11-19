(() => {
  const showcase = document.querySelector('.service-showcase');
  const options = [...document.querySelectorAll('.service-option')];
  const captions = {
    website: 'Aplikasi yang menyatukan data dan alur kerja tim.',
    mobile: 'Akses layanan dan pekerjaan melalui perangkat mobile.',
    design: 'Rancang dan uji alur sebelum aplikasi dikembangkan.',
    network: 'Hubungkan pengguna, kantor, dan sistem internal.',
    cloud: 'Siapkan lingkungan aplikasi dan pemantauan sistem.',
    security: 'Tinjau risiko dan susun prioritas perlindungan.'
  };

  function selectService(option) {
    if (!showcase || !option) return;
    for (const other of options) {
      if (other !== option) other.open = false;
    }
    const service = option.dataset.serviceOption;
    showcase.dataset.service = service;
    for (const panel of showcase.querySelectorAll('[data-demo-view]')) {
      panel.hidden = panel.dataset.demoView !== service;
    }
    showcase.querySelector('#showcase-title').textContent =
      option.querySelector('.service-option-title').firstChild.textContent;
    showcase.querySelector('#showcase-caption').textContent = option.dataset.caption || captions[service];
    showcase.querySelector('.showcase-category').textContent =
      option.closest('.service-group').querySelector('h3').textContent;
  }

  for (const option of options) {
    option.addEventListener('toggle', () => {
      if (option.open) selectService(option);
    });
  }
  document.addEventListener('service-filter-change', () => {
    const visibleOptions = options.filter(option => !option.closest('.service-group').hidden);
    const selected = visibleOptions.find(option => option.open) || visibleOptions[0];
    if (selected) {
      selected.open = true;
      selectService(selected);
    }
  });

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll(
    '.section-heading, .filter-row, .service-explorer, .profile-layout > *, ' +
    '.example-list article, #process h2, .work-steps li, .faq h2, .faq details, ' +
    '.contact-grid > *, .footer-grid > *'
  )];
  const steps = [...document.querySelectorAll('.work-steps li')];
  for (const [index, step] of steps.entries()) {
    step.style.setProperty('--entrance-delay', `${index * 70}ms`);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });

  const profile = document.querySelector('.company-profile');
  const surfaces = [
    { node: showcase, property: '--scroll-turn', unit: 'deg', value: 0, target: 0, active: false },
    { node: profile, property: '--profile-shift', unit: 'px', value: 0, target: 0, active: false }
  ].filter(surface => surface.node);
  let frame = 0;
  let previous = 0;
  let needsMeasure = true;

  function setMotionPreference() {
    if (frame) cancelAnimationFrame(frame);
    frame = previous = 0;
    for (const target of targets) {
      observer.unobserve(target);
      target.classList.remove('scroll-reveal', 'scroll-visible');
      if (!motionPreference.matches) {
        target.classList.add('scroll-reveal');
        observer.observe(target);
      }
    }
    for (const surface of surfaces) {
      surface.value = surface.target = 0;
      surface.node.style.removeProperty(surface.property);
      surface.node.classList.remove('motion-active');
    }
    document.dispatchEvent(new Event('motion-preference-change'));
    scheduleScroll();
  }

  function updateScroll(time) {
    frame = 0;
    if (motionPreference.matches || document.hidden) { previous = 0; return; }
    // Read all layout first; transform writes happen only after measurement.
    if (needsMeasure) {
      for (const surface of surfaces) {
        const bounds = surface.node.getBoundingClientRect();
        surface.active = bounds.bottom > 0 && bounds.top < innerHeight;
        if (!surface.active) continue;
        if (surface.node === showcase) {
          const progress = (bounds.top + bounds.height / 2 - innerHeight / 2) / innerHeight;
          surface.target = Math.max(-1, Math.min(1, progress)) * 9;
        } else {
          surface.target = Math.max(-24, Math.min(24, (bounds.top - innerHeight / 2) * .045));
        }
      }
      needsMeasure = false;
    }
    const delta = previous ? Math.min((time - previous) / 1000, .05) : 1 / 60;
    previous = time;
    const blend = 1 - Math.exp(-delta * 12);
    let settling = false;
    for (const surface of surfaces) {
      surface.node.classList.toggle('motion-active', surface.active);
      if (!surface.active) continue;
      const distance = surface.target - surface.value;
      surface.value = Math.abs(distance) < .015 ? surface.target : surface.value + distance * blend;
      surface.node.style.setProperty(surface.property, surface.value.toFixed(3) + surface.unit);
      if (Math.abs(surface.target - surface.value) >= .015) settling = true;
    }
    if (settling) frame = requestAnimationFrame(updateScroll);
    else previous = 0;
  }

  function scheduleScroll() {
    needsMeasure = true;
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = previous = 0;
      return;
    }
    if (!frame && !motionPreference.matches) frame = requestAnimationFrame(updateScroll);
  }
  motionPreference.addEventListener('change', setMotionPreference);
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  document.addEventListener('visibilitychange', scheduleScroll);
  setMotionPreference();
})();
