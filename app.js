/* ═══════════════════════════════════════════════════
   N. MITHUN — 3D PORTFOLIO  |  app.js  v8
   Reliable Button Clicks + Sleek Modern Cursor + 3D Gemini Stars
═══════════════════════════════════════════════════ */

'use strict';

// Detect touch / mobile viewport
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


/* ═══════════════════════════════════════════════════
   1. LENIS — ULTRA-SMOOTH SCROLL ENGINE & CLICK HANDLERS
═══════════════════════════════════════════════════ */
let lenisInstance = null;

function performSmoothScroll(targetSelector) {
  const targetElement = document.querySelector(targetSelector);
  if (!targetElement) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(targetElement, {
      offset: -50,
      duration: 1.4,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
  } else {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

(function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.8,
      infinite: false,
    });

    lenisInstance.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Bind smooth click scrolling to all anchor links
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    performSmoothScroll(href);
  });
})();


/* ═══════════════════════════════════════════════════
   2. THREE.JS — 3D GEMINI STARS ENGINE
═══════════════════════════════════════════════════ */
let isCursorNearStarGlobal = false;

(function initGeminiStarScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.2);

  // Ambient & Dynamic Point Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);

  // Cursor Following 3D Point Light
  const cursorPointLight = new THREE.PointLight(0x38bdf8, 3.0, 14);
  cursorPointLight.position.set(0, 0, 2);
  scene.add(cursorPointLight);

  const secondaryPointLight = new THREE.PointLight(0x9333ea, 2.2, 16);
  secondaryPointLight.position.set(-3, -3, 2);
  scene.add(secondaryPointLight);

  /* ── 2a. Background Twinkling Stardust Field Spanning Full Scroll ── */
  const STAR_COUNT = isTouchDevice ? 1200 : 3500;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starColors = new Float32Array(STAR_COUNT * 3);
  const starScales = new Float32Array(STAR_COUNT);

  const cosmicPalette = [
    new THREE.Color('#ffffff'), // Pure White Star
    new THREE.Color('#a78bfa'), // Light Purple
    new THREE.Color('#38bdf8'), // Cyan Sky
    new THREE.Color('#818cf8'), // Indigo
    new THREE.Color('#f472b6'), // Pink
    new THREE.Color('#fbbf24'), // Warm Gold
  ];

  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 1.0 + Math.random() * 8.5;
    const theta = Math.random() * Math.PI * 2;

    starPositions[i * 3]     = r * Math.sin(theta) * (Math.random() > 0.5 ? 1 : -1);
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 34.0;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 6.0 - 1.2;

    const col = cosmicPalette[Math.floor(Math.random() * cosmicPalette.length)];
    starColors[i * 3]     = col.r;
    starColors[i * 3 + 1] = col.g;
    starColors[i * 3 + 2] = col.b;

    starScales[i] = Math.random() * 2.2 + 0.5;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  starGeo.setAttribute('scale', new THREE.BufferAttribute(starScales, 1));

  const starMat = new THREE.PointsMaterial({
    size: 0.024,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });

  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  /* ── 2b. Mathematical Gemini 4-Point Curved Star Geometry ── */
  function createGeminiStarShape(size = 1) {
    const shape = new THREE.Shape();
    const pinch = size * 0.14; // Astroid inward curved pinch point

    // Top (0, size) -> Right (size, 0) -> Bottom (0, -size) -> Left (-size, 0)
    shape.moveTo(0, size);
    shape.quadraticCurveTo(pinch, pinch, size, 0);
    shape.quadraticCurveTo(pinch, -pinch, 0, -size);
    shape.quadraticCurveTo(-pinch, -pinch, -size, 0);
    shape.quadraticCurveTo(-pinch, pinch, 0, size);

    return shape;
  }

  const extrudeSettings = {
    steps: 1,
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 4,
  };

  const geminiStars = [];

  function addGemini3DStar(size, colorHex, emissiveHex, x, y, z, rotSpeed) {
    const shape = createGeminiStarShape(size);
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: emissiveHex,
      emissiveIntensity: 0.6,
      metalness: 0.35,
      roughness: 0.18,
      transparent: true,
      opacity: 0.95,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    const starObj = {
      mesh,
      material,
      baseScale: 1.0,
      currentScale: 1.0,
      targetScale: 1.0,
      baseEmissive: 0.6,
      targetEmissive: 0.6,
      rotSpeed: { ...rotSpeed },
      currentRotSpeed: { ...rotSpeed },
      baseY: y,
      baseX: x,
      baseZ: z,
      offsetX: 0,
      offsetY: 0,
      phase: Math.random() * Math.PI * 2,
      proximity: 0,
    };

    geminiStars.push(starObj);
    return starObj;
  }

  // ── SPAWN 3D GEMINI STARS ACCROSS ALL PAGE SECTIONS ──
  // 1. Hero Section (Y = 1.5 to -2.5)
  addGemini3DStar(0.82, 0x4f46e5, 0x7c3aed, -2.5,  1.2, -1.0, { x: 0.25, y: 0.35, z: 0.15 }); // Top Left Indigo
  addGemini3DStar(0.72, 0x0284c7, 0x00d2ff,  2.6, -0.6, -0.9, { x: -0.3, y: 0.28, z: -0.2 }); // Mid Right Cyan
  addGemini3DStar(0.55, 0x9333ea, 0xec4899,  0.5,  2.1, -1.8, { x: 0.2,  y: 0.4,  z: 0.1 });  // Top Center Violet

  // 2. About Section (Y = -3.5 to -7.5)
  addGemini3DStar(0.68, 0x7c3aed, 0xa78bfa, -2.4, -4.5, -1.2, { x: 0.3, y: 0.2, z: 0.1 });   // About Left
  addGemini3DStar(0.64, 0x059669, 0x34d399,  2.5, -6.8, -1.1, { x: -0.25, y: 0.35, z: 0.2 }); // About Right

  // 3. Work Section (Y = -8.5 to -13.5)
  addGemini3DStar(0.75, 0x0284c7, 0x38bdf8, -2.5, -9.5, -1.0, { x: 0.3, y: -0.25, z: 0.15 }); // Work Left
  addGemini3DStar(0.70, 0xd97706, 0xfbbf24,  2.6, -12.2, -1.2, { x: -0.28, y: 0.3, z: 0.2 }); // Work Right

  // 4. EXPERTISE & WORKFLOW (SKILLS) SECTION (Y = -14.5 to -20.0) -> HIGHLY VISIBLE!
  addGemini3DStar(0.85, 0x00d2ff, 0x38bdf8, -1.9, -15.0, -0.8, { x: 0.35, y: 0.4, z: 0.2 });  // Skills Top Left (Cyan Gemini Star)
  addGemini3DStar(0.80, 0x9333ea, 0xec4899,  2.1, -16.2, -0.9, { x: -0.3, y: 0.35, z: -0.2 }); // Skills Workflow Right (Violet Star)
  addGemini3DStar(0.88, 0x4f46e5, 0x7c3aed, -0.4, -17.5, -1.1, { x: 0.28, y: -0.3, z: 0.18 }); // Skills Center Gap (Large Indigo Star)
  addGemini3DStar(0.78, 0x059669, 0x34d399, -2.2, -18.6, -0.9, { x: 0.3, y: 0.25, z: -0.15 }); // Skills Tech Grid Left (Emerald Star)
  addGemini3DStar(0.72, 0xfbbf24, 0xf59e0b,  2.0, -19.8, -1.0, { x: -0.25, y: 0.3, z: 0.15 }); // Skills Bottom Right (Amber Star)

  // 5. STARTUP & CLIENT WORK SECTION (Y = -20.5 to -28.0) -> HIGHLY VISIBLE!
  addGemini3DStar(0.90, 0xa3e635, 0xbef264, -2.3, -21.0, -0.7, { x: 0.35, y: 0.4, z: 0.2 });   // Startup Intro Left (Lime Gemini Star)
  addGemini3DStar(0.82, 0x4f46e5, 0x7c3aed,  2.4, -22.2, -0.9, { x: -0.3, y: 0.35, z: -0.18 }); // Startup Intro Right (Indigo Star)
  addGemini3DStar(0.75, 0x059669, 0x34d399, -1.8, -23.5, -1.0, { x: 0.28, y: -0.3, z: 0.15 });  // Featured Project Left (Emerald Star)
  addGemini3DStar(0.88, 0xa3e635, 0x84cc16,  0.3, -24.8, -0.8, { x: 0.32, y: 0.28, z: -0.2 });  // Gallery Center (Large Lime Star)
  addGemini3DStar(0.70, 0x0284c7, 0x38bdf8,  2.5, -25.5, -1.1, { x: -0.25, y: 0.35, z: 0.18 }); // Gallery Right (Cyan Star)
  addGemini3DStar(0.78, 0x9333ea, 0xec4899, -2.0, -26.5, -0.9, { x: 0.3, y: 0.25, z: -0.15 });  // Services Left (Violet Star)
  addGemini3DStar(0.85, 0xa3e635, 0xbef264,  1.8, -27.5, -0.8, { x: -0.28, y: 0.4, z: 0.2 });   // Process Right (Lime Star)
  addGemini3DStar(0.72, 0xfbbf24, 0xf59e0b, -0.5, -28.5, -1.0, { x: 0.25, y: -0.3, z: 0.12 });  // CTA Center (Amber Star)

  // 6. Contact Section (Y = -29.0 to -33.0)
  addGemini3DStar(0.80, 0xec4899, 0xf472b6, -2.2, -30.0, -1.1, { x: 0.25, y: 0.3, z: 0.2 });   // Contact Left
  addGemini3DStar(0.82, 0x4f46e5, 0x6366f1,  2.5, -32.0, -1.0, { x: -0.35, y: 0.25, z: -0.15 });// Contact Right

  /* ── 2c. Mouse & Scroll Tracking ── */
  const mouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let currentScrollY = 0;
  window.addEventListener('scroll', () => {
    currentScrollY = window.scrollY || window.pageYOffset;
  }, { passive: true });

  /* ── 2d. Proximity Particle Spark Burst on Hover/Click ── */
  function spawnStarStardustBurst(x, y, colorHex) {
    const burstCount = 14;
    for (let i = 0; i < burstCount; i++) {
      const spark = document.createElement('div');
      spark.className = 'cursor-spark';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.background = `#${colorHex.toString(16).padStart(6, '0')}`;
      spark.style.boxShadow = `0 0 12px #${colorHex.toString(16).padStart(6, '0')}`;
      document.body.appendChild(spark);

      const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 35 + Math.random() * 55;

      gsap.to(spark, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => spark.remove(),
      });
    }
  }

  window.addEventListener('click', (e) => {
    geminiStars.forEach((star) => {
      if (star.proximity > 0.35) {
        gsap.to(star.mesh.rotation, {
          z: star.mesh.rotation.z + Math.PI * 2,
          duration: 1.0,
          ease: 'back.out(2)',
        });
        spawnStarStardustBurst(e.clientX, e.clientY, star.material.emissive.getHex());
      }
    });
  });

  /* ── 2e. Render & Physics Loop with Cursor Proximity Detection ── */
  const clock = new THREE.Clock();
  const tempProjectedPos = new THREE.Vector3();

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    const t = clock.getElapsedTime();

    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.05;
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.05;

    cursorPointLight.position.x = camera.position.x + smoothMouse.x * 4.2;
    cursorPointLight.position.y = camera.position.y + smoothMouse.y * 3.0;

    starField.rotation.y = t * 0.012 + smoothMouse.x * 0.06;
    starField.rotation.x = t * 0.006 + smoothMouse.y * 0.04;

    const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(1, Math.max(0, currentScrollY / (maxScrollY || 1)));
    camera.position.y = -scrollProgress * 34.0;
    camera.position.x = smoothMouse.x * 0.15;

    let anyStarClose = false;

    geminiStars.forEach((star) => {
      star.mesh.getWorldPosition(tempProjectedPos);
      tempProjectedPos.project(camera);

      const dx = mouse.x - tempProjectedPos.x;
      const dy = mouse.y - tempProjectedPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const PROXIMITY_RADIUS = 0.55;
      let proximity = 0;

      if (dist < PROXIMITY_RADIUS) {
        proximity = 1 - dist / PROXIMITY_RADIUS;
        proximity = proximity * proximity * (3 - 2 * proximity);
        anyStarClose = true;
      }

      star.proximity = proximity;

      star.targetScale = star.baseScale + proximity * 0.7;
      star.targetEmissive = star.baseEmissive + proximity * 2.0;

      const pushStrength = proximity * 0.38;
      if (dist > 0.01) {
        star.offsetX += (-dx / dist * pushStrength - star.offsetX) * 0.08;
        star.offsetY += (-dy / dist * pushStrength - star.offsetY) * 0.08;
      } else {
        star.offsetX += (0 - star.offsetX) * 0.08;
        star.offsetY += (0 - star.offsetY) * 0.08;
      }

      const speedBoost = 1.0 + proximity * 3.0;
      star.currentRotSpeed.x = star.rotSpeed.x * speedBoost;
      star.currentRotSpeed.y = star.rotSpeed.y * speedBoost;
      star.currentRotSpeed.z = star.rotSpeed.z * speedBoost;

      star.currentScale += (star.targetScale - star.currentScale) * 0.1;
      star.mesh.scale.set(star.currentScale, star.currentScale, star.currentScale);

      star.material.emissiveIntensity += (star.targetEmissive - star.material.emissiveIntensity) * 0.12;

      star.mesh.rotation.x += star.currentRotSpeed.x * 0.016;
      star.mesh.rotation.y += star.currentRotSpeed.y * 0.016;
      star.mesh.rotation.z += star.currentRotSpeed.z * 0.016;

      star.mesh.position.y = star.baseY + Math.sin(t * 1.1 + star.phase) * 0.14 + star.offsetY;
      star.mesh.position.x = star.baseX + Math.cos(t * 0.85 + star.phase) * 0.1 + star.offsetX;
    });

    isCursorNearStarGlobal = anyStarClose;

    renderer.render(scene, camera);
  }
  renderLoop();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();


