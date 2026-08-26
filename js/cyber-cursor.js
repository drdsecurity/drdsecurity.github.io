(() => {
  'use strict';

  const finePointer = window.matchMedia?.('(pointer: fine) and (hover: hover)');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!finePointer?.matches) return;

  try {
    const cursor = document.createElement('div');
    cursor.className = 'cyber-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<div class="cyber-cursor__trail"></div><div class="cyber-cursor__dot"></div><div class="cyber-cursor__ring"></div><div class="cyber-cursor__ticks"><i></i><i></i><i></i><i></i></div>';
    document.body.append(cursor);
    const trail = cursor.querySelector('.cyber-cursor__trail');

    const state = { x: 0, y: 0, ringX: 0, ringY: 0, previousX: 0, previousY: 0, active: false, target: null };
    const interactiveSelector = 'a, button, [role="button"], .project-card, .arsenal-grid article, .contact-channels a';
    const inputSelector = 'input, textarea, select, [contenteditable="true"]';
    const magneticSelector = '.button, .desktop-nav a, .mobile-nav a, .project-card';
    let frame = 0;
    let clickTimer = 0;

    document.body.classList.add('custom-cursor-enabled');

    const setMode = target => {
      state.target = target;
      cursor.classList.toggle('is-input', Boolean(target?.closest(inputSelector)));
      cursor.classList.toggle('is-lock', Boolean(target?.closest(interactiveSelector)) && !target?.closest(inputSelector));
      cursor.classList.toggle('is-scan', Boolean(target?.closest('.project-visual')));
      cursor.classList.toggle('is-arsenal', Boolean(target?.closest('.arsenal-grid article')));
    };

    const pointerMove = event => {
      state.x = event.clientX;
      state.y = event.clientY;
      if (!state.active) {
        state.ringX = state.previousX = state.x;
        state.ringY = state.previousY = state.y;
        state.active = true;
        cursor.classList.add('is-visible');
      }
      setMode(event.target);
    };

    const update = () => {
      const reduced = reducedMotion?.matches;
      let magneticX = 0;
      let magneticY = 0;
      const magneticTarget = state.target?.closest(magneticSelector);
      if (magneticTarget && !cursor.classList.contains('is-input')) {
        const rect = magneticTarget.getBoundingClientRect();
        magneticX = Math.max(-4, Math.min(4, (rect.left + rect.width / 2 - state.x) * .035));
        magneticY = Math.max(-4, Math.min(4, (rect.top + rect.height / 2 - state.y) * .035));
      }
      const follow = reduced ? 1 : .24;
      state.ringX += (state.x + magneticX - state.ringX) * follow;
      state.ringY += (state.y + magneticY - state.ringY) * follow;
      cursor.style.setProperty('--cursor-x', `${state.x}px`);
      cursor.style.setProperty('--cursor-y', `${state.y}px`);
      cursor.style.setProperty('--ring-x', `${state.ringX}px`);
      cursor.style.setProperty('--ring-y', `${state.ringY}px`);
      const deltaX = state.x - state.previousX;
      const deltaY = state.y - state.previousY;
      const distance = Math.min(1, Math.hypot(deltaX, deltaY) / 32);
      if (!reduced && !cursor.classList.contains('is-input') && distance > .02) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        trail.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotate(${angle}deg) scaleX(${.35 + distance * .65})`;
        trail.classList.remove('is-idle');
      } else trail.classList.add('is-idle');
      state.previousX = state.x;
      state.previousY = state.y;
      frame = window.requestAnimationFrame(update);
    };

    const burst = event => {
      if (reducedMotion?.matches || !state.active) return;
      cursor.classList.add('is-clicking');
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => cursor.classList.remove('is-clicking'), 150);
      const pulse = document.createElement('div');
      pulse.className = 'cyber-cursor__burst';
      pulse.style.left = `${event.clientX}px`;
      pulse.style.top = `${event.clientY}px`;
      pulse.innerHTML = '<i></i><i></i><i></i><i></i>';
      document.body.append(pulse);
      pulse.querySelectorAll('i').forEach((marker, index) => {
        const angle = index * 90;
        marker.animate([
          { transform: `rotate(${angle}deg) translateX(9px)`, opacity: 1 },
          { transform: `rotate(${angle}deg) translateX(28px)`, opacity: 0 }
        ], { duration: 420, easing: 'ease-out', fill: 'forwards' });
      });
      pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
    };

    window.addEventListener('pointermove', pointerMove, { passive: true });
    window.addEventListener('pointerdown', burst, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('pointerenter', () => { if (state.active) cursor.classList.add('is-visible'); });
    finePointer.addEventListener?.('change', event => {
      if (!event.matches) {
        window.cancelAnimationFrame(frame);
        cursor.remove();
        document.body.classList.remove('custom-cursor-enabled');
      }
    });
    frame = window.requestAnimationFrame(update);
  } catch {
    document.body.classList.remove('custom-cursor-enabled');
  }
})();
