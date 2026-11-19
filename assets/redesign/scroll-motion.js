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
    showcase.querySelector('#showcase-caption').textContent = captions[service];
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
    step.style.setProperty('--entrance-delay', `${index * 90}ms`);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
      } else if (entry.boundingClientRect.top > innerHeight) {
        entry.target.classList.remove('scroll-visible');
      }
    }
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });

  function setMotionPreference() {
    for (const target of targets) {
      observer.unobserve(target);
      target.classList.remove('scroll-reveal', 'scroll-visible');
      if (!motionPreference.matches) {
        target.classList.add('scroll-reveal');
        observer.observe(target);
      }
    }
    // Keep all motion surfaces synchronized when the OS preference changes.
    document.dispatchEvent(new Event('motion-preference-change'));
    if (motionPreference.matches) {
      showcase?.style.removeProperty('--scroll-turn');
      document.querySelector('.company-profile')?.style.removeProperty('--profile-shift');
    }
  }
  setMotionPreference();
  motionPreference.addEventListener('change', setMotionPreference);

  const profile = document.querySelector('.company-profile');
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    if (motionPreference.matches || document.hidden) return;
    if (showcase) {
      const bounds = showcase.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < innerHeight) {
        const progress = Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - innerHeight / 2) / innerHeight));
        showcase.style.setProperty('--scroll-turn', `${progress * 9}deg`);
      }
    }
    if (profile) {
      const bounds = profile.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < innerHeight) {
        const offset = Math.max(-24, Math.min(24, (bounds.top - innerHeight / 2) * .045));
        profile.style.setProperty('--profile-shift', `${offset}px`);
      }
    }
  }
  function scheduleScroll() {
    if (!scheduled && !motionPreference.matches) {
      scheduled = true;
      requestAnimationFrame(updateScroll);
    }
  }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  document.addEventListener('visibilitychange', scheduleScroll);
  scheduleScroll();
})();