/* ═══════════════════════════════════════════════════
   3. SLEEK MODERN MINIMALIST CURSOR ENGINE
═══════════════════════════════════════════════════ */
(function initLuxuryCursor() {
  if (isTouchDevice) return;

  const cursorWrapper = document.getElementById('custom-cursor');
  const cursorDot     = document.getElementById('cursor-dot');
  const cursorRing    = document.getElementById('cursor-ring');
  if (!cursorWrapper || !cursorDot || !cursorRing) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;
  let prevX  = mouseX;
  let prevY  = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  let lastSparkTime = 0;
  function createSpark(x, y) {
    const now = performance.now();
    if (now - lastSparkTime < 38) return;
    lastSparkTime = now;

    const spark = document.createElement('div');
    spark.className = 'cursor-spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    document.body.appendChild(spark);

    gsap.to(spark, {
      x: (Math.random() - 0.5) * 22,
      y: (Math.random() - 0.5) * 22,
      scale: 0,
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out',
      onComplete: () => spark.remove(),
    });
  }

  function updateCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    const velocityX = mouseX - prevX;
    const velocityY = mouseY - prevY;
    prevX = mouseX;
    prevY = mouseY;

    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed > 14) {
      createSpark(mouseX, mouseY);
    }

    cursorWrapper.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
    const clampedScale = Math.min(speed * 0.015, 0.45);
    const scaleX = 1 + clampedScale;
    const scaleY = 1 - clampedScale * 0.5;

    if (!cursorWrapper.classList.contains('is-hover') && !cursorWrapper.classList.contains('is-view')) {
      cursorRing.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
    } else {
      cursorRing.style.transform = 'translate(-50%, -50%)';
    }

    if (isCursorNearStarGlobal) {
      cursorWrapper.classList.add('is-star-near');
    } else {
      cursorWrapper.classList.remove('is-star-near');
    }

    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .trait-tag, .tech-item, .stat-card, input, textarea, .nav-logo');
    if (target) {
      cursorWrapper.classList.add('is-hover');
    }

    const card = e.target.closest('.project-card');
    if (card) {
      cursorWrapper.classList.remove('is-hover');
      cursorWrapper.classList.add('is-view');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .trait-tag, .tech-item, .stat-card, input, textarea, .nav-logo');
    if (target) {
      cursorWrapper.classList.remove('is-hover');
    }

    const card = e.target.closest('.project-card');
    if (card) {
      cursorWrapper.classList.remove('is-view');
    }
  });

  window.addEventListener('mousedown', () => cursorWrapper.classList.add('is-active'));
  window.addEventListener('mouseup', () => cursorWrapper.classList.remove('is-active'));

  // Gentle Magnetic Button Movement
  document.querySelectorAll('.magnetic-btn, .nav-logo, .social-link').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15; // Gentle magnetic pull
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
      gsap.to(btn, { x, y, duration: 0.2, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    });
  });
})();


