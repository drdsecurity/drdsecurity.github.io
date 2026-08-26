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
