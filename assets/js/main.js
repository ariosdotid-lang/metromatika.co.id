(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigasi');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup navigasi' : 'Buka navigasi');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open && innerWidth <= 850);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    addEventListener('resize', () => {
      if (innerWidth > 850 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  }
  const heroMedia = document.querySelector('.hero-media');
  const finePointer = matchMedia('(min-width: 851px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (heroMedia) {
    let frame = 0;
    let point = null;
    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      point = null;
      for (const property of ['--hero-tilt-x', '--hero-tilt-y', '--hero-shift-x', '--hero-shift-y']) {
        heroMedia.style.removeProperty(property);
      }
    };
    const sync = () => {
      heroMedia.classList.toggle('is-interactive', finePointer.matches);
      if (!finePointer.matches) reset();
    };
    heroMedia.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || event.pointerType !== 'mouse') return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!finePointer.matches || !point) return;
        const bounds = heroMedia.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (point.x - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (point.y - bounds.top) / bounds.height * 2 - 1));
        heroMedia.style.setProperty('--hero-tilt-x', `${(-y * 2).toFixed(2)}deg`);
        heroMedia.style.setProperty('--hero-tilt-y', `${(x * 2).toFixed(2)}deg`);
        heroMedia.style.setProperty('--hero-shift-x', `${(x * 5).toFixed(2)}px`);
        heroMedia.style.setProperty('--hero-shift-y', `${(y * 5).toFixed(2)}px`);
      });
    });
    heroMedia.addEventListener('pointerleave', reset);
    finePointer.addEventListener('change', sync);
    sync();
  }
})();