/* ═══════════════════════════════════════════════════
   4. NAVIGATION & MOBILE MENU
═══════════════════════════════════════════════════ */
(function initNavigation() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }
  }, { passive: true });

  let isMenuOpen = false;
  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    hamburger.classList.toggle('open', isMenuOpen);
    hamburger.setAttribute('aria-expanded', isMenuOpen);
    mobileMenu.classList.toggle('open', isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    if (lenisInstance) {
      isMenuOpen ? lenisInstance.stop() : lenisInstance.start();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (isMenuOpen) toggleMobileMenu();
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === id));
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach((section) => observer.observe(section));
})();


/* ═══════════════════════════════════════════════════
   5. GSAP SCROLL ANIMATIONS
═══════════════════════════════════════════════════ */
(function initGSAPAnimations() {

  // Hero Section Entrance Timeline
  const heroTimeline = gsap.timeline({ delay: 0.2 });
  heroTimeline
    .fromTo(
      '.hero-badge',
      { opacity: 0, y: -20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    )
    .fromTo(
      '#hero-label',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      '#hero-title',
      { opacity: 0, y: 80, skewY: 4 },
      { opacity: 1, y: 0, skewY: 0, duration: 1.3, ease: 'power4.out' },
      '-=0.5'
    )
    .fromTo(
      '#hero-ctas',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.8'
    )
    .fromTo(
      '#hero-desc',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.7'
    )
    .fromTo(
      '#scroll-indicator',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' },
      '-=0.4'
    );

  // Section Headers & Titles
  document.querySelectorAll('.section-label, .js-reveal-line').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  document.querySelectorAll('.section-title, .js-reveal-title').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 60, skewY: 2 },
      {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' },
      }
    );
  });

  // General Fade-In Trigger
  document.querySelectorAll('.js-reveal-fade').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // Project Cards Stagger
  document.querySelectorAll('.js-reveal-card').forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 70, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        delay: (index % 2) * 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // Process Steps
  document.querySelectorAll('.process-step').forEach((step, i) => {
    gsap.fromTo(
      step,
      { opacity: 0, x: -35 },
      {
        opacity: 1,
        x: 0,
        duration: 0.85,
        delay: i * 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // Tech Items Bounce Stagger
  document.querySelectorAll('.tech-group').forEach((group) => {
    const items = group.querySelectorAll('.tech-item');
    gsap.fromTo(
      items,
      { opacity: 0, scale: 0.8, y: 16 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: group, start: 'top 86%', toggleActions: 'play none none none' },
      }
    );
  });

  // Animated Stat Counters
  document.querySelectorAll('.stat-num[data-target]').forEach((counter) => {
    const targetVal = parseInt(counter.dataset.target, 10);
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(
          { val: 0 },
          {
            val: targetVal,
            duration: 2.0,
            ease: 'power2.out',
            onUpdate: function () {
              counter.textContent = Math.round(this.targets()[0].val);
            },
          }
        );
      },
    });
  });

  // Trait Tags Pop
  gsap.fromTo(
    '.trait-tag',
    { opacity: 0, scale: 0.7 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      stagger: 0.06,
      ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.about-traits', start: 'top 88%', toggleActions: 'play none none none' },
    }
  );

  // Parallax Hero Header
  if (!isTouchDevice) {
    const heroContent = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
      if (!heroContent) return;
      const scrollY = window.scrollY || window.pageYOffset;
      heroContent.style.transform = `translateY(${scrollY * 0.22}px)`;
      heroContent.style.opacity = Math.max(0, 1 - scrollY / 600);
    }, { passive: true });
  }

})();


