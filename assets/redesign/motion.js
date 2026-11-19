// Rebuild from the site root with npx esbuild@0.25.0 assets/redesign/motion.js --bundle --format=iife --target=es2020 --minify --legal-comments=eof --outfile=assets/redesign/motion.bundle.js
import * as THREE from './three.module.min.js';

const host = document.querySelector('#infrastructure-scene');
if (host) {
  try {
    buildInfrastructure(host);
  } catch (error) {
    console.warn('Visual 3D tidak tersedia.', error);
  }
}

function buildInfrastructure(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0d1514, .035);
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  camera.position.set(8, 7, 11);
  const target = new THREE.Vector3(0, 1.2, 0);
  const model = new THREE.Group();
  scene.add(model);
  scene.add(new THREE.HemisphereLight(0xe6f5f0, 0x24312b, 3));
  const light = new THREE.DirectionalLight(0xf2fbff, 6);
  light.position.set(2, 9, 4);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0x8cb6b5, 5);
  rim.position.set(-6, 4, -5);
  scene.add(rim);
  const copperLight = new THREE.PointLight(0xff8a48, 40, 15, 2);
  copperLight.position.set(3, 1, 2);
  scene.add(copperLight);

  // A small locally generated studio environment gives the metal broad reflections.
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x1b2925);
  const panels = [
    { color:0xe2f6eb, position:[0,6,0], rotation:[Math.PI/2,0,0], size:[12,6] },
    { color:0x6d9694, position:[-7,2,0], rotation:[0,Math.PI/2,0], size:[8,7] },
    { color:0xf2af7e, position:[5,2,4], rotation:[0,-Math.PI/3,0], size:[3,8] },
  ];
  for (const panel of panels) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...panel.size), new THREE.MeshBasicMaterial({ color:panel.color, side:THREE.DoubleSide }));
    mesh.position.set(...panel.position);
    mesh.rotation.set(...panel.rotation);
    room.add(mesh);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, .04);
  scene.environment = environment.texture;
  generator.dispose();
  room.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });

  const metal = new THREE.MeshStandardMaterial({ color:0x5a706b, metalness:.92, roughness:.25 });
  const dark = new THREE.MeshStandardMaterial({ color:0x182321, metalness:.7, roughness:.38 });
  const edge = new THREE.MeshStandardMaterial({ color:0xa5b9ac, metalness:.9, roughness:.24 });
  const copper = new THREE.MeshStandardMaterial({ color:0xe49b70, metalness:.86, roughness:.23 });
  const luminous = new THREE.MeshStandardMaterial({ color:0xffa273, emissive:0xff591d, emissiveIntensity:1.5, roughness:.3 });
  const status = new THREE.MeshBasicMaterial({ color:0xc9f1d7 });
  const nodes = [];

  const geometries = new Map();
  function box(width, height, depth, material, x, y, z, parent=model) {
    const key = [width, height, depth].join('/');
    if (!geometries.has(key)) {
      if (width > 1 && height > .1 && depth > 1) {
        const shape = new THREE.Shape();
        shape.moveTo(-width/2, -height/2);
        shape.lineTo(width/2, -height/2);
        shape.lineTo(width/2, height/2);
        shape.lineTo(-width/2, height/2);
        shape.closePath();
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: depth - .06, bevelEnabled:true, bevelThickness:.03,
          bevelSize:.025, bevelSegments:3, steps:1
        });
        geometry.translate(0,0,-depth/2+.03);
        geometries.set(key, geometry);
      } else {
        geometries.set(key, new THREE.BoxGeometry(width,height,depth));
      }
    }
    const mesh = new THREE.Mesh(geometries.get(key), material);
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }
  // Three stacks of blade servers sit on one connected backplane.
  const positions = [[-2.3,0,-.7],[0,0,-1.8],[2.3,0,.1]];
  for (const [index, position] of positions.entries()) {
    const node = new THREE.Group();
    node.position.set(...position);
    model.add(node);
    nodes.push(node);
    const height = [3.2,4.1,2.7][index];
    const layers = [8,10,7][index];
    box(1.7,.14,1.7,edge,0,.05,0,node);
    for (let i=0; i<layers; i++) {
      const y=.32+i*.37;
      box(1.45,.29,1.5,metal,0,y,0,node);
      box(1.32,.22,.035,dark,0,y,.77,node);
      box(.06,.21,.05,copper,-.66,y,.8,node);
      for (let j=0;j<6;j++) box(.12,.025,.035,edge,-.4+j*.13,y,.8,node);
      box(.035,.07,.04,status,.55,y,.81,node);
    }
    box(1.7,.12,1.7,edge,0,height,0,node);
    // Copper rails and cooling vents remain legible during the camera close-up.
    for (let vent = 0; vent < 8; vent++) {
      box(.07, .008, .9, dark, -.48 + vent * .135, height + .066, 0, node);
    }
    box(.055, height, .055, copper, .79, height / 2, .77, node);
    for (const x of [-.78,.78]) {
      box(.065,height,.065,dark,x,height/2,-.78,node);
    }
    const chip = box(.7,.06,.7,copper,0,height+.09,0,node);
    for (let pin=0;pin<8;pin++) {
      box(.035,.035,.12,edge,-.3+pin*.085,height+.09,.4,node);
      box(.035,.035,.12,edge,-.3+pin*.085,height+.09,-.4,node);
    }
    chip.rotation.y=Math.PI/2;
  }
  box(7.5,.12,5.8,dark,0,-.15,0);
  box(7.6,.04,5.9,edge,0,-.23,0);
  const securityBoundary = new THREE.Group();
  model.add(securityBoundary);
  const boundaryMaterial = new THREE.MeshStandardMaterial({
    color:0xbfe8ca, emissive:0x538364, emissiveIntensity:.7, metalness:.5, roughness:.3
  });
  const boundaryCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.8,.25,-3),new THREE.Vector3(3.8,.25,-3),
    new THREE.Vector3(3.8,.25,3),new THREE.Vector3(-3.8,.25,3)
  ],true,'catmullrom',.2);
  securityBoundary.add(new THREE.Mesh(new THREE.TubeGeometry(boundaryCurve,96,.035,6,true),boundaryMaterial));
  securityBoundary.visible=false;
  const packets = [];
  function cable(points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius, 8, false), material);
    model.add(mesh);
    return curve;
  }
  for (let i=0;i<8;i++) {
    const offset=i*.115;
    const curve=cable([[-2.8+offset,.05,.3],[-2.8+offset,.1,1.7],[-1.6+offset,.12,2.15],[.8+offset,.14,2.15],[2.05+offset,.12,1.5],[2.05+offset,.05,.9]],.032,i%3===0?luminous:copper);
    const packet=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),status);
    model.add(packet);
    packets.push({ mesh:packet,curve,offset:i/8 });
  }
  for (let i=0;i<4;i++) {
    const offset=i*.13;
    cable([[-2.7+offset,.12,-1.4],[-2.7+offset,.16,-2.5],[-1.2+offset,.15,-2.8],[-.4+offset,.15,-2.6],[-.4+offset,.15,-2.1]],.028,copper);
    cable([[.1+offset,.15,-1],[.1+offset,.15,.2],[.8+offset,.15,.7],[1.8+offset,.15,.7]],.025,copper);
  }
  // Etched paths make the backplane read as a physical circuit.
  for (let i=0;i<12;i++) {
    box(.012,.006,1.8,copper,-3.4+i*.12,-.082,-1.7);
    box(1.4,.006,.012,metal,-2.8,-.08,-2.6+i*.09);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x0d1514,roughness:.6,metalness:.25}));
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.29;
  scene.add(floor);
  const shadow = document.createElement('canvas');
  shadow.width=shadow.height=128;
  const ctx=shadow.getContext('2d');
  const gradient=ctx.createRadialGradient(64,64,2,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.9)');
  gradient.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadow);
  const contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(11,8),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
  contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=-.28;scene.add(contactShadow);

  const hero = host.closest('.motion-hero');
  const stage = hero.querySelector('.hero-stage');
  const content = hero.querySelector('.hero-content');
  const caption = hero.querySelector('.journey-caption');
  const pause = hero.querySelector('#pause-scene');
  const buttons = [...hero.querySelectorAll('[data-scene]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tallViewport = matchMedia('(min-height: 760px)');
  const chapters = {
    network: {
      topic: 'Konektivitas',
      title: 'Dari setiap kantor,<br>ke satu sistem.',
      description: 'Jaringan menghubungkan tim dengan aplikasi yang mereka gunakan.',
      control: 'Konektivitas antar kantor dan sistem.'
    },
    cloud: {
      topic: 'Aplikasi & cloud',
      title: 'Tempat pekerjaan<br>Anda berjalan.',
      description: 'Aplikasi dan infrastruktur cloud menyatukan data dan alur kerja.',
      control: 'Lingkungan aplikasi, deployment, dan monitoring.'
    },
    security: {
      topic: 'Keamanan',
      title: 'Akses yang terarah.<br>Sistem yang terpantau.',
      description: 'Kontrol akses, penilaian risiko, dan pencatatan mendukung perlindungan sistem.',
      control: 'Evaluasi risiko, kontrol akses, dan proteksi sistem.'
    }
  };
  let visible = false;
  let paused = false;
  let frame = 0;
  let previous = 0;
  let lastDrawTime = 0;
  let elapsed = 0;
  let introduction = 0;
  let selected = 'network';
  let scrollProgress = 0;
  let smoothProgress = 0;
  let storyEnabled = false;
  let manualScene = false;
  let disposed = false;
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  function setChapter(chapter) {
    if (selected === chapter && caption.dataset.chapter) return;
    selected = chapter;
    const copy = chapters[chapter];
    caption.dataset.chapter = chapter;
    caption.querySelector('.journey-topic').textContent = copy.topic;
    caption.querySelector('.journey-title').innerHTML = copy.title;
    caption.querySelector('.journey-description').textContent = copy.description;
    hero.querySelector('.scene-description').textContent = copy.control;
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.scene === chapter));
    }
    for (const item of caption.querySelectorAll('[data-chapter]')) {
      item.classList.toggle('chapter-active', item.dataset.chapter === chapter);
    }
  }

  function readScroll() {
    if (!storyEnabled || paused) return;
    const bounds = hero.getBoundingClientRect();
    const distance = Math.max(hero.offsetHeight - stage.offsetHeight, 1);
    const nextProgress = THREE.MathUtils.clamp((84 - bounds.top) / distance, 0, 1);
    if (Math.abs(nextProgress - scrollProgress) > .002) manualScene = false;
    scrollProgress = nextProgress;
  }

  function draw(time) {
    frame = 0;
    if (disposed) return;
    if (!paused && !reduced.matches && time - lastDrawTime < 1000 / 30) {
      frame = requestAnimationFrame(draw);
      return;
    }
    lastDrawTime = time;
    const delta = previous ? Math.min((time - previous) / 1000, .05) : 0;
    previous = time;
    const moving = !paused && !reduced.matches;
    const blend = moving ? 1 - Math.exp(-delta * 7) : 1;

    if (moving) {
      elapsed += delta;
      introduction = Math.min(1, introduction + delta / 1.7);
      smoothProgress += (scrollProgress - smoothProgress) * blend;
      smooth.x += (pointer.x - smooth.x) * blend;
      smooth.y += (pointer.y - smooth.y) * blend;
    } else {
      introduction = 1;
      smooth.x = smooth.y = 0;
    }

    const progress = storyEnabled ? smoothProgress : 0;
    const entrance = 1 - Math.pow(1 - introduction, 3);
    const mobile = innerWidth < 700;
    const reveal = THREE.MathUtils.smoothstep(progress, .04, .28);
    content.style.setProperty('--hero-opacity', String(1 - reveal));
    content.style.setProperty('--hero-offset', (-reveal * 45) + 'px');
    // Hide the offscreen call-to-action from keyboard navigation during the story.
    content.inert = reveal > .98;
    caption.style.setProperty('--journey-opacity', String(reveal));
    caption.style.setProperty('--journey-offset', ((1 - reveal) * 28) + 'px');

    if (progress > .12 && moving && !manualScene) {
      setChapter(progress < .42 ? 'network' : progress < .73 ? 'cloud' : 'security');
    }

    camera.position.set(
      (mobile ? 9 : 9.5) - progress * 3 + smooth.x * .8,
      6.9 - progress * 2 + (1 - entrance) * .6 + smooth.y * .5,
      11.5 - progress * 2.8
    );
    target.set(mobile ? -.1 : -1.8 + progress * .55, 1.3 + progress * .25, 0);
    camera.lookAt(target);
    model.rotation.y = -.32 + progress * .42 + smooth.x * .035;
    model.scale.setScalar(.94 + entrance * .06);

    for (const [index, node] of nodes.entries()) {
      const lift = selected === 'cloud' && index === 1 ? .65 : 0;
      const assembly = Math.max(0, 1 - introduction * 1.4 + index * .14);
      const destination = lift + (moving ? assembly * 1.7 : 0);
      node.position.y += (destination - node.position.y) * blend;
    }
    for (const packet of packets) {
      packet.mesh.position.copy(packet.curve.getPointAt((elapsed * .1 + packet.offset) % 1));
    }
    luminous.emissiveIntensity = 1.15 + Math.sin(elapsed * 1.4) * .15;
    copperLight.intensity = selected === 'security' ? 65 : 40;
    securityBoundary.visible = selected === 'security';

    renderer.render(scene, camera);
    host.classList.add('scene-ready');
    if (visible && !document.hidden && moving) frame = requestAnimationFrame(draw);
  }

  function update() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!disposed && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function configureStory() {
    storyEnabled = tallViewport.matches && !reduced.matches;
    hero.classList.toggle('story-enhanced', storyEnabled);
    if (!storyEnabled) {
      scrollProgress = smoothProgress = 0;
      content.inert = false;
      content.style.removeProperty('--hero-opacity');
      content.style.removeProperty('--hero-offset');
      caption.style.removeProperty('--journey-opacity');
    }
    readScroll();
    update();
  }

  const resize = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = innerWidth < 700 ? 44 : 36;
    camera.updateProjectionMatrix();
    readScroll();
    update();
  });
  resize.observe(host);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) {
      // Finish the opening offscreen, so returning to the hero is immediate.
      introduction = 1;
    }
    update();
  }).observe(host);
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reduced.matches || paused) return;
    const bounds = host.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width - .5;
    pointer.y = (event.clientY - bounds.top) / bounds.height - .5;
  });
  hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  addEventListener('scroll', readScroll, { passive: true });
  for (const button of buttons) {
    button.addEventListener('click', () => {
      manualScene = true;
      setChapter(button.dataset.scene);
      if (reduced.matches || paused) {
        nodes[1].position.y = selected === 'cloud' ? .65 : 0;
      }
      update();
    });
  }
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Putar animasi' : 'Jeda animasi';
    readScroll();
    update();
  });
  reduced.addEventListener('change', configureStory);
  document.addEventListener('motion-preference-change', configureStory);
  tallViewport.addEventListener('change', configureStory);
  document.addEventListener('visibilitychange', update);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    host.classList.remove('scene-ready');
    hero.classList.remove('story-enhanced');
    content.inert = false;
    content.style.removeProperty('--hero-opacity');
    content.style.removeProperty('--hero-offset');
    caption.style.removeProperty('--journey-opacity');
  });
  renderer.domElement.addEventListener('webglcontextrestored', configureStory);
  addEventListener('pagehide', event => {
    if (frame) cancelAnimationFrame(frame);
    if (!event.persisted) {
      disposed = true;
      resize.disconnect();
      scene.traverse(object => {
        object.geometry?.dispose();
        if (object.material) object.material.dispose();
      });
      environment.dispose();
      shadowTexture.dispose();
      renderer.dispose();
    }
  });
  addEventListener('pageshow', event => { if (event.persisted) update(); });
  setChapter('network');
  hero.querySelector('.scene-options').hidden = false;
  configureStory();
}
