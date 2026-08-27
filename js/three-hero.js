(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.three-hero');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero || !canvas || reduced || !window.THREE) { if (canvas) canvas.hidden = true; return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (_) { canvas.hidden = true; return; }

  const mobile = window.matchMedia('(max-width: 820px)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  const network = new THREE.Group();
  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  const clock = new THREE.Clock();
  const count = mobile ? 24 : 48;
  const positions = [];
  const colors = [];
  const cyan = new THREE.Color('#70d7d8');
  const violet = new THREE.Color('#9c8add');

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5));
  scene.add(network);
  network.position.set(mobile ? .55 : 1.35, .1, 0);

  for (let index = 0; index < count; index += 1) {
    const radius = 3.1;
    const x = (Math.random() * 1.1 - .08) * radius * 1.55;
    const y = (Math.random() - .5) * radius * 1.45;
    const z = (Math.random() - .5) * 2.6;
    positions.push(x, y, z);
    const color = index % 7 === 0 ? violet : cyan;
    colors.push(color.r, color.g, color.b);
  }

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  network.add(new THREE.Points(pointGeometry, new THREE.PointsMaterial({ size: mobile ? .027 : .035, vertexColors: true, transparent: true, opacity: .46, sizeAttenuation: true })));

  const linkPositions = [];
  for (let a = 0; a < count; a += 1) {
    for (let b = a + 1; b < count; b += 1) {
      const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
      if ((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2 < .9) linkPositions.push(ax, ay, az, bx, by, bz);
    }
  }
  const linkGeometry = new THREE.BufferGeometry();
  linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
  network.add(new THREE.LineSegments(linkGeometry, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: mobile ? .055 : .09 })));

  const globe = new THREE.Mesh(new THREE.IcosahedronGeometry(mobile ? 1.05 : 1.3, 2), new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: .065 }));
  globe.position.set(mobile ? .85 : 1.8, .05, -1.05);
  network.add(globe);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(mobile ? 1.45 : 1.8, .007, 4, 72, Math.PI * 1.25), new THREE.MeshBasicMaterial({ color: violet, transparent: true, opacity: .18 }));
  arc.rotation.set(.9, .4, -.55); arc.position.copy(globe.position); network.add(arc);
  const grid = new THREE.GridHelper(11, mobile ? 12 : 18, cyan, cyan);
  grid.material.transparent = true; grid.material.opacity = .045; grid.rotation.x = Math.PI * .47; grid.position.set(0, -2.4, -1.7); network.add(grid);

  function resize() {
    const width = hero.clientWidth, height = hero.clientHeight;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.position.z = mobile ? 7.4 : 6.6; camera.updateProjectionMatrix();
  }
  let frame = 0;
  function render() {
    const elapsed = clock.getElapsedTime();
    pointer.lerp(target, .035);
    network.rotation.y = elapsed * .025 + pointer.x * .05;
    network.rotation.x = pointer.y * .02;
    globe.rotation.y = elapsed * .055; arc.rotation.z = -.55 + elapsed * .025;
    renderer.render(scene, camera);
    frame = !document.hidden ? requestAnimationFrame(render) : 0;
  }
  const wake = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(render); };
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', event => { if (!mobile) target.set((event.clientX / innerWidth - .5), -(event.clientY / innerHeight - .5)); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); wake(); } });
  resize(); render();
  window.DrdHero3D = { setScroll(progress) { camera.position.y = progress * .32; network.position.z = -progress * .65; } };
})();