/* ═══════════════════════════════════════════════════
   6. CONTACT FORM — DIRECT EMAIL DELIVERY TO DUDEMITHUN07@GMAIL.COM
═══════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-submit-text');
  const statusMsg = document.getElementById('form-status-msg');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim() || 'Not provided';
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      if (statusMsg) {
        statusMsg.className = 'form-status-msg error';
        statusMsg.textContent = 'Please fill out all required fields (*).';
      }
      return;
    }

    btn.disabled = true;
    if (btnText) btnText.textContent = 'Sending Message...';
    if (statusMsg) {
      statusMsg.className = 'form-status-msg';
      statusMsg.textContent = 'Delivering your message to Mithun...';
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/dudemithun07@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Name: name,
          Email: email,
          Phone: phone,
          Message: message,
          _subject: `✦ Portfolio Message from ${name}!`,
        }),
      });

      const result = await response.json();

      if (response.ok || result.success === 'true' || result.success === true) {
        gsap.to(btn, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (btnText) btnText.textContent = '✓ Message Sent!';
            gsap.to(btn, { backgroundColor: '#10b981', duration: 0.4 });
            if (statusMsg) {
              statusMsg.className = 'form-status-msg success';
              statusMsg.textContent = 'Thank you! Your email has been delivered directly to Mithun.';
            }
            form.reset();

            setTimeout(() => {
              btn.disabled = false;
              if (btnText) btnText.textContent = 'Send Message';
              gsap.to(btn, { backgroundColor: '#7c6dfa', duration: 0.5 });
            }, 4500);
          },
        });
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback triggered:', err);

      if (btnText) btnText.textContent = 'Opening Mail App...';
      if (statusMsg) {
        statusMsg.className = 'form-status-msg success';
        statusMsg.textContent = 'Direct mail opened. You can also email dudemithun07@gmail.com directly!';
      }

      const mailtoUrl = `mailto:dudemithun07@gmail.com?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(name)}&body=Name:%20${encodeURIComponent(name)}%0AEmail:%20${encodeURIComponent(email)}%0APhone:%20${encodeURIComponent(phone)}%0A%0AMessage:%0A${encodeURIComponent(message)}`;
      window.location.href = mailtoUrl;

      setTimeout(() => {
        btn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
        form.reset();
      }, 3000);
    }
  });
})();


/* ═══════════════════════════════════════════════════
   7. FOOTER AUTO YEAR
═══════════════════════════════════════════════════ */
const yearElement = document.getElementById('footer-year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════════════
   8. REACT BITS "SMOKE TYPE" CONDENSATION ENGINE
   Letters condense out of drifting smoke letter-by-letter
═══════════════════════════════════════════════════ */
function initSmokeType() {
  const targets = document.querySelectorAll('.smoke-type-target');
  targets.forEach((el) => {
    const rawText = el.getAttribute('data-text') || el.textContent;
    el.innerHTML = '';

    const chars = rawText.split('');
    chars.forEach((char, index) => {
      const span = document.createElement('span');
      if (char === ' ') {
        span.className = 'smoke-char space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'smoke-char';
        span.textContent = char;
      }

      // Random drifting smoke starting offsets & staggered delays
      const randomX = (Math.random() - 0.5) * 36;
      const randomY = -(Math.random() * 24 + 12);
      const randomRot = (Math.random() - 0.5) * 22;
      const delay = index * 0.055 + 0.2; // Stagger per letter

      span.style.setProperty('--smoke-x', `${randomX.toFixed(1)}px`);
      span.style.setProperty('--smoke-y', `${randomY.toFixed(1)}px`);
      span.style.setProperty('--smoke-rot', `${randomRot.toFixed(1)}deg`);
      span.style.setProperty('--char-index', index);
      span.style.animationDelay = `${delay.toFixed(3)}s`;

      el.appendChild(span);
    });
  });
}

/* ═══════════════════════════════════════════════════
   9. RANDOM LETTER SWAP NAV ENGINE
   Faithful client-side implementation of m-random-letter-swap-1
═══════════════════════════════════════════════════ */
function initRandomLetterSwapNav() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

  navLinks.forEach((link) => {
    const originalText = link.textContent.trim();
    link.innerHTML = '';

    // Wrap each letter in a span for individual character animations
    const charSpans = originalText.split('').map((char) => {
      const span = document.createElement('span');
      span.className = 'letter-swap-char';
      span.textContent = char;
      link.appendChild(span);
      return span;
    });

    let timers = [];
    const staggerDuration = 0.025;
    const totalDuration = 0.6;
    const stepTime = 40;

    const triggerSwap = () => {
      // Clear any running timers
      timers.forEach(clearTimeout);
      timers = [];

      originalText.split('').forEach((targetChar, index) => {
        if (targetChar === ' ') return;

        const delay = index * staggerDuration * 1000;
        const duration = (totalDuration * 1000) - delay;
        const steps = Math.max(1, Math.floor(duration / stepTime));

        let currentStep = 0;
        const timer = setTimeout(() => {
          const interval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
              clearInterval(interval);
              charSpans[index].textContent = targetChar;
              charSpans[index].style.transform = 'translateY(0)';
            } else {
              charSpans[index].textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
              charSpans[index].style.transform = `translateY(${(Math.random() - 0.5) * 4}px)`;
            }
          }, stepTime);
        }, delay);

        timers.push(timer);
      });
    };

    link.addEventListener('mouseenter', triggerSwap);
    link.addEventListener('mouseleave', () => {
      timers.forEach(clearTimeout);
      timers = [];
      originalText.split('').forEach((char, index) => {
        charSpans[index].textContent = char;
        charSpans[index].style.transform = 'translateY(0)';
      });
    });
  });
}

