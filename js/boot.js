(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('boot-active');
  window.setTimeout(() => document.documentElement.classList.remove('boot-active'), 1150);
})();
