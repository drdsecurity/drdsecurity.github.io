(() => {
  if (window.__drdBootInitialized) return;
  window.__drdBootInitialized = true;
  window.bootInitCount = (window.bootInitCount || 0) + 1;
  const root = document.documentElement;
  const complete = () => {
    root.classList.remove('boot-active');
    document.body.classList.add('boot-complete');
    const overlay = document.querySelector('.boot-overlay');
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.inert = true;
    }
  };
  root.classList.add('boot-active');
  window.setTimeout(complete, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1150);
})();
