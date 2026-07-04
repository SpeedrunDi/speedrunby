// Small interactive chrome: theme toggle, copy-email, header elevation.
// Motion extras (magnetic buttons, tilt, counters) load in motion.ts.
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const paint = () => {
    btn.setAttribute('aria-pressed', root.dataset.theme === 'light' ? 'true' : 'false');
    // keep the authoritative theme-color in sync for mobile UI chrome
    const dark = root.dataset.theme !== 'light';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = dark ? '#161311' : '#f6f1e9';
  };
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    if (next === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable */
    }
    paint();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  });
  paint();
}

function initCopyEmail() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach((btn) => {
    const email = btn.dataset.copyEmail!;
    const toast = btn.querySelector<HTMLElement>('.copy-toast');
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        toast?.style.setProperty('opacity', '1');
        if (status) status.textContent = toast?.textContent ?? 'Copied';
        setTimeout(() => {
          toast?.style.setProperty('opacity', '0');
          if (status) status.textContent = '';
        }, 1700);
      } catch {
        location.href = `mailto:${email}`;
      }
    });
  });
}

function initHeaderElevation() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initProjectsToggle() {
  const btn = document.querySelector<HTMLButtonElement>('[data-projects-toggle]');
  const grid = document.getElementById('more-projects');
  if (!btn || !grid) return;
  const label = btn.querySelector<HTMLElement>('[data-toggle-label]');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    grid.hidden = expanded;
    btn.setAttribute('aria-expanded', String(!expanded));
    if (label) label.textContent = expanded ? btn.dataset.labelMore! : btn.dataset.labelLess!;
    // sections below shift — let ScrollTrigger re-measure if motion is up
    (window as unknown as { __refreshST?: () => void }).__refreshST?.();
    if (expanded) grid.closest('section')?.scrollIntoView({ block: 'start' });
  });
}

function initLangSwitch() {
  // preserve the current #hash when switching locale
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((a) => {
    a.addEventListener('click', () => {
      if (location.hash) a.href = a.href.split('#')[0] + location.hash;
    });
  });
}

initThemeToggle();
initCopyEmail();
initHeaderElevation();
initLangSwitch();
initProjectsToggle();
