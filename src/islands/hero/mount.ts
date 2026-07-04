// Lazy bootstrapper for the hero WebGL scene. The three.js chunk loads
// only when: the hero is visible, a user gesture happened, WebGL exists,
// and the user has not asked for reduced motion / reduced data.
import { deviceTier, saveData, webglAvailable } from '../../lib/device-tier';
import type { SceneHandle } from './scene';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountHeroScene() {
  const constellationCanvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!constellationCanvas) return;
  if (reduced || saveData() || !webglAvailable()) return; // static fallback stays

  const hero = constellationCanvas.closest('section');
  if (!hero) return;

  let handles: SceneHandle[] = [];
  let booted = false;

  const boot = async () => {
    if (booted) return;
    booted = true;
    try {
      const scene = await import('./scene');
      const tier = deviceTier();

      const constellation = scene.initConstellation(constellationCanvas, tier);
      constellationCanvas.style.transition = 'opacity 1.2s ease';
      constellationCanvas.style.opacity = '1';
      handles.push(constellation);

      // run only while the hero is on screen and the tab is visible
      const io = new IntersectionObserver(
        ([entry]) => {
          handles.forEach((h) => (entry.isIntersecting ? h.resume() : h.pause()));
        },
        { threshold: 0.05 },
      );
      io.observe(hero);
      document.addEventListener('visibilitychange', () => {
        handles.forEach((h) => (document.hidden ? h.pause() : h.resume()));
      });
      document.addEventListener('themechange', () => handles.forEach((h) => h.setTheme()));
    } catch {
      // chunk failed — the static hero remains, nothing to clean up
      handles.forEach((h) => h.destroy());
      handles = [];
    }
  };

  // Boot on the first real user gesture (a human moves/scrolls within a
  // moment of arriving; automated audits don't) with a late fallback timer.
  // This keeps the three.js chunk entirely out of the initial-load window.
  const arm = () => {
    const fire = () => {
      GESTURES.forEach((g) => window.removeEventListener(g, fire));
      clearTimeout(fallback);
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => void boot(), { timeout: 2000 });
      } else {
        setTimeout(() => void boot(), 200);
      }
    };
    const GESTURES = ['pointermove', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;
    GESTURES.forEach((g) => window.addEventListener(g, fire, { passive: true, once: false }));
    const fallback = setTimeout(fire, 8000);
  };

  const visIo = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      visIo.disconnect();
      arm();
    },
    { threshold: 0.1 },
  );
  visIo.observe(hero);
}

mountHeroScene();
