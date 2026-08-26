(() => {
  const container = document.querySelector('.project-card.command .project-visual');
  const canvas = container?.querySelector('.guardian-suit-canvas');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!container || !canvas || !window.THREE) { if (canvas) canvas.hidden = true; return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch (_) { canvas.hidden = true; return; }
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .1, 30), suit = new THREE.Group(), base = new THREE.Group(), clock = new THREE.Clock();
  const cyan = new THREE.Color('#53e3ff'), teal = new THREE.Color('#35c7c9'), rings = [];
  renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; scene.add(suit, base);
  const material = opacity => new THREE.MeshBasicMaterial({ color: 0x08799f, transparent: true, opacity, depthWrite: false });
  const edge = (object, color = cyan, opacity = .72) => object.add(new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity })));
  const part = (parent, width, height, depth, x, y, z, opacity = .17, color = cyan) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(opacity)); mesh.position.set(x, y, z); edge(mesh, color); parent.add(mesh); return mesh; };
  const joint = (x, y, z, radius = .09) => { const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), new THREE.MeshBasicMaterial({ color: 0x28bcd7, transparent: true, opacity: .28, depthWrite: false })); mesh.position.set(x, y, z); edge(mesh, teal, .55); suit.add(mesh); };
  const chest = part(suit, .68, .43, .3, 0, .45, 0, .2); part(suit, .48, .15, .25, 0, .14, 0, .15, teal); part(suit, .62, .12, .29, 0, -.04, 0, .13); part(suit, .5, .16, .25, 0, -.21, 0, .16);
  const helmet = part(suit, .34, .32, .3, 0, 1.02, 0, .19); part(suit, .26, .08, .025, 0, 1.02, .164, .72, cyan); part(suit, .2, .07, .04, 0, .8, .02, .15);
  [-1, 1].forEach(side => {
    part(suit, .28, .16, .34, side * .48, .61, 0, .2); part(suit, .18, .34, .18, side * .57, .39, 0, .15); joint(side * .57, .18, 0); part(suit, .2, .31, .2, side * .59, .0, .02, .17); part(suit, .15, .13, .17, side * .59, -.23, .04, .16);
    part(suit, .24, .18, .25, side * .25, -.34, 0, .17); part(suit, .22, .37, .23, side * .25, -.6, 0, .18); joint(side * .25, -.84, 0, .085); part(suit, .2, .38, .22, side * .25, -1.07, .01, .17); part(suit, .25, .13, .4, side * .25, -1.34, .09, .17);
  });
  chest.rotation.y = .06;
  [.67, .47, .29].forEach((radius, index) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .008, 4, 44), new THREE.MeshBasicMaterial({ color: index === 1 ? teal : cyan, transparent: true, opacity: .34 - index * .07 })); ring.rotation.x = Math.PI / 2; ring.scale.y = .27; ring.position.y = -1.52 + index * .018; base.add(ring); rings.push(ring); });
  const projection = new THREE.Mesh(new THREE.CylinderGeometry(.38, .56, 1.0, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0x2cc8e5, transparent: true, opacity: .045, side: THREE.DoubleSide, depthWrite: false })); projection.position.y = -.99; base.add(projection);
  const emitter = new THREE.Mesh(new THREE.SphereGeometry(.042, 10, 8), new THREE.MeshBasicMaterial({ color: 0xd1faff, transparent: true, opacity: .92 })); emitter.position.y = -1.49; base.add(emitter);
  suit.rotation.set(-.03, -.35, 0);
  function resize() { const width = container.clientWidth, height = container.clientHeight; if (!width || !height) return; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setSize(width, height, false); camera.aspect = width / height; const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); camera.position.set(1.75, .45, Math.max(5.05, 1.55 / (half * camera.aspect * .92), 1.75 / (half * .92))); camera.lookAt(0, -.2, 0); camera.updateProjectionMatrix(); }
  let visible = true, frame = 0;
  const render = () => { const t = clock.getElapsedTime(); suit.rotation.y = -.35 + t * (Math.PI * 2 / 25); suit.position.y = Math.sin(t * .8) * .025; base.rotation.y = -t * .055; rings.forEach((ring, index) => { ring.rotation.z += .0002 + index * .00007; }); emitter.scale.setScalar(.84 + Math.sin(t * 1.6) * .12); renderer.render(scene, camera); if (!reduced && visible && !document.hidden) frame = requestAnimationFrame(render); else frame = 0; };
  const wake = () => { if (!reduced && visible && !document.hidden && !frame) frame = requestAnimationFrame(render); };
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; if (visible) wake(); }, { threshold: .05 }); observer.observe(container); }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container); window.addEventListener('resize', resize, { passive: true }); document.addEventListener('visibilitychange', () => { if (!document.hidden) { frame = 0; wake(); } }); resize(); render();
})();
