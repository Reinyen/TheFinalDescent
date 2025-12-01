/**
 * IntroScreen - Cosmic Horror Intro Animation
 * 3.5 second unskippable sequence with realistic starfield, comet impact, and reality warping
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// ============================================================================
// TIMELINE STRUCTURE (6.5 seconds total)
// ============================================================================
// 0.0 - 1.0s: FADE_IN - Starfield fades in with twinkling
// 1.0 - 4.0s: COMET_APPROACH - Star grows and falls at 60° angle (3 seconds)
// 4.0 - 4.5s: IMPACT - Explosion with debris and shockwaves (0.5 seconds)
// 4.5 - 5.5s: CRATER_SETTLE - Eerie glow, reality warp, title glitches in (1 second)
// 5.5 - 6.5s: BUTTON_REVEAL - Button glitches in, ready to play (1 second)

// ============================================================================
// CUSTOM SHADERS
// ============================================================================

// Cosmic Horror Comet Shader - Realistic but with eerie purple/teal/green colors
const CometVertexShader = `
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex noise for rocky surface
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Rocky surface displacement
    float noise = snoise(position * 1.2 + vec3(time * 0.1));
    float displacement = noise * 0.12;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const CometFragmentShader = `
  uniform float time;
  uniform float heatIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Hash for variation
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  void main() {
    // Fresnel for edge glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

    // REALISTIC rocky asteroid base - gray/brown with variation
    float rockVariation = hash(vPosition * 2.0);
    vec3 darkRock = vec3(0.15, 0.13, 0.12); // Dark charcoal
    vec3 lightRock = vec3(0.25, 0.22, 0.20); // Lighter gray-brown
    vec3 rockColor = mix(darkRock, lightRock, rockVariation);

    // Cosmic horror heat - starts SUBTLE, becomes supernatural
    // At low intensity: realistic orange/red heat
    // At high intensity: purple/teal/green cosmic colors
    vec3 realisticHeat = vec3(1.0, 0.4, 0.1); // Orange-red
    vec3 cosmicPurple = vec3(0.6, 0.2, 0.8);   // Purple
    vec3 cosmicTeal = vec3(0.2, 0.7, 0.7);     // Teal
    vec3 cosmicGreen = vec3(0.4, 0.9, 0.5);    // Eerie green

    // Mix heat colors - realistic at low intensity, cosmic at high
    vec3 heatColor = realisticHeat;
    if (heatIntensity > 0.3) {
      float cosmicMix = (heatIntensity - 0.3) / 0.7; // 0 to 1
      heatColor = mix(realisticHeat, cosmicPurple, cosmicMix * 0.5);
      heatColor = mix(heatColor, cosmicTeal, cosmicMix * cosmicMix * 0.3);
      heatColor = mix(heatColor, cosmicGreen, sin(time * 2.0) * 0.5 + 0.5 * cosmicMix * 0.2);
    }

    // Apply heat primarily to edges (fresnel) for realistic atmospheric heating
    vec3 finalColor = rockColor;
    finalColor = mix(finalColor, heatColor, fresnel * heatIntensity * 0.8);

    // Add bright rim glow
    vec3 rimColor = mix(vec3(1.0, 0.6, 0.3), heatColor, heatIntensity);
    finalColor += rimColor * fresnel * fresnel * heatIntensity * 3.0;

    // Subtle emissive glow for cosmic horror effect
    finalColor += heatColor * heatIntensity * 0.2;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Particle System Shaders
const ParticleVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float alpha;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    vAlpha = alpha;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ParticleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Reality Crack Shader - Full screen post-processing
const RealityCrackShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'resolution': { value: new THREE.Vector2() },
    'time': { value: 0.0 },
    'intensity': { value: 0.0 },
    'craterCenter': { value: new THREE.Vector2(0.5, 0.67) }, // 2/3 down screen
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float time;
    uniform float intensity;
    uniform vec2 craterCenter;

    varying vec2 vUv;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }

    void main() {
      vec2 uv = vUv;
      vec2 fromCenter = uv - craterCenter;
      float distFromCrater = length(fromCenter);

      // Radial fade - VERY visible at center, fades to normal at edges
      // Larger radius for more prominent effect
      float radialFade = smoothstep(0.35, 0.0, distFromCrater);
      radialFade = radialFade * intensity;

      if (radialFade < 0.001) {
        // Outside effect - normal rendering
        gl_FragColor = texture2D(tDiffuse, uv);
        return;
      }

      // GLASS CRACK PATTERN - MUCH MORE VISIBLE
      float angle = atan(fromCenter.y, fromCenter.x);
      float radius = distFromCrater;

      float cracks = 0.0;

      // Primary radial cracks (18 main rays for denser pattern)
      for(int i = 0; i < 18; i++) {
        float rayAngle = float(i) * 0.349066; // 20 degrees
        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
        // MUCH THICKER cracks
        float ray = smoothstep(0.15, 0.0, angleDiff) * (1.0 - smoothstep(0.0, 0.3, radius));
        cracks = max(cracks, ray * 1.5); // BOOSTED intensity
      }

      // Secondary cracks (12 offset rays)
      for(int i = 0; i < 12; i++) {
        float rayAngle = float(i) * 0.523599 + 0.174533;
        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
        float ray = smoothstep(0.12, 0.0, angleDiff) * (1.0 - smoothstep(0.05, 0.25, radius));
        cracks = max(cracks, ray * 1.2);
      }

      // Tertiary fine cracks for glass-like texture
      for(int i = 0; i < 8; i++) {
        float rayAngle = float(i) * 0.785398 + 0.3927;
        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
        float ray = smoothstep(0.08, 0.0, angleDiff) * (1.0 - smoothstep(0.08, 0.18, radius));
        cracks = max(cracks, ray * 0.9);
      }

      cracks = cracks * radialFade;

      // REALITY WARPING - MUCH MORE DRAMATIC distortion
      vec2 warpOffset = fromCenter * cracks * 0.08 * sin(time * 2.0);
      vec2 distortedUV = uv + warpOffset;

      // Additional kaleidoscope-style warping
      float warpStrength = cracks * radialFade * 0.05;
      distortedUV += vec2(
        sin(uv.y * 20.0 + time) * warpStrength,
        cos(uv.x * 20.0 - time) * warpStrength
      );

      // CHROMATIC ABERRATION - MUCH MORE VISIBLE
      float aberration = cracks * radialFade * 0.025;
      vec3 refracted;
      refracted.r = texture2D(tDiffuse, distortedUV + vec2(aberration, aberration * 0.5)).r;
      refracted.g = texture2D(tDiffuse, distortedUV).g;
      refracted.b = texture2D(tDiffuse, distortedUV - vec2(aberration, aberration * 0.5)).b;

      // COSMIC HORROR GLOW from cracks - SUPER BRIGHT
      vec3 glowColor1 = vec3(0.8, 0.3, 1.0); // Bright Purple
      vec3 glowColor2 = vec3(0.3, 1.0, 0.9); // Bright Teal
      vec3 glowColor3 = vec3(0.5, 1.0, 0.6); // Bright Green

      float pulse = sin(time * 3.0) * 0.5 + 0.5;
      vec3 glowColor = mix(glowColor1, glowColor2, pulse);
      glowColor = mix(glowColor, glowColor3, sin(time * 1.5) * 0.5 + 0.5);

      // MASSIVELY BOOSTED glow intensity
      vec3 crackGlow = glowColor * cracks * radialFade * 25.0;

      // Add white-hot core to cracks
      crackGlow += vec3(1.5, 1.4, 1.5) * cracks * cracks * radialFade * 15.0;

      // Combine
      vec3 finalColor = refracted + crackGlow;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

class ParticleSystem {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  points: THREE.Points;
  maxParticles: number;
  particles: Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    size: number;
    color: THREE.Color;
  }>;

  constructor(maxParticles = 2000) {
    this.maxParticles = maxParticles;
    this.particles = [];

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const alphas = new Float32Array(maxParticles);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: ParticleVertexShader,
      fragmentShader: ParticleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, count: number, color: THREE.Color, size: number, life: number) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const vel = velocity.clone().multiplyScalar(0.5 + Math.random() * 0.5);
      vel.x += (Math.random() - 0.5) * 5;
      vel.y += (Math.random() - 0.5) * 5;
      vel.z += (Math.random() - 0.5) * 5;

      this.particles.push({
        position: position.clone(),
        velocity: vel,
        life: 1.0,
        maxLife: life,
        size: size + Math.random() * size * 0.5,
        color: color.clone(),
      });
    }
  }

  update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;
    const alphas = this.geometry.attributes.alpha.array as Float32Array;

    this.particles = this.particles.filter((p, i) => {
      p.life -= deltaTime / p.maxLife;
      if (p.life <= 0) return false;

      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
      p.velocity.multiplyScalar(0.98);

      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;

      sizes[i] = p.size;
      alphas[i] = p.life * 0.8;

      return true;
    });

    this.geometry.setDrawRange(0, this.particles.length);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
  }

  getMesh() {
    return this.points;
  }
}

// ============================================================================
// SCENE MANAGER
// ============================================================================

class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  crackPass: ShaderPass;

  starfield: THREE.Points | null = null;
  comet: THREE.Mesh | null = null;
  cometMaterial: THREE.ShaderMaterial | null = null;
  particles: ParticleSystem;
  craterGlow: THREE.Mesh | null = null;

  clock: THREE.Clock;
  timeline: {
    phase: 'fade_in' | 'comet_approach' | 'impact' | 'crater_settle' | 'button_reveal' | 'complete';
    time: number;
  };

  onTitleReveal?: () => void;
  onButtonReveal?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 30);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.0, // strength
      0.5, // radius
      0.3  // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.crackPass = new ShaderPass(RealityCrackShader);
    this.crackPass.uniforms['resolution'].value.set(window.innerWidth, window.innerHeight);
    this.composer.addPass(this.crackPass);

    // Systems
    this.particles = new ParticleSystem(3000);
    this.scene.add(this.particles.getMesh());

    this.clock = new THREE.Clock();
    this.timeline = { phase: 'fade_in', time: 0 };

    this.createStarfield();
    this.createComet();

    window.addEventListener('resize', () => this.handleResize());
  }

  createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 30;

      // Realistic star colors - white to slight blue/yellow tint
      const temp = Math.random();
      if (temp < 0.7) {
        // White stars (most common)
        colors[i * 3] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 2] = 1.0;
      } else if (temp < 0.9) {
        // Slight blue tint
        colors[i * 3] = 0.85;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Slight yellow/orange tint
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.8;
      }

      // Varied star sizes for depth - LARGER for visibility
      sizes[i] = Math.random() * 1.5 + 0.5; // 0.5 to 2.0
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.8, // MUCH LARGER for crisp visibility
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.starfield = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starfield);
  }

  createComet() {
    // Larger, more detailed geometry for realistic rocky appearance
    const geometry = new THREE.IcosahedronGeometry(1.2, 4);

    this.cometMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        heatIntensity: { value: 0.0 },
      },
      vertexShader: CometVertexShader,
      fragmentShader: CometFragmentShader,
    });

    this.comet = new THREE.Mesh(geometry, this.cometMaterial);
    // Start at top of screen, will fall to 2/3 down
    this.comet.position.set(0, 40, -30);
    this.comet.scale.set(0.01, 0.01, 0.01);
    this.comet.visible = false;
    this.scene.add(this.comet);

    // Add realistic glow aura
    const glowGeometry = new THREE.IcosahedronGeometry(1.8, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6633ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.comet.add(glow);
  }

  createCraterGlow() {
    const geometry = new THREE.CircleGeometry(15, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0x6633ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.craterGlow = new THREE.Mesh(geometry, material);
    // 2/3 down screen in 3D space
    this.craterGlow.position.set(0, -8, 10);
    this.craterGlow.rotation.x = -Math.PI / 2;
    this.scene.add(this.craterGlow);
  }

  update() {
    const deltaTime = this.clock.getDelta();
    this.timeline.time += deltaTime;

    const t = this.timeline.time;

    // PHASE 1: FADE_IN (0.0 - 1.0s)
    if (this.timeline.phase === 'fade_in') {
      if (this.starfield) {
        const material = this.starfield.material as THREE.PointsMaterial;
        material.opacity = Math.min(t / 1.0, 1.0);

        // Star twinkling
        const sizes = this.starfield.geometry.attributes.size.array as Float32Array;
        const baseSizes = this.starfield.geometry.attributes.size.array as Float32Array;
        for (let i = 0; i < sizes.length; i++) {
          const twinkle = Math.sin(t * 2.5 + i * 0.5) * 0.3 + 0.85;
          sizes[i] = (Math.random() * 1.5 + 0.5) * twinkle;
        }
        this.starfield.geometry.attributes.size.needsUpdate = true;
      }

      if (t > 1.0) {
        this.timeline.phase = 'comet_approach';
        if (this.comet) this.comet.visible = true;
      }
    }

    // PHASE 2: COMET_APPROACH (1.0 - 4.0s) - 3 seconds
    else if (this.timeline.phase === 'comet_approach') {
      if (this.comet && this.cometMaterial) {
        const elapsed = t - 1.0;
        const progress = Math.min(elapsed / 3.0, 1.0);

        // Position - falls from top at 60° angle to 2/3 down screen
        const startY = 40;
        const endY = -8;
        const startZ = -30;
        const endZ = 10;

        // Ease in (accelerating fall like gravity)
        const easedProgress = progress * progress;

        this.comet.position.y = startY + (endY - startY) * easedProgress;
        this.comet.position.z = startZ + (endZ - startZ) * easedProgress;

        // Scale - starts tiny, grows VERY slowly then suddenly large at impact
        const scale = 0.01 + progress * 0.99; // 0.01 to 1.0
        this.comet.scale.set(scale, scale, scale);

        // Rotation for realistic tumbling
        this.comet.rotation.x += deltaTime * 1.8;
        this.comet.rotation.y += deltaTime * 1.3;

        // Heat intensity increases as it accelerates
        this.cometMaterial.uniforms.heatIntensity.value = progress * 0.8;
        this.cometMaterial.uniforms.time.value = t;
      }

      // Continue star twinkling
      if (this.starfield) {
        const sizes = this.starfield.geometry.attributes.size.array as Float32Array;
        for (let i = 0; i < sizes.length; i++) {
          const twinkle = Math.sin(t * 2.5 + i * 0.5) * 0.3 + 0.85;
          sizes[i] = (Math.random() * 1.5 + 0.5) * twinkle;
        }
        this.starfield.geometry.attributes.size.needsUpdate = true;
      }

      if (t > 4.0) {
        this.timeline.phase = 'impact';
        this.createImpact();
      }
    }

    // PHASE 3: IMPACT (4.0 - 4.5s) - 0.5 seconds
    else if (this.timeline.phase === 'impact') {
      const elapsed = t - 4.0;

      // Comet suddenly grows HUGE just before hiding
      if (this.comet && elapsed < 0.1) {
        const explosiveGrowth = 1.0 + (elapsed / 0.1) * 4.0; // Grows to 5x size
        this.comet.scale.set(explosiveGrowth, explosiveGrowth, explosiveGrowth);
      }

      if (elapsed > 0.1 && this.comet) {
        this.comet.visible = false;
      }

      // Camera shake - more intense and longer
      const shakeIntensity = Math.max(0, 1.0 - elapsed / 0.5);
      this.camera.position.x = (Math.random() - 0.5) * shakeIntensity * 0.8;
      this.camera.position.y = (Math.random() - 0.5) * shakeIntensity * 0.5;

      // Bloom spike
      this.bloomPass.strength = 2.0 + shakeIntensity * 4.0;

      if (t > 4.5) {
        this.timeline.phase = 'crater_settle';
        this.createCraterGlow();
      }
    }

    // PHASE 4: CRATER_SETTLE (4.5 - 5.5s) - 1 second
    else if (this.timeline.phase === 'crater_settle') {
      const elapsed = t - 4.5;
      const fadeProgress = Math.min(elapsed / 1.0, 1.0);

      // Camera shake decay
      this.camera.position.x *= 0.92;
      this.camera.position.y *= 0.92;

      // Bloom decay
      this.bloomPass.strength = Math.max(2.0, 6.0 - elapsed * 4.0);

      // Crater glow fade in
      if (this.craterGlow) {
        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        material.opacity = fadeProgress * 0.8;

        // Pulsing
        const pulse = Math.sin(t * 4.0) * 0.2 + 0.9;
        this.craterGlow.scale.set(pulse, pulse, 1);

        // Color shift - purple → teal → green
        const hue = 0.7 + Math.sin(t * 2.0) * 0.2;
        material.color.setHSL(hue, 1.0, 0.55);
      }

      // Reality crack effect fade in - FULL intensity
      this.crackPass.uniforms['intensity'].value = fadeProgress;
      this.crackPass.uniforms['time'].value = t;

      // Title reveal at 0.4s into crater settle
      if (elapsed > 0.4 && this.onTitleReveal) {
        this.onTitleReveal();
        this.onTitleReveal = undefined;
      }

      if (t > 5.5) {
        this.timeline.phase = 'button_reveal';
      }
    }

    // PHASE 5: BUTTON_REVEAL (5.5 - 6.5s) - 1 second
    else if (this.timeline.phase === 'button_reveal') {
      const elapsed = t - 5.5;

      // Continue crater effects
      if (this.craterGlow) {
        const pulse = Math.sin(t * 4.0) * 0.2 + 0.9;
        this.craterGlow.scale.set(pulse, pulse, 1);

        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        const hue = 0.7 + Math.sin(t * 2.0) * 0.2;
        material.color.setHSL(hue, 1.0, 0.55);
      }

      this.crackPass.uniforms['time'].value = t;

      // Button reveal
      if (elapsed > 0.2 && this.onButtonReveal) {
        this.onButtonReveal();
        this.onButtonReveal = undefined;
      }

      if (t > 6.5) {
        this.timeline.phase = 'complete';
      }
    }

    // PHASE 6: COMPLETE - maintain crater effects indefinitely
    else if (this.timeline.phase === 'complete') {
      if (this.craterGlow) {
        const pulse = Math.sin(t * 4.0) * 0.2 + 0.9;
        this.craterGlow.scale.set(pulse, pulse, 1);

        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        const hue = 0.7 + Math.sin(t * 2.0) * 0.2;
        material.color.setHSL(hue, 1.0, 0.55);
      }

      this.crackPass.uniforms['time'].value = t;
    }

    // Update particles
    this.particles.update(deltaTime);

    // Render
    this.composer.render();
  }

  createImpact() {
    const impactPos = new THREE.Vector3(0, -8, 10);

    // Explosion debris - cosmic horror colors
    const purpleColor = new THREE.Color(0.6, 0.2, 0.8);
    const tealColor = new THREE.Color(0.2, 0.8, 0.7);
    const greenColor = new THREE.Color(0.4, 0.9, 0.5);

    for (let i = 0; i < 360; i += 3) {
      const angle = (i / 360) * Math.PI * 2;
      const speed = 15 + Math.random() * 25;

      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * speed * 0.5,
        Math.sin(angle) * speed
      );

      // Mix colors
      const colorChoice = Math.random();
      const color = colorChoice < 0.33 ? purpleColor : colorChoice < 0.66 ? tealColor : greenColor;

      this.particles.emit(impactPos, velocity, 2, color, 12 + Math.random() * 8, 0.6);
    }
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.crackPass.uniforms['resolution'].value.set(window.innerWidth, window.innerHeight);
  }

  dispose() {
    this.renderer.dispose();
  }
}

// ============================================================================
// REACT COMPONENT
// ============================================================================

export function IntroScreen({ onBegin }: { onBegin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sceneManager = new SceneManager(canvasRef.current);
    sceneManagerRef.current = sceneManager;

    sceneManager.onTitleReveal = () => setShowTitle(true);
    sceneManager.onButtonReveal = () => setShowButton(true);

    let animationId: number;
    const animate = () => {
      sceneManager.update();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      sceneManager.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" style={{ display: 'block' }} />

      {/* Title - Glitches in with RGB split + scan lines + corruption */}
      {showTitle && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            top: '30%',
            animation: 'glitchIn 0.6s ease-out both',
          }}
        >
          <h1
            className="text-8xl font-bold text-white tracking-widest select-none glitch-text"
            style={{
              fontFamily: "'Rubik Burned', cursive",
              textShadow: `
                2px 0 0 rgba(255, 0, 255, 0.7),
                -2px 0 0 rgba(0, 255, 255, 0.7),
                0 0 40px rgba(150, 100, 200, 0.8)
              `,
            }}
          >
            THE FINAL DESCENT
          </h1>
        </div>
      )}

      {/* Button - Glitches in over crater */}
      {showButton && (
        <div
          className="absolute left-1/2 pointer-events-auto"
          style={{
            top: '66%',
            transform: 'translateX(-50%)',
            animation: 'glitchIn 0.5s ease-out 0.1s both',
          }}
        >
          <button
            onClick={onBegin}
            className="cursor-pointer transition-all duration-200 hover:scale-110 glitch-text"
            style={{
              fontFamily: "'Rubik Marker Hatch', cursive",
              fontSize: '2rem',
              color: 'white',
              background: 'transparent',
              border: 'none',
              padding: '0.5rem 1rem',
              textShadow: `
                1px 0 0 rgba(255, 0, 255, 0.6),
                -1px 0 0 rgba(0, 255, 255, 0.6),
                0 0 20px rgba(150, 255, 200, 0.8)
              `,
            }}
          >
            BEGIN THE DESCENT
          </button>
        </div>
      )}

      <style>{`
        @keyframes glitchIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
            filter: blur(10px);
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 55%);
          }
          20% {
            opacity: 0.3;
            transform: translateY(-10px) translateX(-5px) scale(0.9);
            filter: blur(5px);
            clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%);
          }
          40% {
            opacity: 0.6;
            transform: translateY(-5px) translateX(3px) scale(0.95);
            filter: blur(2px);
            clip-path: polygon(0 0, 100% 5%, 100% 95%, 0 100%);
          }
          60% {
            opacity: 0.8;
            transform: translateY(0) translateX(-2px) scale(1.02);
            filter: blur(1px);
            clip-path: polygon(0 2%, 100% 0, 100% 98%, 0 100%);
          }
          80% {
            opacity: 1;
            transform: translateY(0) translateX(1px) scale(1.01);
            filter: blur(0px);
            clip-path: polygon(0 0, 100% 1%, 100% 99%, 0 100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
            filter: blur(0px);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }

        .glitch-text {
          position: relative;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }

        .glitch-text::before {
          animation: glitchBefore 0.3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }

        .glitch-text::after {
          animation: glitchAfter 0.3s infinite reverse;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }

        @keyframes glitchBefore {
          0%, 100% { transform: translateX(0); }
          33% { transform: translateX(-2px); }
          66% { transform: translateX(2px); }
        }

        @keyframes glitchAfter {
          0%, 100% { transform: translateX(0); }
          33% { transform: translateX(2px); }
          66% { transform: translateX(-2px); }
        }
      `}</style>
    </div>
  );
}
