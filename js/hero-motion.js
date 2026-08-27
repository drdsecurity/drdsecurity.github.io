(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero-module');
  const copy = document.querySelector('.hero-copy');
  const hud = document.querySelector('.founder-hud');
  const portrait = document.querySelector('.portrait-frame');
  const portraitImage = portrait?.querySelector('img');
  document.documentElement.style.scrollBehavior = 'auto';

  const NAV_TARGETS = Object.freeze({
    home: Object.freeze({ moduleId: 'hero-dashboard', rowId: 'hero-row', selector: '.hero-module' }),
    about: Object.freeze({ moduleId: 'executive-profile', rowId: 'executive-research-row', selector: '.executive-module' }),
    arsenal: Object.freeze({ moduleId: 'cyber-arsenal', rowId: 'arsenal-projects-row', selector: '.arsenal-module' }),
    projects: Object.freeze({ moduleId: 'command-systems', rowId: 'arsenal-projects-row', selector: '.projects-module' }),
    github: Object.freeze({ moduleId: 'github-activity', rowId: 'github-stack-row', selector: '.github-module' }),
    research: Object.freeze({ moduleId: 'research-matrix', rowId: 'executive-research-row', selector: '.research-module' }),
    achievements: Object.freeze({ moduleId: 'achievements-panel', rowId: 'achievements-connect-row', selector: '.achievements-module' }),
    contact: Object.freeze({ moduleId: 'connect-node', rowId: 'achievements-connect-row', selector: '.connect-module' })
  });
  const ROWS = Object.freeze({
    'hero-row': Object.freeze({ anchor: 'home', defaultTarget: 'home' }),
    'arsenal-projects-row': Object.freeze({ anchor: 'arsenal', defaultTarget: 'arsenal' }),
    'executive-research-row': Object.freeze({ anchor: 'about', defaultTarget: 'about' }),
    'github-stack-row': Object.freeze({ anchor: 'github', defaultTarget: 'github' }),
    'achievements-connect-row': Object.freeze({ anchor: 'achievements', defaultTarget: 'achievements' }),
    'terminal-row': Object.freeze({ anchor: null, defaultTarget: null })
  });
  const modules = new Map();
  Object.entries(NAV_TARGETS).forEach(([navKey, target]) => {
    const element = document.querySelector(target.selector);
    if (element) element.id = target.moduleId;
    modules.set(navKey, element);
  });
  const validateNavConfiguration = () => Object.keys(NAV_TARGETS).length === 8
    && Object.values(NAV_TARGETS).every(target => modules.get(Object.keys(NAV_TARGETS).find(key => NAV_TARGETS[key] === target))?.id === target.moduleId)
    && new Set(Object.values(NAV_TARGETS).map(target => target.moduleId)).size === 8
    && Object.values(NAV_TARGETS).every(target => ROWS[target.rowId]);
  if (!validateNavConfiguration()) return;

  const navControls = [...document.querySelectorAll('[data-nav-target], [data-section-target]')].filter(control => {
    const navKey = control.dataset.navTarget || control.dataset.sectionTarget;
    if (!NAV_TARGETS[navKey]) return false;
    control.dataset.navTarget = navKey;
    control.removeAttribute('data-section-target');
    return true;
  });
  const sidebarControls = navControls.filter(control => control.closest('.command-sidebar, .mobile-nav'));
  let activeNavTarget = 'home';
  let isProgrammaticNavigation = false;
  let passiveFrame = 0;

  const restoreHeroVisualState = () => {
    const visuals = [hud, portrait, portraitImage].filter(Boolean);
    if (window.gsap) {
      window.gsap.set(visuals, { clearProps: 'opacity,visibility' });
      window.gsap.set(visuals, { opacity: 1, visibility: 'visible' });
    } else visuals.forEach(element => { element.style.opacity = '1'; element.style.visibility = 'visible'; });
  };
  window.restoreHeroVisualState = restoreHeroVisualState;

  const setActiveNav = navKey => {
    sidebarControls.forEach(control => {
      const isActive = control.dataset.navTarget === navKey;
      control.classList.toggle('is-active', isActive);
      if (isActive) control.setAttribute('aria-current', 'page');
      else control.removeAttribute('aria-current');
    });
  };
  const setSpotlight = navKey => {
    document.querySelectorAll('.nav-target-active').forEach(element => element.classList.remove('nav-target-active'));
    modules.get(navKey)?.classList.add('nav-target-active');
  };
  const rowAnchorFor = navKey => {
    const target = NAV_TARGETS[navKey];
    if (window.innerWidth <= 768) return modules.get(navKey);
    return modules.get(ROWS[target.rowId].anchor) || modules.get(navKey);
  };
  const navigateTo = navKey => {
    const target = NAV_TARGETS[navKey];
    const module = modules.get(navKey);
    if (!target || !module) return false;
    activeNavTarget = navKey;
    isProgrammaticNavigation = true;
    setSpotlight(navKey);
    setActiveNav(navKey);
    const anchor = rowAnchorFor(navKey);
    const top = navKey === 'home' ? 0 : Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 768 ? 70 : 18));
    window.scrollTo({ top, behavior: 'auto' });
    if (navKey === 'home') {
      restoreHeroVisualState();
      window.requestAnimationFrame(() => { restoreHeroVisualState(); window.ScrollTrigger?.update(); });
    }
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => { isProgrammaticNavigation = false; }));
    return true;
  };
  window.navigateTo = navigateTo;

  const onNavigationClick = event => {
    const control = event.target.closest('[data-nav-target]');
    if (!control || !navControls.includes(control)) return;
    event.preventDefault();
    navigateTo(control.dataset.navTarget);
    control.closest('details')?.removeAttribute('open');
  };
  document.addEventListener('click', onNavigationClick);
  document.addEventListener('keydown', event => {
    if (event.key !== ' ') return;
    const control = event.target.closest?.('[data-nav-target]');
    if (!control || !navControls.includes(control)) return;
    event.preventDefault();
    navigateTo(control.dataset.navTarget);
  });

  const currentRow = () => {
    const marker = window.scrollY + 100;
    const rows = Object.entries(ROWS).filter(([, row]) => row.anchor).map(([rowId, row]) => ({ rowId, row, element: modules.get(row.anchor) })).filter(entry => entry.element).sort((a, b) => a.element.getBoundingClientRect().top - b.element.getBoundingClientRect().top);
    let current = rows[0];
    rows.forEach(entry => { if (entry.element.getBoundingClientRect().top + window.scrollY <= marker) current = entry; });
    return current?.rowId || 'hero-row';
  };
  const updateFromManualScroll = () => {
    passiveFrame = 0;
    if (isProgrammaticNavigation) return;
    if (window.scrollY <= 10) restoreHeroVisualState();
    const rowId = currentRow();
    if (NAV_TARGETS[activeNavTarget].rowId === rowId) return;
    const defaultTarget = ROWS[rowId]?.defaultTarget;
    if (!defaultTarget) return;
    activeNavTarget = defaultTarget;
    setSpotlight(defaultTarget);
    setActiveNav(defaultTarget);
  };
  const scheduleManualScrollUpdate = () => { if (!passiveFrame) passiveFrame = window.requestAnimationFrame(updateFromManualScroll); };
  window.addEventListener('scroll', scheduleManualScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleManualScrollUpdate, { passive: true });
  setSpotlight(activeNavTarget);
  setActiveNav(activeNavTarget);

  if (!hero || reduced || !window.gsap) return;
  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  gsap.from('.hero-copy > *', { y: 16, opacity: 0, duration: .62, stagger: .055, ease: 'power2.out', delay: .1 });
  gsap.from(hud, { y: 20, opacity: 0, duration: .75, ease: 'power2.out', delay: .2 });
  gsap.to('.portrait-frame', { y: -5, duration: 4.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  if (!window.ScrollTrigger) return;
  gsap.to(copy, { y: -18, opacity: .7, ease: 'none', scrollTrigger: { trigger: hero, start: '60% top', end: 'bottom top', scrub: .55, invalidateOnRefresh: true } });
  window.ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', scrub: .55, invalidateOnRefresh: true, onUpdate: self => window.DrdHero3D?.setScroll(self.progress) });
  gsap.utils.toArray('.dashboard-module:not(.hero-module):not(.kpi-module)').forEach(panel => gsap.from(panel, { y: 12, opacity: 0, duration: .35, ease: 'power2.out', scrollTrigger: { trigger: panel, start: 'top 92%' } }));
})();
