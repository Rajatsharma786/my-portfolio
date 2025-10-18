// Three.js Hero Scene with subtle holographic particles
// Orbiting canvas disabled (restored original 3D parallax)

/**
 * Initialise the 3D hero scene.  This function sets up a dynamic wave grid
 * rendered with Three.js alongside a subtle starfield.  The wave animates
 * continuously to create a mesmerising yet restrained backdrop that fills
 * the hero section without feeling overdone.  Mouse movement introduces
 * gentle parallax by shifting the camera, and scrolling pushes the wave
 * deeper into the scene while fading it out.  This design is informed by
 * 2025 web design trends favouring immersive 3D elements and parallax
 * experiences to engage visitors【527325455688646†L174-L194】【862839406106836†L80-L89】.
 */
 (function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Renderer and scene
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    // Explicitly clear the canvas to a transparent black.  Without this,
    // some browsers may retain previous frame data causing the scene to
    // appear darker than expected.
    renderer.setClearColor(0x000000, 0);
    // Adjust tone mapping to enhance overall brightness.  Use Reinhard tone
    // mapping with a higher exposure so the white bars of the ring render
    // brighter while maintaining detail in the starfield.
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3.0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 100);

    // Initial camera setup
    camera.position.set(0, 1.5, 10);
    camera.lookAt(0, 0, 0);

    // Responsive resize
    const resize = () => {
        const width = canvas.clientWidth || canvas.parentElement.clientWidth;
        const height = canvas.clientHeight || canvas.parentElement.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // Lighting: ambient and a white point light for a crisp neon feel
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 3.0, 100);
    pointLight.position.set(4, 6, 8);
    scene.add(pointLight);

    // Create a Three.js ring group that will hold luminous bars arranged in a circle.
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    // Optional orbiting sphere (hidden by default) left for future use
    const sphereGeo = new THREE.SphereGeometry(0.25, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const orbitSphere = new THREE.Mesh(sphereGeo, sphereMat);
    orbitSphere.visible = false;
    scene.add(orbitSphere);

    /**
     * Build a 3D ring using Three.js meshes.  Each bar is a slender box
     * geometry rotated around the Y‑axis so that its width points radially
     * outward from the centre.  The ring is offset slightly to the right so
     * it does not overlap with the hero text.  Emissive materials are used to
     * create a bright neon effect without requiring complex lighting.
     */
    function create3DRing() {
        const tileCount3D = 60;
        // Reduce the ring radius slightly so the circle occupies less space
        // relative to the hero section.  A smaller radius still allows the ring
        // to scale up on scroll without overwhelming the layout.
        const ringRadius3D = 4;
        // Remove any existing bars
        while (ringGroup.children.length) {
            ringGroup.remove(ringGroup.children[0]);
        }
        for (let i = 0; i < tileCount3D; i++) {
            const angle = (i / tileCount3D) * Math.PI * 2;
            // Dimensions: width aligns radially, height is vertical, depth is thickness
            // Dimensions: adjust bar proportions to fit the new smaller ring.
            // A narrower width and shorter height ensure the circle feels more
            // refined while still creating the vertical spoke effect.
            const width = 0.35;
            const height = 1.4;
            const depth = 0.08;
            const geometry = new THREE.BoxGeometry(width, height, depth);
            // Use MeshBasicMaterial so bars render at full brightness without
            // relying on scene lighting.  Transparency and slight opacity allow
            // stars and background elements to show through the bars.
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: false,
                opacity: 1.0
            });
            const bar = new THREE.Mesh(geometry, material);
            // Rotate so the bar’s width (x‑axis) aligns with the radial direction
            bar.rotation.y = angle;
            // Position the bar at the ring radius plus half its radial width.  A
            // slight offset in the Y direction centres the ring around the
            // horizontal midline of the hero section.
            const radialDist = ringRadius3D + width / 2;
            bar.position.set(Math.cos(angle) * radialDist, 0, Math.sin(angle) * radialDist);
            ringGroup.add(bar);
        }
        // Reset group transforms before applying static positioning/rotation.
        ringGroup.position.set(0, 0, 0);
        ringGroup.rotation.set(0, 0, 0);
        // Offset the ring slightly to the right of centre so the text on the left
        // remains readable.  Apply a downward tilt around the X‑axis to mimic
        // the perspective of the reference video.
        ringGroup.position.x = 2.0;
        ringGroup.rotation.x = -0.8; // roughly -45 degrees for a dramatic tilt
        ringGroup.visible = true;
    }
    create3DRing();

    // Reference and hide the DOM-based ring if it exists.  Our 3D ring
    // supersedes the CSS version so the DOM ring is no longer shown.
    const orbitRingEl = document.getElementById('orbit-ring');
    if (orbitRingEl) {
        orbitRingEl.style.display = 'none';
    }

    // Variables controlling the 3D ring’s rotation and scroll‑based movement
    let ringRotationY = 0;
    let scrollProgress = 0;
    // Update the 3D ring’s scale and position based on scroll progress.  We use
    // small world‑space translations because the scene units differ from pixels.
    function updateRingTransform() {
        const scaleVal = 1 + scrollProgress * 2.5;
        const translateZ = -scrollProgress * 8;
        const translateY = -scrollProgress * 2.5;
        ringGroup.scale.set(scaleVal, scaleVal, scaleVal);
        // Keep the initial horizontal offset while updating Y and Z
        ringGroup.position.y = translateY;
        ringGroup.position.z = translateZ;
    }
    // Animation loop for rotating the 3D ring.  This replaces the DOM ring
    // rotation loop.  The ring rotates slowly around the Y‑axis and is
    // repositioned on scroll via updateRingTransform.
    function animateRing() {
        // Slow down the ring’s rotation.  A smaller increment reduces the
        // rotational speed, producing a more subtle motion per user request.
        ringRotationY += 0.01;
        ringGroup.rotation.y = ringRotationY;
        updateRingTransform();
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Removed legacy DOM ring variables and update function.  The Three.js ring
    // now defines its own ringRotationY, scrollProgress and updateRingTransform
    // further up.

    // Starfield (white stars) for depth.  Increase opacity and lighten
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const r = 15 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const sx = r * Math.sin(phi) * Math.cos(theta);
        const sy = r * Math.sin(phi) * Math.sin(theta);
        const sz = r * Math.cos(phi);
        starPositions[i * 3 + 0] = sx;
        starPositions[i * 3 + 1] = sy;
        starPositions[i * 3 + 2] = sz;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);


    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    });

    // Animation loop
    function animate(time) {
        const t = time * 0.001;
        // Rotate stars slowly for subtle motion
        stars.rotation.y = t * 0.02;
        stars.rotation.x = t * 0.01;
        // Camera parallax
        const targetX = mouseX * 1.5;
        const targetY = 2.0 + mouseY * 1.0;
        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Scroll-based parallax: scale and move the ring deeper into the scene as
    // the user scrolls.  Fade the canvas at the same time to blend into
    // subsequent sections.
    function onScroll() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (rect.height * 0.8)));
        // Fade canvas
        canvas.style.opacity = String(1 - progress * 0.9);
        // Record progress so the DOM ring can update its transform.  The hidden
        // Three.js ring and orbiting sphere no longer need to be scaled or moved.
        scrollProgress = progress;
        updateRingTransform();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Parallax background layers
