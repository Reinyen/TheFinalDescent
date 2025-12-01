import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type IntroAnchors = {
  living?: (DOMRect | null)[];
  fallen?: (DOMRect | null)[];
};

export type RosterFxHandle = {
  playIntro: (livingIds: string[], fallenIds: string[], anchors?: IntroAnchors) => Promise<void>;
  playSingleReroll: (cardRect?: DOMRect | null, starsRect?: DOMRect | null) => Promise<void>;
  playTotalReroll: (cardRects?: DOMRect[] | null, starsRect?: DOMRect | null) => Promise<void>;
};

type BurstEffect = {
  points: any;
  velocities: Float32Array;
  lifetimes: Float32Array;
  maxLife: number;
  fadeOut: boolean;
};

type IntroState = {
  stars: {
    mesh: any;
    arcTarget: any;
    finalTarget: any;
    isFallen: boolean;
    baseColor: any;
    ring?: any;
    halo?: any;
  }[];
  overlay: any;
  sweep?: any;
  start: number;
  resolve: () => void;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const RosterVFX = forwardRef<RosterFxHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const backgroundRef = useRef<{ points: any; velocities: Float32Array; positions: Float32Array } | null>(null);
  const overlayRef = useRef<any>(null);
  const effectsRef = useRef<BurstEffect[]>([]);
  const introRef = useRef<IntroState | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const sizeRef = useRef<{ w: number; h: number }>({ w: window.innerWidth, h: window.innerHeight });
  const readyRef = useRef(false);

  const ensureThree = async () => {
    if (readyRef.current) return threeRef.current;

    const cdnUrl = 'https://unpkg.com/three@0.170.0/build/three.module.js';
    let mod: any;
    try {
      const localModuleId = 'three';
      mod = await import(/* @vite-ignore */ localModuleId);
    } catch (err) {
      mod = await import(/* @vite-ignore */ cdnUrl);
    }

    threeRef.current = mod;
    initThree(mod);
    readyRef.current = true;
    return mod;
  };

  const initThree = (THREE: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -1000, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;

    const overlayGeo = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    const overlayMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0 });
    const overlay = new THREE.Mesh(overlayGeo, overlayMat);
    overlay.position.set(window.innerWidth / 2, window.innerHeight / 2, -10);
    scene.add(overlay);
    overlayRef.current = overlay;

    rebuildBackground();
    animate();
    window.addEventListener('resize', handleResize);
  };

  const rebuildBackground = () => {
    const THREE = threeRef.current;
    if (!THREE || !sceneRef.current) return;
    if (backgroundRef.current) {
      sceneRef.current.remove(backgroundRef.current.points);
      backgroundRef.current.points.geometry.dispose();
      if (backgroundRef.current.points.material.dispose) {
        backgroundRef.current.points.material.dispose();
      }
    }

    const count = Math.max(120, Math.min(280, Math.floor((window.innerWidth * window.innerHeight) / 20000)));
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * window.innerWidth;
      positions[i * 3 + 1] = Math.random() * window.innerHeight;
      positions[i * 3 + 2] = Math.random() * 0.2;
      velocities[i] = 18 + Math.random() * 42;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xe8f4fd,
      size: 2.2,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    sceneRef.current.add(points);
    backgroundRef.current = { points, velocities, positions };
  };

  const handleResize = () => {
    const THREE = threeRef.current;
    if (!THREE || !rendererRef.current || !cameraRef.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeRef.current = { w, h };

    rendererRef.current.setSize(w, h, false);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    cameraRef.current.left = 0;
    cameraRef.current.right = w;
    cameraRef.current.top = 0;
    cameraRef.current.bottom = h;
    cameraRef.current.updateProjectionMatrix();

    if (overlayRef.current) {
      overlayRef.current.geometry.dispose();
      overlayRef.current.geometry = new THREE.PlaneGeometry(w, h);
      overlayRef.current.position.set(w / 2, h / 2, -10);
    }

    rebuildBackground();
  };

  const animate = () => {
    const THREE = threeRef.current;
    if (!THREE || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const loop = (now: number) => {
      updateBackground(now);
      updateEffects(now);
      updateIntro(now);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const updateBackground = (now: number) => {
    if (!backgroundRef.current) return;
    const { positions, velocities, points } = backgroundRef.current;
    const h = sizeRef.current.h;

    for (let i = 0; i < velocities.length; i++) {
      const idx = i * 3 + 1;
      positions[idx] += velocities[i] * 0.016;
      if (positions[idx] > h + 24) {
        positions[idx] = -12;
        positions[i * 3] = Math.random() * sizeRef.current.w;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
    const jitter = Math.sin(now * 0.0003) * 0.08;
    points.rotation.z = jitter;
  };

  const spawnBurst = (origin: { x: number; y: number }, count: number, hue: number, upward = true, spread = 1) => {
    const THREE = threeRef.current;
    if (!THREE || !sceneRef.current) return;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (16 + Math.random() * 42) * (upward ? -1 : 1);
      const radius = (8 + Math.random() * 36) * spread;
      positions[i * 3] = origin.x + Math.cos(angle) * radius * 0.35;
      positions[i * 3 + 1] = origin.y + Math.sin(angle) * radius * 0.35;
      positions[i * 3 + 2] = 0;
      velocities[i * 3] = Math.cos(angle) * (upward ? 22 : 12) * spread;
      velocities[i * 3 + 1] = speed * 0.35;
      velocities[i * 3 + 2] = 0;
      lifetimes[i] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: hue,
      size: 2.8,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.position.z = 15;
    sceneRef.current.add(points);
    effectsRef.current.push({ points, velocities, lifetimes, maxLife: 1.1, fadeOut: true });
  };

  const spawnAsh = (rect?: DOMRect | null, count = 1) => {
    const center = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: sizeRef.current.w * 0.5, y: sizeRef.current.h * 0.78 };
    for (let i = 0; i < count; i++) {
      spawnBurst(center, 34, 0xa8a8a8, false, 0.4);
    }
  };

  const updateEffects = (now: number) => {
    const THREE = threeRef.current;
    if (!THREE) return;
    const toRemove: BurstEffect[] = [];

    effectsRef.current.forEach(effect => {
      const { points, velocities, lifetimes, maxLife } = effect;
      const positions = points.geometry.attributes.position.array as Float32Array;
      const count = lifetimes.length;

      for (let i = 0; i < count; i++) {
        lifetimes[i] += 0.016;
        positions[i * 3] += velocities[i * 3] * 0.016;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.016;
      }

      points.geometry.attributes.position.needsUpdate = true;
      const age = lifetimes[0];
      const progress = age / maxLife;
      if (effect.fadeOut) {
        points.material.opacity = clamp01(1 - progress);
      }
      if (age >= maxLife) {
        toRemove.push(effect);
      }
    });

    toRemove.forEach(effect => {
      sceneRef.current.remove(effect.points);
      effect.points.geometry.dispose();
      effect.points.material.dispose();
    });
    effectsRef.current = effectsRef.current.filter(e => !toRemove.includes(e));
  };

  const toScenePoint = (rect?: DOMRect | null, fallback?: { x: number; y: number }) => {
    if (!rect) return fallback ?? { x: sizeRef.current.w / 2, y: sizeRef.current.h / 2 };
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const buildTargets = (anchors?: IntroAnchors) => {
    const livingTargets = (anchors?.living ?? []).map((rect, idx) =>
      toScenePoint(rect, {
        x: sizeRef.current.w * 0.5 + (idx - 1) * 190,
        y: sizeRef.current.h * 0.34,
      }),
    );
    const fallenTargets = (anchors?.fallen ?? []).map((rect, idx) =>
      toScenePoint(rect, {
        x: sizeRef.current.w * 0.5 + (idx - 1) * 110,
        y: sizeRef.current.h * 0.68,
      }),
    );

    // fallback if anchors were missing
    while (livingTargets.length < 3) {
      livingTargets.push({ x: sizeRef.current.w * 0.5 + (livingTargets.length - 1) * 190, y: sizeRef.current.h * 0.34 });
    }
    while (fallenTargets.length < 3) {
      fallenTargets.push({ x: sizeRef.current.w * 0.5 + (fallenTargets.length - 1) * 110, y: sizeRef.current.h * 0.68 });
    }

    return { livingTargets, fallenTargets };
  };

  const playIntro = async (livingIds: string[], fallenIds: string[], anchors?: IntroAnchors) => {
    await ensureThree();
    const THREE = threeRef.current;
    if (!THREE || !sceneRef.current) return;

    if (introRef.current) {
      sceneRef.current.remove(...introRef.current.stars.map(s => s.mesh));
      if (introRef.current.sweep) sceneRef.current.remove(introRef.current.sweep);
      introRef.current = null;
    }

    const { livingTargets, fallenTargets } = buildTargets(anchors);
    const fallenSet = new Set(fallenIds);
    const stars: IntroState['stars'] = [];
    const startY = sizeRef.current.h * 0.42;
    const arcTargets = [...livingTargets, ...fallenTargets].map((t, idx) => ({
      x: t.x + (idx % 3 - 1) * 24,
      y: idx < 3 ? sizeRef.current.h * 0.28 : sizeRef.current.h * 0.52,
    }));

    [...livingIds, ...fallenIds].forEach((id, idx) => {
      const geo = new THREE.SphereGeometry(14, 24, 24);
      const mat = new THREE.MeshBasicMaterial({ color: 0xe8f4fd, transparent: true, opacity: 0.0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(sizeRef.current.w / 2, startY, 0);
      const col = new THREE.Color(0xe8f4fd);
      const arcTarget = new THREE.Vector3(arcTargets[idx].x, arcTargets[idx].y, 0);
      const finalTarget = new THREE.Vector3(
        idx < 3 ? livingTargets[idx].x : fallenTargets[idx - 3].x,
        idx < 3 ? livingTargets[idx].y : fallenTargets[idx - 3].y,
        0,
      );

      // subtle halo that will tighten for fallen
      const haloGeo = new THREE.RingGeometry(20, 26, 28);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(mesh.position.x, mesh.position.y, -2);
      sceneRef.current.add(halo);

      sceneRef.current.add(mesh);
      stars.push({ mesh, arcTarget, finalTarget, isFallen: fallenSet.has(id), baseColor: col, halo });
    });

    const overlay = overlayRef.current;
    if (overlay) overlay.material.opacity = 0.0;

    // sweep strip
    const sweepGeo = new THREE.PlaneGeometry(sizeRef.current.w * 0.5, sizeRef.current.h * 1.4);
    const sweepMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    const sweep = new THREE.Mesh(sweepGeo, sweepMat);
    sweep.rotation.z = -0.25;
    sweep.position.set(-sizeRef.current.w * 0.4, sizeRef.current.h * 0.45, -5);
    sceneRef.current.add(sweep);

    let resolver: () => void;
    const promise = new Promise<void>(res => (resolver = res));
    introRef.current = { stars, overlay, sweep, start: performance.now(), resolve: resolver! };
    return promise;
  };

  const updateIntro = (now: number) => {
    const THREE = threeRef.current;
    const intro = introRef.current;
    if (!THREE || !intro) return;

    const elapsed = now - intro.start;
    const overlay = intro.overlay;
    const sweep = intro.sweep;

    // Phase A: void expansion + blackout
    const voidT = clamp01(elapsed / 420);
    if (overlay) overlay.material.opacity = 0.95 * voidT * (elapsed < 1400 ? 1 : clamp01(1.4 - (elapsed - 1400) / 1600));

    // Sweep motion
    if (sweep) {
      const sweepT = clamp01((elapsed - 1150) / 550);
      sweep.position.x = -sizeRef.current.w * 0.4 + sizeRef.current.w * 1.4 * sweepT;
      sweep.material.opacity = 0.55 * Math.sin(Math.PI * sweepT);
    }

    intro.stars.forEach(star => {
      const mesh = star.mesh;
      const appear = clamp01((elapsed - 220) / 900);
      const startVec = new THREE.Vector3(sizeRef.current.w / 2, sizeRef.current.h * 0.18, 0);
      mesh.position.lerpVectors(startVec, star.arcTarget, easeOut(appear));
      mesh.material.opacity = 0.15 + 0.85 * appear;
      const pulse = 1 + Math.sin(Math.min(elapsed, 1600) * 0.004) * 0.06;
      mesh.scale.setScalar(0.65 + 0.35 * appear * pulse);

      // halo tighten for chosen fallen after sweep
      if (star.halo) {
        const haloFocus = clamp01((elapsed - 1550) / 520) * (star.isFallen ? 1 : 0.4);
        star.halo.position.copy(mesh.position);
        star.halo.scale.setScalar(1.2 - 0.35 * haloFocus);
        star.halo.material.opacity = 0.38 * haloFocus;
      }

      // Fate made real: fallen fracture + dim
      if (elapsed > 1900 && star.isFallen) {
        const deadT = clamp01((elapsed - 1900) / 900);
        mesh.material.color = star.baseColor.clone().lerp(new THREE.Color(0x6f7380), deadT);
        mesh.material.opacity = 0.95 - 0.45 * deadT;
        mesh.scale.setScalar(0.94 - 0.24 * deadT);

        if (!star.ring) {
          const ringGeo = new THREE.RingGeometry(12, 18, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x6f7380,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          });
          star.ring = new THREE.Mesh(ringGeo, ringMat);
          star.ring.position.set(mesh.position.x, mesh.position.y, -3);
          sceneRef.current?.add(star.ring);
        }

        if (star.ring) {
          const ringT = clamp01((elapsed - 1900) / 600);
          star.ring.position.copy(mesh.position);
          star.ring.scale.setScalar(1 + ringT * 2.2);
          star.ring.material.opacity = 0.35 * (1 - ringT);
        }
      }

      // Phase D: the fall
      if (elapsed > 2400 && star.isFallen) {
        const dropT = easeOut(clamp01((elapsed - 2400) / 900));
        mesh.position.lerpVectors(star.arcTarget, star.finalTarget, dropT);
      }

      // Phase E: morph into UI anchors for everyone
      if (elapsed > 3000) {
        const morphT = easeOut(clamp01((elapsed - 3000) / 900));
        mesh.position.lerp(star.finalTarget, morphT);
        mesh.material.opacity = Math.max(0.05, mesh.material.opacity * (1 - morphT * 0.65));
        if (star.halo) star.halo.material.opacity = Math.max(0, star.halo.material.opacity * (1 - morphT));
      }
    });

    if (elapsed > 4200) {
      const fade = clamp01((elapsed - 4200) / 450);
      intro.stars.forEach(star => {
        star.mesh.material.opacity = Math.max(0, star.mesh.material.opacity - 0.03 * fade - 0.012);
        if (star.ring) star.ring.material.opacity = Math.max(0, star.ring.material.opacity - 0.04 * fade);
      });
      if (overlay) overlay.material.opacity = Math.max(0, overlay.material.opacity - 0.06 * fade);
      if (sweep) sweep.material.opacity = Math.max(0, sweep.material.opacity - 0.08 * fade);
    }

    if (elapsed > 4700) {
      intro.stars.forEach(star => {
        sceneRef.current?.remove(star.mesh);
        if (star.halo) sceneRef.current?.remove(star.halo);
        if (star.ring) sceneRef.current?.remove(star.ring);
        star.mesh.geometry.dispose();
        star.mesh.material.dispose();
        star.halo?.geometry.dispose();
        star.halo?.material.dispose();
        star.ring?.geometry.dispose();
        star.ring?.material.dispose();
      });
      if (sweep) sceneRef.current?.remove(sweep);
      introRef.current = null;
      intro.resolve();
    }
  };

  const playSingleReroll = async (cardRect?: DOMRect | null, starsRect?: DOMRect | null) => {
    await ensureThree();
    const origin = toScenePoint(cardRect);
    spawnBurst(origin, 95, 0xffd700, true, 1.2);
    spawnAsh(starsRect, 2);
    return new Promise<void>(res => setTimeout(res, 820));
  };

  const playTotalReroll = async (cardRects?: DOMRect[] | null, starsRect?: DOMRect | null) => {
    await ensureThree();
    if (cardRects && cardRects.length) {
      cardRects.forEach(rect => spawnBurst(toScenePoint(rect), 70, 0x98d4ff, true, 0.9));
    } else {
      spawnBurst({ x: sizeRef.current.w / 2, y: sizeRef.current.h * 0.4 }, 140, 0x98d4ff, true, 1.4);
    }
    spawnAsh(starsRect, 1);
    return new Promise<void>(res => setTimeout(res, 900));
  };

  useImperativeHandle(ref, () => ({ playIntro, playSingleReroll, playTotalReroll }));

  useEffect(() => {
    ensureThree();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      effectsRef.current.forEach(effect => {
        sceneRef.current?.remove(effect.points);
        effect.points.geometry.dispose();
        effect.points.material.dispose();
      });
      if (backgroundRef.current) {
        backgroundRef.current.points.geometry.dispose();
        backgroundRef.current.points.material.dispose();
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />;
});

RosterVFX.displayName = 'RosterVFX';
