// One-shot styled DevTools signature, imported by ui.ts.
// console.info ONLY — never warn/error — so Lighthouse's
// "browser errors logged to console" best-practices audit never moves.
// Zero DOM, zero layout, zero listeners: it cannot touch LCP or CLS,
// and it fires at most once per page load.
let done = false;

export function initConsoleSignature() {
  if (done) return;
  done = true;

  const emit = () => {
    const en = (document.documentElement.lang || 'ru').toLowerCase().startsWith('en');

    // Fixed mid-clay reads on both the dark AND light DevTools console
    // background (the console theme is independent of the page theme);
    // the pre-darkened light-theme --su-clay (#a94d2a) would be too dim.
    const clay = '#e0855c';
    const mute = '#93897b';

    const head = en
      ? 'Hi — you opened the console. Here’s the honest stack:'
      : 'Привет — ты открыл консоль. Вот честный стек:';
    const stack = en
      ? 'Astro · vanilla three.js · strict CSP — no framework runtime on the client.'
      : 'Astro · vanilla three.js · строгий CSP — без рантайма фреймворка на клиенте.';
    const line = en
      ? 'Building something similar? → a.kydyraliev@evogroup.ai'
      : 'Строишь похожее? → a.kydyraliev@evogroup.ai';

    const mono = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
    console.info(
      `%c${head}\n%c${stack}\n%c${line}`,
      `color:${clay};font:600 13px/1.7 ${mono}`,
      `color:${mute};font:400 12px/1.7 ${mono}`,
      `color:${clay};font:400 12px/1.7 ${mono}`,
    );
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(emit, { timeout: 3000 });
  } else {
    setTimeout(emit, 400);
  }
}
