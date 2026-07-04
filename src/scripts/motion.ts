// The motion world: Lenis smooth scroll + GSAP ScrollTrigger choreography.
// Loaded via requestIdleCallback from the Layout so it never competes with
// LCP. The hero ENTRANCE is pure CSS (see global.css) — this module owns
// scroll-time effects and pointer micro-interactions only.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const fine = window.matchMedia('(pointer: fine)').matches;

/* ---------- Lenis + ScrollTrigger sync ---------- */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  // critical: keep ScrollTrigger in sync with the smoothed scroll position
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // anchor links scroll through Lenis with the sticky-header offset
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href')!);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    });
  });

  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
}

/* ---------- scroll reveals ---------- */
function initReveals() {
  document.querySelectorAll<HTMLElement>('.reveal-group').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('.fade-up');
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 82%', once: true },
    });
  });
  // standalone fade-ups (skip anything inside a collapsed container)
  document.querySelectorAll<HTMLElement>('.fade-up').forEach((el) => {
    if (el.closest('.reveal-group') || el.closest('[hidden]')) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // SAFETY NET: an instant jump (End key, scroll restoration, anchor deep-link)
  // can land past a trigger without ScrollTrigger registering the crossing —
  // content then stays invisible (seen in prod). Any fade-up that is on screen
  // but still hidden shortly after intersecting gets revealed unconditionally.
  const net = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        net.unobserve(el);
        setTimeout(() => {
          if (Number(getComputedStyle(el).opacity) < 0.5) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
          }
        }, 1000);
      });
    },
    { threshold: 0.05 },
  );
  document.querySelectorAll<HTMLElement>('.fade-up').forEach((el) => {
    if (el.closest('[hidden]')) return;
    net.observe(el);
  });
}

/* ---------- hero scroll drift ---------- */
function initHeroScrub() {
  const copy = document.querySelector('.hero-copy');
  const portrait = document.querySelector('[data-hero="portrait"]');
  if (!copy) return;
  gsap.to(copy, {
    y: -44,
    opacity: 0.35,
    ease: 'none',
    scrollTrigger: {
      trigger: 'main > section:first-child',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8,
    },
  });
  if (portrait) {
    gsap.to(portrait, {
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: 'main > section:first-child',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
  }
}

/* ---------- count-up stats ---------- */
function initCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const to = Number(el.dataset.to ?? el.textContent);
    if (!Number.isFinite(to)) return;
    const state = { value: 0 };
    gsap.to(state, {
      value: to,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(state.value));
      },
    });
  });
}

/* ---------- magnetic buttons (fine pointer only) ---------- */
function initMagnetic() {
  if (!fine) return;
  document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
    const strength = 10;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ---------- card tilt (badge / featured badge image) ---------- */
function initTilt() {
  if (!fine) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotateY: x * 6,
        rotateX: -y * 6,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
}

/* ---------- process: progress rail + active step ---------- */
function initProcess() {
  const steps = document.querySelectorAll<HTMLElement>('.process-step');
  const rail = document.getElementById('process-rail');
  const list = document.querySelector('[data-process-steps]');
  if (!steps.length || !list) return;

  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => step.classList.toggle('is-active', self.isActive),
    });
  });

  if (rail) {
    gsap.to(rail, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: list,
        start: 'top 65%',
        end: 'bottom 45%',
        scrub: 0.6,
      },
    });
  }
}

initLenis();
initReveals();
initHeroScrub();
initCounters();
initMagnetic();
initTilt();
initProcess();

// layout hooks for ui.ts (projects toggle shifts everything below it)
(window as unknown as { __refreshST?: () => void }).__refreshST = () => ScrollTrigger.refresh();

// boot signal for e2e determinism (idle loading is racy on slow runners)
(window as unknown as { __motionReady?: boolean }).__motionReady = true;
