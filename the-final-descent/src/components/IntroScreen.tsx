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
    // REALISTIC rocky asteroid texture
    float rockNoise1 = hash(vPosition * 3.0);
    float rockNoise2 = hash(vPosition * 7.0);
    float rockNoise3 = hash(vPosition * 15.0);

    // Multi-scale noise for realistic rock surface
    float combinedNoise = rockNoise1 * 0.5 + rockNoise2 * 0.3 + rockNoise3 * 0.2;

    // Realistic asteroid colors - dark gray with subtle brown/tan variations
    vec3 darkGray = vec3(0.12, 0.11, 0.10);    // Very dark charcoal
    vec3 mediumGray = vec3(0.20, 0.18, 0.16);  // Medium gray
    vec3 lightGray = vec3(0.28, 0.25, 0.22);   // Lighter gray-brown
    vec3 tanColor = vec3(0.25, 0.20, 0.15);    // Subtle tan

    // Mix rock colors based on noise
    vec3 rockColor = mix(darkGray, mediumGray, rockNoise1);
    rockColor = mix(rockColor, lightGray, rockNoise2 * 0.5);
    rockColor = mix(rockColor, tanColor, rockNoise3 * 0.3);

    // Fresnel for edge definition
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.5);

    // Realistic atmospheric entry heat - orange/red on leading edge
    vec3 heatColor = vec3(1.0, 0.3, 0.05); // Bright orange-red

    // Only add heat if intensity is significant
    vec3 finalColor = rockColor;
    if (heatIntensity > 0.1) {
      // Heat concentrated on leading edge (fresnel)
      float heatAmount = fresnel * heatIntensity;

      // Add cosmic horror tint only at very high intensity
      if (heatIntensity > 0.6) {
        vec3 cosmicPurple = vec3(0.5, 0.1, 0.6);
        float cosmicMix = (heatIntensity - 0.6) / 0.4;
        heatColor = mix(heatColor, cosmicPurple, cosmicMix * 0.3);
      }

      finalColor = mix(finalColor, heatColor, heatAmount * 0.6);

      // Bright rim only at very edge
      finalColor += heatColor * pow(fresnel, 4.0) * heatIntensity * 1.5;
    }

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