/* ═══════════════════════════════════════════════════
   10. STARTUP & CLIENT WORK SECTION ENGINE
   Data-driven gallery, services, and featured project
═══════════════════════════════════════════════════ */

/* ✏️ EDITABLE: Add your real client websites here.
   Each object represents a website you've built for a client.
   Set featured: true on the project you want showcased as the featured card.
   To add a new website, just add another object to this array. */
const clientWebsites = [
  {
    name: "Paper & Pie",
    title: "Paper & Pie — Restaurant & Cafe Website",
    category: "Restaurant & Cafe Website",
    description: "A visually appetizing, modern restaurant and cafe website designed for Paper & Pie, featuring an elegant menu showcase, engaging culinary photography layout, and a smooth browsing experience for hungry visitors.",
    previewType: "cafe",
    image: "",
    url: "https://wibzzite-ui.github.io/paper-and-pie-/",
    github: "https://github.com/wibzzite-ui/paper-and-pie-",
    technologies: ["HTML5", "CSS3", "JavaScript", "Responsive UI"],
    featured: false
  },
  {
    name: "Sample Saloon",
    title: "Saloon — Beauty & Wellness Website",
    category: "Business Website",
    description: "A sleek and professional website designed for a beauty salon business, complete with service listings, booking information, and a modern aesthetic that reflects the brand's premium identity.",
    previewType: "saloon",
    image: "",
    url: "https://wibzzite-ui.github.io/sample-website-saloon/",
    github: "https://github.com/wibzzite-ui/sample-website-saloon",
    technologies: ["HTML5", "CSS3", "JavaScript"],
    featured: false
  },
];

