// Anti-FOUC theme boot. External file on purpose: the CSP is
// `script-src 'self'` with no inline scripts. Dark is the default;
// only the light theme sets an attribute.
(function () {
  var stored = null;
  try {
    stored = localStorage.getItem('theme');
  } catch (_e) {
    /* storage unavailable */
  }
  var light =
    stored === 'light' ||
    (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  if (light) document.documentElement.setAttribute('data-theme', 'light');
  // enable colour transitions only after first paint
  requestAnimationFrame(function () {
    document.documentElement.classList.add('theme-ready');
  });
})();
