(() => {
  const container = document.querySelector('.project-card.training .project-visual');
  const canvas = container?.querySelector('.vajra-x-canvas');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!container || !canvas || !window.THREE) { if (canvas) canvas.hidden = true; return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (_) {
    canvas.hidden = true;
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
  const tank = new THREE.Group();
  const turret = new THREE.Group();
  const base = new THREE.Group();
  const clock = new THREE.Clock();
  const cyan = new THREE.Color('#47dfff');
  const teal = new THREE.Color('#35c6c4');
  const rings = [];

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene.add(tank, base);
  tank.add(turret);

  const hologramMaterial = (opacity = .16) => new THREE.MeshBasicMaterial({ color: 0x08799f, transparent: true, opacity, depthWrite: false });
  const edgeMaterial = (color = cyan, opacity = .72) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const addEdges = (object, color = cyan, opacity = .72) => object.add(new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry), edgeMaterial(color, opacity)));
  const box = (width, height, depth, position, opacity = .16, color = cyan) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), hologramMaterial(opacity));
    mesh.position.set(...position);
    addEdges(mesh, color, .75);
    tank.add(mesh);
    return mesh;
  };
  const turretBox = (width, height, depth, position, opacity = .16) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), hologramMaterial(opacity));
    mesh.position.set(...position);
    addEdges(mesh, cyan, .78);
    turret.add(mesh);
    return mesh;
  };

  const hull = box(1.28, .28, 1.55, [0, -.04, 0], .17);
  const glacis = box(1.08, .16, .36, [0, .1, .72], .13, teal);
  glacis.rotation.x = -.22;
  const rearArmor = box(1.1, .18, .26, [0, .08, -.76], .12);
  [[-.7, 0, 0], [.7, 0, 0]].forEach(([x, y, z]) => {
    const track = new THREE.Mesh(new THREE.BoxGeometry(.28, .28, 1.68), hologramMaterial(.12));
    track.position.set(x, y - .11, z);
    addEdges(track, cyan, .7);
    tank.add(track);
    [-.56, -.19, .19, .56].forEach(depth => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.115, .115, .295, 12), new THREE.MeshBasicMaterial({ color: 0x27b6d3, transparent: true, opacity: .2, depthWrite: false }));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, -.21, depth);
      addEdges(wheel, teal, .58);
      tank.add(wheel);
    });
  });

  turret.position.set(0, .28, .02);
  const turretBody = turretBox(.72, .24, .62, [0, 0, .02], .2);
  turretBody.rotation.y = .08;
  const sensor = turretBox(.18, .13, .2, [.23, .18, .04], .18);
  const optic = turretBox(.16, .1, .14, [-.22, .17, .16], .15);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .24, 6), new THREE.MeshBasicMaterial({ color: 0xa2f7ff, transparent: true, opacity: .75 }));
  antenna.position.set(-.18, .31, -.08);
  turret.add(antenna);
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 1.15, 12), new THREE.MeshBasicMaterial({ color: 0x198eaf, transparent: true, opacity: .25, depthWrite: false }));
  gun.rotation.x = Math.PI / 2;
  gun.position.set(0, .03, .86);
  addEdges(gun, cyan, .82);
  turret.add(gun);
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .14, 10), hologramMaterial(.22));
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, .03, 1.47);
  addEdges(muzzle, teal, .86);
  turret.add(muzzle);

  [.88, .64, .42].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .008, 4, 48), new THREE.MeshBasicMaterial({ color: index === 1 ? teal : cyan, transparent: true, opacity: .34 - index * .06 }));
    ring.rotation.x = Math.PI / 2;
    ring.scale.y = .26;
    ring.position.y = -.55 + index * .017;
    base.add(ring);
    rings.push(ring);
  });
  const projection = new THREE.Mesh(new THREE.CylinderGeometry(.5, .76, .52, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x27cfe0, transparent: true, opacity: .045, side: THREE.DoubleSide, depthWrite: false }));
  projection.position.y = -.28;
  base.add(projection);
  const basePoint = new THREE.Mesh(new THREE.SphereGeometry(.04, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc3f9ff, transparent: true, opacity: .9 }));
  basePoint.position.y = -.52;
  base.add(basePoint);

  tank.rotation.set(-.08, -.42, 0);
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5));
    camera.position.set(2.35, 1.25, Math.max(4.4, 2.1 / (halfFov * camera.aspect * .92), 1.55 / (halfFov * .92)));
    camera.lookAt(0, -.05, .1);
    camera.updateProjectionMatrix();
  }

  let visible = true;
  let frame = 0;
  const render = () => {
    const elapsed = clock.getElapsedTime();
    tank.rotation.y = -.42 + elapsed * (Math.PI * 2 / 30);
    turret.rotation.y = Math.sin(elapsed * .35) * .16;
    rings.forEach((ring, index) => { ring.rotation.z += .0002 + index * .00007; });
    base.rotation.y = -elapsed * .055;
    basePoint.scale.setScalar(.84 + Math.sin(elapsed * 1.6) * .14);
    renderer.render(scene, camera);
    if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(render);
    else frame = 0;
  };
  const wake = () => { if (!reducedMotion && visible && !document.hidden && !frame) frame = requestAnimationFrame(render); };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; if (visible) wake(); }, { threshold: .05 });
    observer.observe(container);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { frame = 0; wake(); } });
  resize();
  render();
})();