/* ✏️ EDITABLE: Modify services you offer */
const startupServices = [
  {
    icon: "🌐",
    title: "Business Website Development",
    description: "Professional websites to establish your brand's online presence."
  },
  {
    icon: "👤",
    title: "Portfolio Website Development",
    description: "Showcase your work with stunning personal portfolio websites."
  },
  {
    icon: "🍽️",
    title: "Restaurant & Cafe Websites",
    description: "Appetizing digital experiences for food & hospitality businesses."
  },
  {
    icon: "🚀",
    title: "Landing Page Design",
    description: "High-converting landing pages that drive results."
  },
  {
    icon: "📱",
    title: "Responsive Website Development",
    description: "Pixel-perfect websites that work beautifully on all devices."
  },
  {
    icon: "✨",
    title: "Website Redesign & UI Improvements",
    description: "Modernize your existing website with fresh design and better UX."
  }
];

function initStartupSection() {
  const galleryGrid = document.getElementById('su-gallery-grid');
  const featuredWrap = document.getElementById('su-featured-wrap');
  const emptyState = document.getElementById('su-empty-state');
  const servicesGrid = document.getElementById('su-services-grid');

  if (!galleryGrid) return;

  // ── Render Services ──
  if (servicesGrid) {
    servicesGrid.innerHTML = startupServices.map(service => `
      <div class="su-service-card" data-cursor="hover">
        <span class="su-service-icon">${service.icon}</span>
        <h4>${service.title}</h4>
        <p>${service.description}</p>
      </div>
    `).join('');
  }

  // ── Separate featured vs regular projects ──
  const featuredProject = clientWebsites.find(w => w.featured);
  const regularProjects = clientWebsites.filter(w => !w.featured);

  // ── Render Featured Project ──
  if (featuredProject && featuredWrap) {
    featuredWrap.style.display = 'block';
    const techTags = (featuredProject.technologies || []).map(t => `<span class="su-tech-tag">${t}</span>`).join('');
    const liveBtn = featuredProject.url
      ? `<a href="${featuredProject.url}" target="_blank" rel="noopener noreferrer" class="su-btn-live" data-cursor="hover">View Live Website ↗</a>`
      : '';
    const githubBtn = featuredProject.github
      ? `<a href="${featuredProject.github}" target="_blank" rel="noopener noreferrer" class="su-btn-details" data-cursor="hover">GitHub ↗</a>`
      : '';
    const imgContent = featuredProject.image
      ? `<img src="${featuredProject.image}" alt="${featuredProject.title}" loading="lazy">`
      : `<div class="su-card-preview-placeholder">Preview Coming Soon</div>`;

    featuredWrap.innerHTML = `
      <div class="su-featured-card js-reveal-fade">
        <div class="su-featured-img">${imgContent}</div>
        <div class="su-featured-info">
          <span class="su-card-category">${featuredProject.category || 'Client Project'}</span>
          <h3>${featuredProject.title}</h3>
          <p class="su-card-desc">${featuredProject.description || ''}</p>
          <div class="su-featured-techs">${techTags}</div>
          <div class="su-featured-links">
            ${liveBtn}
            ${githubBtn}
          </div>
        </div>
      </div>
    `;
  }

  else if (featuredWrap) {
    featuredWrap.style.display = 'none';
    featuredWrap.innerHTML = '';
  }

  // ── Render Gallery Cards ──
  const projectsToRender = clientWebsites;

  if (projectsToRender.length === 0) {
    // Show empty state
    if (emptyState) emptyState.style.display = 'block';
    galleryGrid.style.display = 'none';
  } else if (projectsToRender.length > 0) {
    if (emptyState) emptyState.style.display = 'none';
    galleryGrid.style.display = 'grid';
    galleryGrid.innerHTML = projectsToRender.map(website => {
      const techTags = (website.technologies || []).map(t => `<span class="su-tech-tag">${t}</span>`).join('');
      const liveBtn = website.url
        ? `<a href="${website.url}" target="_blank" rel="noopener noreferrer" class="su-btn-live" data-cursor="hover">Live Website ↗</a>`
        : '';
      const githubBtn = website.github
        ? `<a href="${website.github}" target="_blank" rel="noopener noreferrer" class="su-btn-details" data-cursor="hover">GitHub ↗</a>`
        : '';
      const imgContent = website.image
        ? `<img src="${website.image}" alt="${website.title}" loading="lazy">`
        : `<div class="su-card-preview-placeholder su-preview-${website.previewType || 'default'}">
             <div class="su-preview-mockup">
               <span class="su-preview-icon">${website.previewType === 'cafe' ? '🍽️' : '✂️'}</span>
               <span class="su-preview-brand">${website.name}</span>
               <span class="su-preview-badge">${website.category}</span>
             </div>
           </div>`;

      return `
        <article class="su-website-card js-reveal-card" data-cursor="view">
          <div class="su-card-preview">
            ${imgContent}
          </div>
          <div class="su-card-body">
            <p class="su-card-category">${website.category || 'Website'}</p>
            <p class="su-card-client">${website.name || ''}</p>
            <h4 class="su-card-title">${website.title}</h4>
            <p class="su-card-desc">${website.description || ''}</p>
            <div class="su-card-techs">${techTags}</div>
            <div class="su-card-links">${liveBtn}${githubBtn}</div>
          </div>
        </article>
      `;
    }).join('');
  } else {
    // Only featured exists, hide the gallery grid
    galleryGrid.style.display = 'none';
  }

  // ── GSAP Animations for Startup Section ──
  // Service cards stagger
  if (servicesGrid) {
    const serviceCards = servicesGrid.querySelectorAll('.su-service-card');
    gsap.fromTo(serviceCards,
      { opacity: 0, y: 40, scale: 0.92 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: servicesGrid, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  }

  // Process steps stagger
  const processSteps = document.querySelectorAll('.su-process-step');
  processSteps.forEach((step, i) => {
    gsap.fromTo(step,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.7, delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // Website cards stagger
  const websiteCards = galleryGrid.querySelectorAll('.su-website-card');
  websiteCards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.85,
        delay: (index % 3) * 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // Subtle 3D card tilt on mousemove
  if (!isTouchDevice) {
    document.querySelectorAll('.su-website-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateY: x * 8,
          rotateX: -y * 6,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power2.out' });
      });
    });
  }

  // Re-bind magnetic buttons for the new CTA buttons
  document.querySelectorAll('.su-cta-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
      gsap.to(btn, { x, y, duration: 0.2, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    });
  });
}

// Auto-run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSmokeType();
    initRandomLetterSwapNav();
    initStartupSection();
  });
} else {
  initSmokeType();
  initRandomLetterSwapNav();
  initStartupSection();
}

