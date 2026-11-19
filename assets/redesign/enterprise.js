(() => {
  const canvas = document.querySelector('#network-core');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const scene = canvas.parentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0 };
  const view = { x: 0, y: 0 };
  const tau = Math.PI * 2;
  const levels = [
    { y: -103, radius: 165, tone: 0 },
    { y: -33, radius: 196, tone: 1 },
    { y: 37, radius: 196, tone: 0 },
    { y: 107, radius: 165, tone: 1 },
  ];
  const finish = [
    ['#bc7357', '#593b32', '#292b28', '#edb094'],
    ['#819287', '#394641', '#222c28', '#d1e0d4'],
  ];

  let width = 0;
  let height = 0;
  let ratio = 1;
  let inView = false;
  let frame = 0;
  let previous = 0;
  let angle = 0.47;
  let introduction = 2400;

  function polygon(points, fill, line) {
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.strokeStyle = line;
    context.lineWidth = .75;
    context.stroke();
  }

  function paint() {
    if (!width || !height) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const scale = Math.min(width, height) / 525;
    const yaw = angle + view.x * .48;
    const pitch = .47 + view.y * .24;
    const ox = width * .53;
    const oy = height * .51;

    function project([x, y, z]) {
      const tx = x * Math.cos(yaw) - z * Math.sin(yaw);
      const tz = x * Math.sin(yaw) + z * Math.cos(yaw);
      const ty = y * Math.cos(pitch) - tz * Math.sin(pitch);
      const depth = y * Math.sin(pitch) + tz * Math.cos(pitch);
      const perspective = 900 / (900 - depth);
      return [ox + tx * scale * perspective, oy + ty * scale * perspective, depth];
    }

    function vertex(radius, y, theta) {
      return project([radius * Math.cos(theta), y, radius * Math.sin(theta)]);
    }

    const faces = [];
    function face(vertices, color, edge) {
      const depth = vertices.reduce((sum, point) => sum + point[2], 0) / vertices.length;
      faces.push({ vertices, color, edge, depth });
    }

    function orbit(radius, y) {
      context.beginPath();
      for (let i = 0; i <= 96; i++) {
        const [x, vy] = vertex(radius, y, i * tau / 96);
        if (i === 0) context.moveTo(x, vy);
        else context.lineTo(x, vy);
      }
      context.strokeStyle = '#c4dac334';
      context.setLineDash([3, 6]);
      context.stroke();
      context.setLineDash([]);
    }

    orbit(224, 129);
    orbit(242, 129);

    for (const [index, level] of levels.entries()) {
      const { y, radius, tone } = level;
      const [top, outer, inner, edge] = finish[tone];
      for (let segment = 0; segment < 6; segment++) {
        const start = segment * tau / 6 + index * .13 + .035;
        const end = start + tau / 6 - .07;
        const upper = [
          vertex(radius, y - 12, start), vertex(radius, y - 12, end),
          vertex(radius * .63, y - 12, end), vertex(radius * .63, y - 12, start),
        ];
        const lower = [
          vertex(radius, y + 12, start), vertex(radius, y + 12, end),
          vertex(radius * .63, y + 12, end), vertex(radius * .63, y + 12, start),
        ];
        face(upper, top, edge);
        face(lower, inner, '#69736b');
        face([upper[0], upper[1], lower[1], lower[0]], outer, edge);
        face([upper[2], upper[3], lower[3], lower[2]], inner, edge);
        face([upper[0], upper[3], lower[3], lower[0]], outer, edge);
        face([upper[1], upper[2], lower[2], lower[1]], outer, edge);
      }
    }

    faces.sort((a, b) => a.depth - b.depth);
    for (const { vertices, color, edge } of faces) {
      polygon(vertices, color, edge);
    }
  }

  function animate(time) {
    frame = 0;
    if (!inView || motion.matches || document.hidden) return;
    const elapsed = previous ? Math.min(time - previous, 40) : 0;
    previous = time;
    const rotationTime = Math.min(elapsed, introduction);
    introduction -= rotationTime;
    angle += rotationTime * .00016;
    view.x += (pointer.x - view.x) * .045;
    view.y += (pointer.y - view.y) * .045;
    paint();
    if (introduction || Math.abs(pointer.x - view.x) + Math.abs(pointer.y - view.y) > .002) {
      frame = requestAnimationFrame(animate);
    }
  }

  function wake() {
    if (!frame && inView && !motion.matches && !document.hidden) {
      previous = 0;
      frame = requestAnimationFrame(animate);
    }
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (inView && !motion.matches && !document.hidden) {
      frame = requestAnimationFrame(animate);
    } else {
      view.x = 0;
      view.y = 0;
      paint();
    }
  }

  new ResizeObserver(([entry]) => {
    ({ width, height } = entry.contentRect);
    ratio = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    paint();
    if (width && height) scene.classList.add('core-ready');
  }).observe(scene);

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }).observe(scene);

  const stage = scene.closest('.hero-stage');
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || motion.matches) return;
    const bounds = stage.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width - .5;
    pointer.y = (event.clientY - bounds.top) / bounds.height - .5;
    wake();
  });
  stage.addEventListener('pointerleave', () => {
    pointer.x = 0;
    pointer.y = 0;
    wake();
  });
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();