// Reality Crack Shader - Enhanced Voronoi-based glass shatter effect
const RealityCrackShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'resolution': { value: new THREE.Vector2() },
    'time': { value: 0.0 },
    'intensity': { value: 0.0 },
    'crackPhase': { value: 0.0 }, // 0-1: crack expansion animation
    'craterCenter': { value: new THREE.Vector2(0.5, 0.67) },
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
    uniform float crackPhase;
    uniform vec2 craterCenter;

    varying vec2 vUv;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec2 hash22(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453123);
    }

    // Enhanced Voronoi with distance to edge
    vec3 voronoi(vec2 x) {
      vec2 n = floor(x);
      vec2 f = fract(x);

      float minDist1 = 8.0;
      float minDist2 = 8.0;
      vec2 minPoint = vec2(0.0);

      for(int j = -1; j <= 1; j++) {
        for(int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j));
          vec2 o = hash22(n + g);
          vec2 r = g + o - f;
          float d = dot(r, r);

          if(d < minDist1) {
            minDist2 = minDist1;
            minDist1 = d;
            minPoint = r;
          } else if(d < minDist2) {
            minDist2 = d;
          }
        }
      }

      // Return: closest distance, second closest (for edges), cell center
      return vec3(minDist1, minDist2, 0.0);
    }

    void main() {
      vec2 uv = vUv;
      vec2 fromCenter = uv - craterCenter;
      float distFromCrater = length(fromCenter);

      // Soft outer edge fade - gradual falloff instead of hard cutoff
      float radialFade = smoothstep(0.55, 0.0, distFromCrater);
      radialFade = radialFade * intensity;

      if (radialFade < 0.001) {
        gl_FragColor = texture2D(tDiffuse, uv);
        return;
      }

      // Create glass shards using Voronoi cells - more fragments for realism
      float shardScale = 25.0 + sin(time * 0.5) * 2.0; // Subtle variation
      vec2 shardUV = (uv - craterCenter) * shardScale;
      vec3 voronoiData = voronoi(shardUV);
      float cellDist1 = voronoiData.x;
      float cellDist2 = voronoiData.y;

      // Create sharper crack lines using edge distance - ONLY Voronoi cracks
      float edgeDist = cellDist2 - cellDist1;
      float crackLine = smoothstep(0.08, 0.0, edgeDist);

      // All cracks come from Voronoi cells only (no radial burst lines)
      float allCracks = crackLine;
      allCracks = clamp(allCracks * 2.5, 0.0, 1.0);

      // Enhanced per-shard separation and distortion for visible warping
      vec2 cellId = floor(shardUV);
      float shardRotation = hash21(cellId) * 6.28318;
      float shardSeparation = crackPhase * 0.04; // Increased from 0.02 for more visible separation

      vec2 shardOffset = vec2(
        cos(shardRotation),
        sin(shardRotation)
      ) * sqrt(cellDist1) * shardSeparation * radialFade;

      vec2 distortedUV = uv + shardOffset;

      // ENHANCED chromatic aberration - much more visible warping
      float aberrationStrength = radialFade * 0.02 * (1.0 + allCracks * 3.0); // Increased from 0.008
      vec3 color;
      color.r = texture2D(tDiffuse, distortedUV + vec2(aberrationStrength, 0.0)).r;
      color.g = texture2D(tDiffuse, distortedUV).g;
      color.b = texture2D(tDiffuse, distortedUV - vec2(aberrationStrength, 0.0)).b;

      // SEMI-TRANSPARENT DARK CRACKS - reduced opacity for 50% glass effect
      float crackDarkness = allCracks * 0.5; // Reduced from 0.95 to allow transparency
      color = mix(color, vec3(0.0), crackDarkness);

      // Bright white-hot edges on fresh cracks (fades over time)
      float freshness = 1.0 - crackPhase;
      vec3 hotEdgeColor = vec3(2.0, 1.8, 1.5); // Bright white-orange
      float crackEdge = allCracks * (1.0 - allCracks) * 12.0;
      crackEdge = smoothstep(0.4, 0.8, crackEdge);
      color += hotEdgeColor * crackEdge * radialFade * 0.3 * freshness;

      // Subtle purple/teal glow as cracks cool
      vec3 glowColor = mix(
        vec3(0.4, 0.15, 0.5),
        vec3(0.15, 0.5, 0.45),
        sin(time * 2.0) * 0.5 + 0.5
      );
      color += glowColor * crackEdge * radialFade * 0.15 * crackPhase;

      // Reflective/shiny glass surfaces - both shimmer and bright edge reflections
      float shimmer = sin(time * 3.0 + hash21(cellId) * 6.28) * 0.5 + 0.5;
      color += vec3(0.2, 0.25, 0.3) * shimmer * radialFade * 0.08 * (1.0 - allCracks);

      // Mirror-like reflections on shard edges - bright white highlights
      float edgeProximity = smoothstep(0.15, 0.05, edgeDist);
      vec3 reflectionColor = vec3(1.0, 1.0, 1.0); // Bright white reflection
      float reflectionStrength = edgeProximity * (1.0 - allCracks) * radialFade;
      color += reflectionColor * reflectionStrength * 0.4;

      // Desaturation and darkening of shattered area
      float desaturate = radialFade * 0.3;
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(color, vec3(luminance) * 0.75, desaturate);

      // 50% opacity for entire glass effect with smooth outer fade
      float finalAlpha = radialFade * 0.5;

      gl_FragColor = vec4(color, finalAlpha);
    }
  `
};

// ============================================================================
// PARTICLE SYSTEMS
// ============================================================================

// Glass Dust Particle System - for reality shatter effect
class GlassDustParticles {
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
    rotation: number;
    rotationSpeed: number;
  }>;

  constructor(maxParticles = 1000) {
    this.maxParticles = maxParticles;
    this.particles = [];

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const alphas = new Float32Array(maxParticles);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;

        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);

          // Square shape for glass shards
          float shard = smoothstep(0.5, 0.3, dist);

          // Add sparkle
          float sparkle = pow(1.0 - dist * 2.0, 3.0);

          float alpha = (shard + sparkle * 0.5) * vAlpha;

          if (alpha < 0.01) discard;

          // White/bright color for glass
          vec3 color = vec3(0.9, 0.95, 1.0) + vec3(sparkle * 0.5);

          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  emit(position: THREE.Vector3, direction: THREE.Vector3, count: number) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const vel = direction.clone();
      vel.x += (Math.random() - 0.5) * 8;
      vel.y += (Math.random() - 0.5) * 8;
      vel.z += (Math.random() - 0.5) * 8;

      this.particles.push({
        position: position.clone(),
        velocity: vel,
        life: 1.0,
        maxLife: 0.8 + Math.random() * 0.4, // 0.8-1.2 seconds
        size: 0.3 + Math.random() * 1.2, // Small glass shards
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 4,
      });
    }
  }

  update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;
    const alphas = this.geometry.attributes.alpha.array as Float32Array;

    this.particles = this.particles.filter((p, i) => {
      p.life -= deltaTime / p.maxLife;
      if (p.life <= 0) return false;

      // Apply gravity
      p.velocity.y -= 9.8 * deltaTime * 0.3;

      // Update position
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));

      // Air resistance
      p.velocity.multiplyScalar(0.985);

      // Update rotation
      p.rotation += p.rotationSpeed * deltaTime;

      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      sizes[i] = p.size;
      alphas[i] = p.life;

      return true;
    });

    this.geometry.setDrawRange(0, this.particles.length);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
  }

  getMesh() {
    return this.points;
  }
}

// Explosion Particle System
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
  starOriginalPositions: Float32Array | null = null;
  comet: THREE.Mesh | null = null;
  cometMaterial: THREE.ShaderMaterial | null = null;
  particles: ParticleSystem;
  glassDust: GlassDustParticles;
  craterGlow: THREE.Group | null = null;
  blackHolePosition: THREE.Vector3 = new THREE.Vector3(0, -8, 10);
  starsPulledIn: Set<number> = new Set();

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

    this.glassDust = new GlassDustParticles(1000);
    this.scene.add(this.glassDust.getMesh());

    this.clock = new THREE.Clock();
    this.timeline = { phase: 'fade_in', time: 0 };

    this.createStarfield();
    this.createComet();

    window.addEventListener('resize', () => this.handleResize());
  }

  createStarTexture() {
    // Create crisp circular texture for stars
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Draw crisp white circle
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
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

    // Store original positions for black hole pulling effect
    this.starOriginalPositions = new Float32Array(positions);

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.3, // Small and CRISP - not pixelated blobs
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      map: this.createStarTexture(), // Use circle texture for crisp edges
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
    const impactPoint = new THREE.Vector3(0, -8, 10);
    this.blackHolePosition.copy(impactPoint);

    // Create 3D BLACK HOLE GROUP
    const blackHoleGroup = new THREE.Group();
    blackHoleGroup.position.copy(impactPoint);

    // 1. EVENT HORIZON - Pure black sphere at center
    const eventHorizonGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const eventHorizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 1.0,
    });
    const eventHorizon = new THREE.Mesh(eventHorizonGeometry, eventHorizonMaterial);
    blackHoleGroup.add(eventHorizon);

    // 2. VOLUMETRIC INNER CORE - Swirling dark energy
    const innerCoreGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const innerCoreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;

        // Noise function for swirling patterns
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
        }

        void main() {
          // Create swirling vortex pattern
          float angle = atan(vPosition.y, vPosition.x);
          float radius = length(vPosition.xy);

          // Multiple layers of spirals
          float spiral1 = sin(angle * 5.0 + radius * 2.0 - time * 3.0);
          float spiral2 = sin(angle * 7.0 - radius * 3.0 + time * 2.0);
          float spiral3 = sin(angle * 11.0 + radius * 1.5 - time * 4.0);

          float pattern = (spiral1 + spiral2 * 0.5 + spiral3 * 0.3) * 0.5 + 0.5;

          // Add depth-based fade (more transparent toward edges)
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);

          // Color - dark purple/teal swirl
          vec3 purple = vec3(0.3, 0.05, 0.4);
          vec3 teal = vec3(0.05, 0.3, 0.35);
          vec3 color = mix(purple, teal, pattern);

          // Pulsing intensity
          float pulse = sin(time * 1.5) * 0.2 + 0.8;
          color *= pulse;

          float alpha = pattern * fresnel * 0.6;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
    blackHoleGroup.add(innerCore);

    // 3. ACCRETION DISK - Rotating disk of matter
    const diskGeometry = new THREE.RingGeometry(3, 10, 64);
    const diskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 fromCenter = vUv - center;
          float dist = length(fromCenter) * 2.0;
          float angle = atan(fromCenter.y, fromCenter.x);

          // Multi-layered spiral arms
          float spiral1 = sin(angle * 3.0 - dist * 2.0 + time * 2.0);
          float spiral2 = sin(angle * 5.0 + dist * 1.5 - time * 1.5);
          float spiral3 = sin(angle * 7.0 - dist * 3.0 + time * 2.5);

          float pattern = (spiral1 + spiral2 * 0.6 + spiral3 * 0.4) * 0.5 + 0.5;

          // Radial fade
          float radialFade = smoothstep(1.0, 0.3, dist) * smoothstep(0.15, 0.4, dist);

          // Color gradient from inner (hot) to outer (cool)
          vec3 innerColor = vec3(0.6, 0.2, 0.8); // Bright purple
          vec3 outerColor = vec3(0.1, 0.4, 0.5); // Dark teal
          vec3 color = mix(innerColor, outerColor, dist * 0.7);

          // Add bright hotspots
          float hotspot = pow(pattern, 3.0);
          color += vec3(0.4, 0.3, 0.5) * hotspot * (1.0 - dist);

          float alpha = radialFade * (0.4 + pattern * 0.3);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDisk.rotation.x = -Math.PI / 2.5; // Tilt for 3D effect
    blackHoleGroup.add(accretionDisk);

    // 4. OUTER GLOW - Subtle atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(5, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;

        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 3.0);

          vec3 glowColor = vec3(0.2, 0.1, 0.3);
          float pulse = sin(time * 2.0) * 0.3 + 0.7;

          float alpha = fresnel * 0.15 * pulse;

          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const outerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    blackHoleGroup.add(outerGlow);

    // Store references
    blackHoleGroup.userData.eventHorizon = eventHorizon;
    blackHoleGroup.userData.innerCore = innerCore;
    blackHoleGroup.userData.accretionDisk = accretionDisk;
    blackHoleGroup.userData.outerGlow = outerGlow;

    this.craterGlow = blackHoleGroup;
    this.scene.add(blackHoleGroup);
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

      // 3D Black hole - rotate in multiple axes for full 3D effect
      if (this.craterGlow) {
        // Update all shader uniforms
        const innerCore = this.craterGlow.userData.innerCore;
        const accretionDisk = this.craterGlow.userData.accretionDisk;
        const outerGlow = this.craterGlow.userData.outerGlow;

        if (innerCore) {
          (innerCore.material as THREE.ShaderMaterial).uniforms.time.value = t;
        }
        if (accretionDisk) {
          (accretionDisk.material as THREE.ShaderMaterial).uniforms.time.value = t;
        }
        if (outerGlow) {
          (outerGlow.material as THREE.ShaderMaterial).uniforms.time.value = t;
        }

        // Fade in black hole
        this.craterGlow.scale.setScalar(fadeProgress);

        // 3D Rotation - multiple axes for depth
        this.craterGlow.rotation.y += deltaTime * 0.3; // Slow Y rotation
        this.craterGlow.rotation.z += deltaTime * 0.15; // Slow Z wobble

        // Accretion disk rotates faster
        if (accretionDisk) {
          accretionDisk.rotation.z += deltaTime * 2.0;
        }

        // Inner core counter-rotates
        if (innerCore) {
          innerCore.rotation.y -= deltaTime * 0.8;
        }
      }

      // Pull stars into black hole
      this.pullStarsIntoBlackHole(deltaTime);

      // Glass dust particles - emit from crack lines
      if (elapsed < 0.6) { // First 600ms of crater settle
        const crackCenter = new THREE.Vector3(0, -8, 10);
        for (let i = 0; i < 24; i++) { // 24 radial cracks
          const angle = (i / 24) * Math.PI * 2;
          const distance = 5 + Math.random() * 8;

          const particlePos = crackCenter.clone();
          particlePos.x += Math.cos(angle) * distance;
          particlePos.y += Math.sin(angle) * distance * 0.3; // Flatter on Y
          particlePos.z += Math.sin(angle) * distance;

          const particleDir = new THREE.Vector3(
            Math.cos(angle) * 3,
            Math.random() * 4 - 1,
            Math.sin(angle) * 3
          );

          this.glassDust.emit(particlePos, particleDir, 2);
        }
      }

      // Reality crack effect fade in with animated crack expansion
      this.crackPass.uniforms['intensity'].value = fadeProgress;
      this.crackPass.uniforms['crackPhase'].value = fadeProgress;
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

      // Continue 3D black hole rotation
      if (this.craterGlow) {
        const innerCore = this.craterGlow.userData.innerCore;
        const accretionDisk = this.craterGlow.userData.accretionDisk;
        const outerGlow = this.craterGlow.userData.outerGlow;

        if (innerCore) {
          (innerCore.material as THREE.ShaderMaterial).uniforms.time.value = t;
          innerCore.rotation.y -= deltaTime * 0.8;
        }
        if (accretionDisk) {
          (accretionDisk.material as THREE.ShaderMaterial).uniforms.time.value = t;
          accretionDisk.rotation.z += deltaTime * 2.0;
        }
        if (outerGlow) {
          (outerGlow.material as THREE.ShaderMaterial).uniforms.time.value = t;
        }

        this.craterGlow.rotation.y += deltaTime * 0.3;
        this.craterGlow.rotation.z += deltaTime * 0.15;
      }

      // Continue pulling stars
      this.pullStarsIntoBlackHole(deltaTime);

      this.crackPass.uniforms['crackPhase'].value = 1.0; // Fully expanded
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

    // PHASE 6: COMPLETE - maintain black hole effects indefinitely
    else if (this.timeline.phase === 'complete') {
      if (this.craterGlow) {
        const innerCore = this.craterGlow.userData.innerCore;
        const accretionDisk = this.craterGlow.userData.accretionDisk;
        const outerGlow = this.craterGlow.userData.outerGlow;

        if (innerCore) {
          (innerCore.material as THREE.ShaderMaterial).uniforms.time.value = t;
          innerCore.rotation.y -= deltaTime * 0.8;
        }
        if (accretionDisk) {
          (accretionDisk.material as THREE.ShaderMaterial).uniforms.time.value = t;
          accretionDisk.rotation.z += deltaTime * 2.0;
        }
        if (outerGlow) {
          (outerGlow.material as THREE.ShaderMaterial).uniforms.time.value = t;
        }

        this.craterGlow.rotation.y += deltaTime * 0.3;
        this.craterGlow.rotation.z += deltaTime * 0.15;
      }

      // Continue pulling stars
      this.pullStarsIntoBlackHole(deltaTime);

      this.crackPass.uniforms['crackPhase'].value = 1.0;
      this.crackPass.uniforms['time'].value = t;
    }

    // Update particles
    this.particles.update(deltaTime);
    this.glassDust.update(deltaTime);

    // Render
    this.composer.render();
  }

  pullStarsIntoBlackHole(deltaTime: number) {
    if (!this.starfield || !this.starOriginalPositions) return;

    const positions = this.starfield.geometry.attributes.position.array as Float32Array;
    const sizes = this.starfield.geometry.attributes.size.array as Float32Array;
    const starCount = positions.length / 3;

    // Select a few nearby stars to pull in (only once)
    if (this.starsPulledIn.size === 0) {
      for (let i = 0; i < starCount; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        const dx = x - this.blackHolePosition.x;
        const dy = y - this.blackHolePosition.y;
        const dz = z - this.blackHolePosition.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Select stars within range (about 5-10% of nearby stars)
        if (dist < 30 && Math.random() < 0.08) {
          this.starsPulledIn.add(i);
        }
      }
    }

    // Pull selected stars toward black hole
    this.starsPulledIn.forEach((starIndex) => {
      const i = starIndex * 3;

      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const dx = this.blackHolePosition.x - x;
      const dy = this.blackHolePosition.y - y;
      const dz = this.blackHolePosition.z - z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Gravitational pull - stronger as star gets closer
      const pullStrength = deltaTime * 15 / (dist * 0.5 + 1);

      positions[i] += dx * pullStrength;
      positions[i + 1] += dy * pullStrength;
      positions[i + 2] += dz * pullStrength;

      // Fade out and shrink star as it gets absorbed
      if (dist < 3) {
        sizes[starIndex] *= 0.95;
      }
    });

    this.starfield.geometry.attributes.position.needsUpdate = true;
    this.starfield.geometry.attributes.size.needsUpdate = true;
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
  const [titleGlitch, setTitleGlitch] = useState(false);
  const [buttonGlitch, setButtonGlitch] = useState(false);

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

  // Occasional glitching for title
  useEffect(() => {
    if (!showTitle) return;

    const scheduleNextGlitch = () => {
      const delay = 3000 + Math.random() * 4000; // 3-7 seconds
      return setTimeout(() => {
        setTitleGlitch(true);
        setTimeout(() => {
          setTitleGlitch(false);
          scheduleNextGlitch();
        }, 150); // 150ms flicker
      }, delay);
    };

    const timeoutId = scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, [showTitle]);

  // Occasional glitching for button
  useEffect(() => {
    if (!showButton) return;

    const scheduleNextGlitch = () => {
      const delay = 3000 + Math.random() * 4000; // 3-7 seconds
      return setTimeout(() => {
        setButtonGlitch(true);
        setTimeout(() => {
          setButtonGlitch(false);
          scheduleNextGlitch();
        }, 150); // 150ms flicker
      }, delay);
    };

    const timeoutId = scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, [showButton]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" style={{ display: 'block' }} />

      {/* Title - Glitches in with RGB split + scan lines + corruption */}
      {showTitle && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            top: '30%',
            animation: titleGlitch ? 'quickGlitch 0.15s ease-in-out' : 'glitchIn 0.6s ease-out both',
          }}
        >
          <h1
            className="text-8xl font-bold text-white tracking-widest select-none glitch-text"
            style={{
              fontFamily: "'Rajdhani', 'Arial', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.25em',
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
            animation: buttonGlitch ? 'quickGlitch 0.15s ease-in-out' : 'glitchIn 0.5s ease-out 0.1s both',
          }}
        >
          <button
            onClick={onBegin}
            className="cursor-pointer transition-all duration-200 hover:scale-110 glitch-text"
            style={{
              fontFamily: "'Rajdhani', 'Arial', sans-serif",
              fontWeight: 600,
              fontSize: '1rem', // 50% smaller (was 2rem)
              letterSpacing: '0.2em',
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
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap');

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

        @keyframes quickGlitch {
          0%, 100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0px);
          }
          25% {
            opacity: 0.3;
            transform: translateX(-8px);
            filter: blur(3px);
          }
          50% {
            opacity: 0;
            transform: translateX(8px) translateY(3px);
            filter: blur(5px);
          }
          75% {
            opacity: 0.4;
            transform: translateX(-5px);
            filter: blur(2px);
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
