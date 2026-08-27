(() => {
  const container = document.querySelector('.project-card.lyra .project-visual');
  const canvas = container?.querySelector('.lyra-core-canvas');
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
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 20);
  const system = new THREE.Group();
  const neural = new THREE.Group();
  const shell = new THREE.Group();
  const base = new THREE.Group();
  const clock = new THREE.Clock();
  const cyan = new THREE.Color('#49ddff');
  const violet = new THREE.Color('#9a8dff');
  const nodeCoords = [[45, 15], [20, 62], [-8, 24], [-35, 72], [10, -38], [42, -55], [-25, -48], [0, 108]];
  const rings = [];

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene.add(system, base);
  system.add(neural, shell);

  const vector = (latitude, longitude, radius) => {
    const phi = (90 - latitude) * Math.PI / 180;
    const theta = (longitude + 180) * Math.PI / 180;
    return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
  };
  const line = (points, color, opacity) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  };

  const core = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0xb9f7ff, transparent: true, opacity: .92 }));
  const coreAura = new THREE.Mesh(new THREE.SphereGeometry(.31, 16, 12), new THREE.MeshBasicMaterial({ color: 0x278fe8, transparent: true, opacity: .18, side: THREE.BackSide, depthWrite: false }));
  neural.add(core, coreAura);
  neural.add(new THREE.Mesh(new THREE.SphereGeometry(.55, 16, 12), new THREE.MeshBasicMaterial({ color: 0x0b6ca1, transparent: true, opacity: .09, depthWrite: false })));

  for (let latitude = -45; latitude <= 45; latitude += 30) {
    const points = [];
    for (let longitude = -180; longitude <= 180; longitude += 12) points.push(vector(latitude, longitude, .57));
    neural.add(line(points, cyan, .2));
  }
  for (let longitude = -120; longitude <= 120; longitude += 60) {
    const points = [];
    for (let latitude = -90; latitude <= 90; latitude += 8) points.push(vector(latitude, longitude, .57));
    neural.add(line(points, cyan, .16));
  }

  const positions = [];
  nodeCoords.forEach(([latitude, longitude]) => {
    const point = vector(latitude, longitude, .61);
    positions.push(point.x, point.y, point.z);
  });
  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const nodes = new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: cyan, size: .048, transparent: true, opacity: .9, sizeAttenuation: true, depthWrite: false }));
  neural.add(nodes);
  [[0, 1], [1, 2], [2, 4], [4, 6], [0, 5], [3, 7]].forEach(([from, to], index) => {
    const start = new THREE.Vector3(positions[from * 3], positions[from * 3 + 1], positions[from * 3 + 2]);
    const end = new THREE.Vector3(positions[to * 3], positions[to * 3 + 1], positions[to * 3 + 2]);
    neural.add(line([start, end], index % 3 ? cyan : violet, .34));
  });

  shell.add(new THREE.Mesh(new THREE.SphereGeometry(.76, 18, 14), new THREE.MeshBasicMaterial({ color: 0x30d9f1, transparent: true, opacity: .045, side: THREE.BackSide, depthWrite: false })));
  shell.add(new THREE.Mesh(new THREE.SphereGeometry(.78, 18, 14), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.FrontSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader: 'varying vec3 n; varying vec3 v; void main(){float rim=pow(1.0-max(dot(normalize(n),normalize(v)),0.0),2.5);gl_FragColor=vec4(0.18,0.86,1.0,rim*.26);}'
  })));

  [[.84, .45, .24, cyan], [.91, -.55, -.3, violet], [.97, .82, .1, cyan]].forEach(([radius, x, z, color]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .008, 4, 56), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .42 }));
    ring.rotation.set(x, 0, z);
    system.add(ring);
    rings.push(ring);
  });

  [.72, .5, .3].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .008, 4, 48), new THREE.MeshBasicMaterial({ color: index === 1 ? violet : cyan, transparent: true, opacity: .34 - index * .06 }));
    ring.rotation.x = Math.PI / 2;
    ring.scale.y = .28;
    ring.position.y = -.88 + index * .018;
    base.add(ring);
  });
  const projection = new THREE.Mesh(new THREE.CylinderGeometry(.38, .62, .62, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x2cc8e5, transparent: true, opacity: .055, side: THREE.DoubleSide, depthWrite: false }));
  projection.position.y = -.55;
  base.add(projection);
  const emitter = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), new THREE.MeshBasicMaterial({ color: 0xd0f8ff, transparent: true, opacity: .95 }));
  emitter.position.y = -.84;
  base.add(emitter);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5));
    camera.position.set(0, .02, Math.max(3.3, 1.12 / (halfFov * camera.aspect * .92), 1.25 / (halfFov * .92)));
    camera.updateProjectionMatrix();
  }

  let visible = !('IntersectionObserver' in window);
  let frame = 0;
  const render = () => {
    const elapsed = clock.getElapsedTime();
    neural.rotation.y = elapsed * (Math.PI * 2 / 30);
    shell.rotation.y = elapsed * (Math.PI * 2 / 40);
    rings.forEach((ring, index) => { ring.rotation.z += .00025 + index * .00008; });
    base.rotation.y = -elapsed * .065;
    const pulse = .94 + Math.sin(elapsed * 2.1) * .06;
    core.scale.setScalar(pulse);
    coreAura.scale.setScalar(1 + Math.sin(elapsed * 2.1) * .09);
    nodes.material.opacity = .72 + Math.sin(elapsed * 1.2) * .12;
    emitter.scale.setScalar(.82 + Math.sin(elapsed * 2.1) * .14);
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
  if (reducedMotion) render();
  else wake();
})();