(function initParallaxBG() {
	const layers = document.querySelectorAll('.futuristic-bg .layer');
	if (!layers.length) return;
	window.addEventListener('mousemove', (e) => {
		const cx = window.innerWidth / 2;
		const cy = window.innerHeight / 2;
		const dx = (e.clientX - cx) / cx;
		const dy = (e.clientY - cy) / cy;
		layers.forEach(layer => {
			const depth = parseFloat(layer.getAttribute('data-depth') || '0.1');
			layer.style.transform = `translate3d(${dx * -20 * depth}px, ${dy * -14 * depth}px, 0)`;
		});
	});
})();

/*
 * Initialise the stacking behaviour for the project cards.  The original
 * implementation used GSAP and ScrollTrigger to animate tabs in 3D space.
 * To create a cleaner file‑stack effect where each new project card
 * overlaps the previous one (allowing the earlier title to remain visible),
 * we compute a static sticky offset and ascending z‑index for each tab.
 */
(function initStackingProjects() {
    const tabs = document.querySelectorAll('.project-tab');
    if (!tabs.length) return;
    // Measure the height of the tab header (the icon + title) to determine
    // how much of each previous card should remain visible when stacking.
    const firstHeader = tabs[0].querySelector('.tab-header');
    const headerHeight = firstHeader ? firstHeader.offsetHeight : 90;
    // Space between stacked cards in pixels.  Adjust this value to
    // increase or decrease the visible portion of previous cards.
    const gap = 30;
    tabs.forEach((tab, index) => {
        // Remove any transforms or margins applied by the previous GSAP
        // implementation or CSS.  Inline styles override CSS rules.
        tab.style.transform = 'none';
        tab.style.marginTop = '0';
        // Compute the sticky top offset: start at the base offset (10vh)
        // defined in the stylesheet and add the header height plus gap
        // multiplied by the index.  This causes later cards to sit lower
        // in the viewport so the preceding title stays visible.
        const offsetPx = index * (headerHeight + gap);
        tab.style.top = `calc(10vh + ${offsetPx}px)`;
        tab.style.position = 'sticky';
        // Assign a z‑index that increases with each card so later cards
        // overlap earlier ones.  Without this, the first card would
        // always appear on top, preventing the desired file‑stack effect.
        tab.style.zIndex = `${index + 1}`;
    });
})();

// Smooth internal link offset handling for fixed navbar
(function smoothScrollOffset() {
	const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
	document.querySelectorAll('a[href^="#"]').forEach(a => {
		a.addEventListener('click', e => {
			const id = a.getAttribute('href');
			const target = document.querySelector(id);
			if (!target) return;
			e.preventDefault();
			const y = target.getBoundingClientRect().top + window.scrollY - (navHeight + 12);
			window.scrollTo({ top: y, behavior: 'smooth' });
		});
	});
})();

(function initProjectLinks() {
  document.querySelectorAll('.project-tab').forEach(tab => {
    const live = tab.getAttribute('data-live');
    const repo = tab.getAttribute('data-repo');

    tab.querySelectorAll('.project-link').forEach(a => {
      const kind = a.getAttribute('data-kind');
      if (kind === 'live' && live) a.href = live;
      if (kind === 'code' && repo) {
        a.href = repo.startsWith('http') ? repo : `https://github.com/${repo}`;
      }
    });
  });
})();

// Parallax movement for hero title.  As the cursor moves across the viewport
// the hero’s name subtly shifts position, giving the illusion of depth.  This
// effect complements the animated wave behind it and draws the visitor’s eye
// without being distracting.
(function initHeroTitleParallax() {
    const title = document.querySelector('.hero .hero-content h1');
    if (!title) return;
    const maxOffset = 25; // maximum pixel offset for the parallax
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        const offsetX = x * maxOffset;
        const offsetY = y * maxOffset;
        title.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    });
})();
