(() => {
  const hero = document.querySelector('.hero');
  const copy = document.querySelector('.hero-copy');
  const hud = document.querySelector('.founder-hud');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero || reduced || !window.gsap) return;

  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  gsap.from('.hero-copy > *', { y: 20, opacity: 0, duration: .75, stagger: .07, ease: 'power2.out', delay: .12 });
  gsap.from(hud, { y: 26, opacity: 0, duration: 1, ease: 'power2.out', delay: .28 });
  gsap.to('.portrait-frame', { y: -6, duration: 4.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  if (window.ScrollTrigger) {
    gsap.to([copy, hud], { y: -34, opacity: .45, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .55 } });
    window.ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', scrub: .55, onUpdate: self => window.DrdHero3D?.setScroll(self.progress) });
  }
  if (window.matchMedia('(min-width: 821px)').matches && hud) {
    const xTo = gsap.quickTo(hud, 'x', { duration: .8, ease: 'power3.out' });
    const yTo = gsap.quickTo(hud, 'y', { duration: .8, ease: 'power3.out' });
    hero.addEventListener('pointermove', event => { const box = hero.getBoundingClientRect(); xTo((event.clientX - box.left - box.width / 2) / box.width * 4); yTo((event.clientY - box.top - box.height / 2) / box.height * 3); }, { passive: true });
    hero.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  }
})();

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = [...document.querySelectorAll('#hero, #about, #arsenal, #projects, #research, #contact')];
  const links = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  const setActive = id => links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-35% 0px -55% 0px' }); sections.forEach(section => observer.observe(section)); }
  if (reduced || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.utils.toArray('.section-reveal').forEach(element => gsap.from(element, { y: 24, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 84%' } }));
  gsap.from('.executive-node dl div', { x: 14, opacity: 0, duration: .42, stagger: .06, ease: 'power2.out', scrollTrigger: { trigger: '.executive-node', start: 'top 75%' } });
  gsap.from('.arsenal-card', { y: 18, opacity: 0, duration: .48, stagger: { each: .035, from: 'start' }, ease: 'power2.out', scrollTrigger: { trigger: '.arsenal-grid', start: 'top 84%' } });
  gsap.from('.project-card', { y: 20, opacity: 0, duration: .52, stagger: { each: .08, from: 'start' }, ease: 'power2.out', scrollTrigger: { trigger: '.projects-grid', start: 'top 84%' } });
  gsap.from('.intelligence-panel', { y: 20, opacity: 0, duration: .5, stagger: .09, ease: 'power2.out', scrollTrigger: { trigger: '.intelligence-grid', start: 'top 84%' } });
  gsap.from('.research-node', { y: 14, opacity: 0, duration: .42, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: '.research-map', start: 'top 84%' } });
  gsap.from('.achievement-timeline li', { x: -14, opacity: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: '.achievement-timeline', start: 'top 85%' } });
})();
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.from('.micro-telemetry i, .repo-trace i', { scaleX: 0, transformOrigin: 'left center', duration: .45, stagger: .06, ease: 'power2.out', scrollTrigger: { trigger: '.intelligence-grid', start: 'top 82%' } });
  gsap.from('.research-hub', { scale: .72, opacity: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: '.research-map', start: 'top 83%' } });
  gsap.from('.verification-panel', { y: 18, opacity: 0, duration: .5, stagger: .08, ease: 'power2.out', scrollTrigger: { trigger: '.verification-grid', start: 'top 84%' } });
})();
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.from('.contact-channels a', { y: 16, opacity: 0, duration: .45, stagger: .05, ease: 'power2.out', scrollTrigger: { trigger: '.contact-channels', start: 'top 84%' } });
  gsap.from('.terminal-window', { y: 18, opacity: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: '.terminal-window', start: 'top 85%' } });
})();