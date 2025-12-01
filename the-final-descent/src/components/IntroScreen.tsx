/**
 * IntroScreen - Premium Cinematic Three.js Experience
 * Production-grade meteor impact with advanced VFX
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

// ============================================================================
// CUSTOM SHADERS
// ============================================================================

const MeteorVertexShader = `
  uniform float time;
  uniform float heatIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simplex noise function
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
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Add noise-based displacement for rocky surface
    float noise = snoise(position * 0.8 + vec3(time * 0.1));
    float displacement = noise * 0.15;
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const MeteorFragmentShader = `
  uniform float time;
  uniform float heatIntensity;
  uniform vec3 meteorVelocity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Fresnel for leading edge glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

    // Heat based on velocity direction (front is hottest)
    float heatFalloff = dot(normalize(vPosition), normalize(meteorVelocity));
    heatFalloff = smoothstep(-0.5, 1.0, heatFalloff);

    // Base rock color with variation
    vec3 rockColor = vec3(0.25, 0.22, 0.20) * (1.0 + vDisplacement * 0.5);

    // Emissive heat gradient: white hot → yellow → orange → red
    vec3 heatColor = mix(
      vec3(0.4, 0.1, 0.05),  // Dim red
      vec3(1.0, 0.95, 0.85), // White hot
      heatFalloff * heatIntensity
    );

    if (heatFalloff * heatIntensity > 0.6) {
      heatColor = mix(heatColor, vec3(1.0, 0.7, 0.3), (heatFalloff * heatIntensity - 0.6) * 2.5);
    }

    // Combine rock and heat
    vec3 finalColor = mix(rockColor, heatColor, fresnel * 0.6 + heatFalloff * heatIntensity * 0.8);

    // Add bright fresnel rim
    finalColor += vec3(1.0, 0.8, 0.5) * fresnel * heatIntensity * 2.0;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const TrailParticleVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float alpha;
  attribute float rotation;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vRotation;

  void main() {
    vColor = color;
    vAlpha = alpha;
    vRotation = rotation;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const TrailParticleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRotation;

  void main() {
    vec2 center = gl_PointCoord - 0.5;

    // Rotate
    float s = sin(vRotation);
    float c = cos(vRotation);
    vec2 rotated = vec2(
      c * center.x - s * center.y,
      s * center.x + c * center.y
    );

    // Soft circular falloff with noise
    float dist = length(rotated);
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

const RefractionShardVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec4 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    vWorldPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RefractionShardFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float time;
  uniform float refractionStrength;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec4 vWorldPosition;

  void main() {
    vec2 screenUV = gl_FragCoord.xy / resolution;

    // Calculate refraction offset based on normal
    vec3 viewDir = normalize(cameraPosition - vWorldPosition.xyz);
    vec3 refractDir = refract(viewDir, vNormal, 0.9);
    vec2 refractOffset = refractDir.xy * refractionStrength * 0.05;

    // Sample background with chromatic dispersion
    vec2 uv = screenUV + refractOffset;
    float r = texture2D(tDiffuse, uv + refractOffset * 0.01).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - refractOffset * 0.01).b;

    vec3 refractedColor = vec3(r, g, b);

    // Edge highlight (Fresnel)
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
    vec3 edgeGlow = vec3(0.6, 0.4, 0.9) * fresnel * 0.5;

    // Slight purple tint
    vec3 finalColor = mix(refractedColor, refractedColor * vec3(0.9, 0.85, 1.1), 0.15);
    finalColor += edgeGlow;

    gl_FragColor = vec4(finalColor, 0.85 + fresnel * 0.15);
  }
`;

// Chromatic Aberration Shader
const ChromaticAberrationShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'amount': { value: 0.0 }
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
    uniform float amount;
    varying vec2 vUv;

    void main() {
      vec2 offset = vec2(amount, 0.0);
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

// Film Grain Shader
const FilmGrainShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'time': { value: 0.0 },
    'amount': { value: 0.15 }
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
    uniform float time;
    uniform float amount;
    varying vec2 vUv;

    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float noise = random(vUv + time) * amount;
      gl_FragColor = vec4(color.rgb + noise - amount * 0.5, color.a);
    }
  `
};

// ============================================================================
// PARTICLE SYSTEMS
// ============================================================================

class TrailParticleSystem {
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
    type: 'plasma' | 'ember' | 'smoke';
  }>;

  constructor(maxParticles = 2000) {
    this.maxParticles = maxParticles;
    this.particles = [];

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const alphas = new Float32Array(maxParticles);
    const rotations = new Float32Array(maxParticles);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    this.geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));

    // Create material
    this.material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: TrailParticleVertexShader,
      fragmentShader: TrailParticleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, count: number, type: 'plasma' | 'ember' | 'smoke') {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const spreadAngle = type === 'plasma' ? 0.3 : type === 'ember' ? 0.8 : 1.2;
      const vel = velocity.clone().multiplyScalar(0.3 + Math.random() * 0.7);
      vel.x += (Math.random() - 0.5) * spreadAngle;
      vel.y += (Math.random() - 0.5) * spreadAngle;
      vel.z += (Math.random() - 0.5) * spreadAngle;

      this.particles.push({
        position: position.clone(),
        velocity: vel,
        life: 1.0,
        maxLife: type === 'plasma' ? 0.4 : type === 'ember' ? 0.8 : 1.5,
        size: type === 'plasma' ? 15 + Math.random() * 10 : type === 'ember' ? 8 + Math.random() * 6 : 25 + Math.random() * 15,
        type
      });
    }
  }

  update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;
    const alphas = this.geometry.attributes.alpha.array as Float32Array;
    const rotations = this.geometry.attributes.rotation.array as Float32Array;

    this.particles = this.particles.filter((p, i) => {
      p.life -= deltaTime / p.maxLife;
      if (p.life <= 0) return false;

      // Update physics
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
      p.velocity.multiplyScalar(0.98); // Friction
      if (p.type === 'smoke') {
        p.velocity.y += deltaTime * 2; // Smoke rises
      }

      // Update attributes
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      // Color based on type and life
      let r, g, b;
      if (p.type === 'plasma') {
        const temp = p.life;
        r = 1.0;
        g = 0.8 * temp + 0.4 * (1 - temp);
        b = 0.3 * temp;
      } else if (p.type === 'ember') {
        const temp = p.life * 0.7 + 0.3;
        r = 1.0;
        g = 0.3 + temp * 0.4;
        b = 0.1 * temp;
      } else { // smoke
        const gray = 0.15 + (1 - p.life) * 0.1;
        r = g = b = gray;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;

      sizes[i] = p.size * (p.type === 'smoke' ? (1 + (1 - p.life) * 2) : 1);
      alphas[i] = p.life * (p.type === 'plasma' ? 0.9 : p.type === 'ember' ? 0.8 : 0.6);
      rotations[i] = p.life * Math.PI * 2;

      return true;
    });

    this.geometry.setDrawRange(0, this.particles.length);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
    this.geometry.attributes.rotation.needsUpdate = true;
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
  chromaPass: ShaderPass;
  grainPass: ShaderPass;

  meteorMesh: THREE.Mesh | null = null;
  meteorMaterial: THREE.ShaderMaterial | null = null;
  trailSystem: TrailParticleSystem;
  explosionSystem: TrailParticleSystem;
  shardsMeshes: THREE.Mesh[] = [];
  starfield: THREE.Points | null = null;
  starOriginalPositions: Float32Array | null = null;
  craterGlow: THREE.Mesh | null = null;
  shockwaveRings: THREE.Mesh[] = [];

  clock: THREE.Clock;
  timeline: {
    phase: 'intro' | 'meteor' | 'impact' | 'crater' | 'complete';
    time: number;
    meteorStartTime: number;
    impactTime: number;
  };

  onImpact?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 30);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Postprocessing
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.chromaPass = new ShaderPass(ChromaticAberrationShader);
    this.chromaPass.uniforms['amount'].value = 0.0;
    this.composer.addPass(this.chromaPass);

    this.grainPass = new ShaderPass(FilmGrainShader);
    this.grainPass.uniforms['amount'].value = 0.15;
    this.composer.addPass(this.grainPass);

    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms['resolution'].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
    this.composer.addPass(fxaaPass);

    // Systems
    this.trailSystem = new TrailParticleSystem(3000);
    this.scene.add(this.trailSystem.getMesh());

    this.explosionSystem = new TrailParticleSystem(5000);
    this.scene.add(this.explosionSystem.getMesh());

    this.clock = new THREE.Clock();
    this.timeline = {
      phase: 'intro',
      time: 0,
      meteorStartTime: 0,
      impactTime: 0,
    };

    // Initialize
    this.createStarfield();
    this.createMeteor();

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
  }

  createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;

      const temp = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0.8 + temp * 0.2;
      colors[i * 3 + 1] = 0.8 + temp * 0.2;
      colors[i * 3 + 2] = 0.9 + temp * 0.1;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    // Store original positions for gravitational pull effect
    this.starOriginalPositions = new Float32Array(positions);

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    this.starfield = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starfield);
  }

  createMeteor() {
    // Reduced size by 40% (from 2 to 1.2)
    const geometry = new THREE.IcosahedronGeometry(1.2, 3);

    this.meteorMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        heatIntensity: { value: 1.0 },
        meteorVelocity: { value: new THREE.Vector3(0, -1, 0) },
      },
      vertexShader: MeteorVertexShader,
      fragmentShader: MeteorFragmentShader,
    });

    this.meteorMesh = new THREE.Mesh(geometry, this.meteorMaterial);
    // Start position adjusted for 60-degree angle approach
    this.meteorMesh.position.set(20, 80, -40);
    this.meteorMesh.scale.set(0.1, 0.1, 0.1); // Start small
    this.meteorMesh.visible = false;
    this.scene.add(this.meteorMesh);

    // Add meteor glow (proportionally reduced)
    const glowGeometry = new THREE.IcosahedronGeometry(2.1, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8844,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.meteorMesh.add(glow);
  }

  startMeteor() {
    console.log('Starting meteor sequence');
    this.timeline.phase = 'meteor';
    this.timeline.meteorStartTime = this.timeline.time;
    if (this.meteorMesh) {
      this.meteorMesh.visible = true;
    }
  }

  createImpactEffects() {
    console.log('Creating impact effects');
    const impactPoint = new THREE.Vector3(7, -15, 2);

    // Massive explosion burst with debris
    const debrisVelocity = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < 360; i += 3) {
      const angle = (i / 360) * Math.PI * 2;
      const elevAngle = (Math.random() * 0.5 + 0.3) * Math.PI;
      const speed = 15 + Math.random() * 25;

      debrisVelocity.set(
        Math.cos(angle) * Math.sin(elevAngle) * speed,
        Math.cos(elevAngle) * speed,
        Math.sin(angle) * Math.sin(elevAngle) * speed
      );

      // Mix of plasma, ember, and smoke for realistic explosion
      this.explosionSystem.emit(impactPoint, debrisVelocity, 3, 'plasma');
      this.explosionSystem.emit(impactPoint, debrisVelocity, 2, 'ember');
      this.explosionSystem.emit(impactPoint, debrisVelocity, 1, 'smoke');
    }

    // Create expanding shockwave rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(0.1, 0.5, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x8844ff : i === 1 ? 0x6633dd : 0x4422aa,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(impactPoint);
      ring.rotation.x = -Math.PI / 2;
      ring.userData.startTime = this.timeline.time + i * 0.1;
      ring.userData.initialScale = 0.1;
      this.shockwaveRings.push(ring);
      this.scene.add(ring);
    }

    // Create eerie purple/blue crater glow
    const craterGeometry = new THREE.CircleGeometry(5, 64);
    const craterMaterial = new THREE.MeshBasicMaterial({
      color: 0x7744ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.craterGlow = new THREE.Mesh(craterGeometry, craterMaterial);
    this.craterGlow.position.copy(impactPoint);
    this.craterGlow.rotation.x = -Math.PI / 2;
    this.scene.add(this.craterGlow);
  }

  createShatteredGlass() {
    console.log('Creating shattered glass effect');

    // Generate shards around impact point (7, -15, 2)
    const shardCount = 35;
    const impactCenter = new THREE.Vector2(7, 2);
    const points: THREE.Vector2[] = [];

    // Create layered distribution for more density
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 2 + Math.random() * 6;
      points.push(new THREE.Vector2(
        impactCenter.x + Math.cos(angle) * distance,
        impactCenter.y + Math.sin(angle) * distance
      ));
    }

    // Create shards
    points.forEach((point, i) => {
      const sides = 5 + Math.floor(Math.random() * 3);
      const shape = new THREE.Shape();
      const size = 0.6 + Math.random() * 0.5;

      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * Math.PI * 2 + Math.random() * 0.4;
        const r = size * (0.6 + Math.random() * 0.4);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (j === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          time: { value: 0 },
          refractionStrength: { value: 2.5 },
        },
        vertexShader: RefractionShardVertexShader,
        fragmentShader: RefractionShardFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(point.x, -15, point.y);
      mesh.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      mesh.rotation.z = Math.random() * Math.PI * 2;
      mesh.visible = false;

      this.shardsMeshes.push(mesh);
      this.scene.add(mesh);
    });
  }

  update() {
    const deltaTime = this.clock.getDelta();
    this.timeline.time += deltaTime;

    // Update film grain
    if (this.grainPass.uniforms['time']) {
      this.grainPass.uniforms['time'].value = this.timeline.time;
    }

    // Timeline sequencing
    if (this.timeline.phase === 'intro' && this.timeline.time > 0.5) {
      this.startMeteor();
    }

    // Meteor phase
    if (this.timeline.phase === 'meteor' && this.meteorMesh) {
      const elapsed = this.timeline.time - this.timeline.meteorStartTime;
      const progress = Math.min(elapsed / 1.0, 1.0); // 1 second descent

      // Animate meteor on 60-degree angle trajectory (starts far, falls toward viewer)
      // Path: (20, 80, -40) → (7, -15, 2)
      const startPos = new THREE.Vector3(20, 80, -40);
      const endPos = new THREE.Vector3(7, -15, 2);

      this.meteorMesh.position.lerpVectors(startPos, endPos, progress);
      this.meteorMesh.rotation.x += deltaTime * 2.5;
      this.meteorMesh.rotation.y += deltaTime * 1.8;

      // Perspective scaling - starts small (0.1), grows to full size (1.0)
      const scale = 0.1 + progress * 0.9;
      this.meteorMesh.scale.set(scale, scale, scale);

      // Update meteor shader
      if (this.meteorMaterial) {
        this.meteorMaterial.uniforms.time.value = this.timeline.time;
        this.meteorMaterial.uniforms.heatIntensity.value = 1.0 + progress * 0.5;
      }

      // Emit trail particles - much denser trail
      const velocity = endPos.clone().sub(startPos).normalize().multiplyScalar(50);
      this.trailSystem.emit(this.meteorMesh.position, velocity, 15, 'plasma');
      this.trailSystem.emit(this.meteorMesh.position, velocity, 10, 'ember');
      this.trailSystem.emit(this.meteorMesh.position, velocity, 8, 'smoke');

      // Gravitational star pull effect
      if (this.starfield && this.starOriginalPositions) {
        const positions = this.starfield.geometry.attributes.position.array as Float32Array;
        const meteorPos = this.meteorMesh.position;
        const pullStrength = 0.3 * progress;

        for (let i = 0; i < positions.length; i += 3) {
          const origX = this.starOriginalPositions[i];
          const origY = this.starOriginalPositions[i + 1];
          const origZ = this.starOriginalPositions[i + 2];

          const dx = meteorPos.x - origX;
          const dy = meteorPos.y - origY;
          const dz = meteorPos.z - origZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Only pull stars within reasonable distance
          if (dist < 50) {
            const pullFactor = (1 - dist / 50) * pullStrength;
            positions[i] = origX + dx * pullFactor;
            positions[i + 1] = origY + dy * pullFactor;
            positions[i + 2] = origZ + dz * pullFactor;
          } else {
            positions[i] = origX;
            positions[i + 1] = origY;
            positions[i + 2] = origZ;
          }
        }

        this.starfield.geometry.attributes.position.needsUpdate = true;
      }

      // Impact detection - when meteor reaches ground
      if (this.meteorMesh.position.y <= -15 || progress >= 1.0) {
        this.timeline.phase = 'impact';
        this.timeline.impactTime = this.timeline.time;
        this.meteorMesh.visible = false;
        this.createImpactEffects();
        this.createShatteredGlass();

        // Camera shake
        this.camera.position.x = Math.random() * 0.8 - 0.4;
        this.camera.position.y = Math.random() * 0.5 - 0.25;

        // Chromatic aberration spike
        this.chromaPass.uniforms['amount'].value = 0.006;

        // Bloom spike
        this.bloomPass.strength = 3.5;

        if (this.onImpact) {
          this.onImpact();
        }
      }
    }

    // Impact phase
    if (this.timeline.phase === 'impact') {
      const impactElapsed = this.timeline.time - this.timeline.impactTime;

      // Camera shake decay
      const shakeIntensity = Math.max(0, 0.8 - impactElapsed);
      this.camera.position.x = (Math.random() - 0.5) * shakeIntensity;
      this.camera.position.y = (Math.random() - 0.5) * shakeIntensity * 0.6;

      // Chromatic aberration decay
      this.chromaPass.uniforms['amount'].value = Math.max(0, 0.006 - impactElapsed * 0.004);

      // Bloom decay
      this.bloomPass.strength = Math.max(1.5, 3.5 - impactElapsed * 2.0);

      // Animate shockwave rings
      this.shockwaveRings.forEach((ring) => {
        const ringElapsed = this.timeline.time - ring.userData.startTime;
        if (ringElapsed > 0) {
          const ringProgress = Math.min(ringElapsed / 1.2, 1.0);
          const scale = 0.1 + ringProgress * 30;
          ring.scale.set(scale, scale, 1);

          const material = ring.material as THREE.MeshBasicMaterial;
          material.opacity = Math.max(0, 0.8 - ringProgress * 0.8);
        }
      });

      // Crater glow fade in
      if (this.craterGlow) {
        const glowProgress = Math.min(impactElapsed / 0.8, 1.0);
        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        material.opacity = glowProgress * 0.6;

        // Pulsing glow effect
        const pulse = Math.sin(this.timeline.time * 3) * 0.1 + 0.9;
        this.craterGlow.scale.set(pulse, pulse, 1);
      }

      // Show shards with staggered timing
      if (impactElapsed > 0.15) {
        this.shardsMeshes.forEach((shard, i) => {
          const shardDelay = i * 0.01;
          if (impactElapsed > 0.15 + shardDelay) {
            shard.visible = true;

            // Subtle animation - shards slowly float up
            const shardElapsed = impactElapsed - (0.15 + shardDelay);
            shard.position.y = -15 + shardElapsed * 0.3;
            shard.rotation.z += deltaTime * 0.5;
          }
        });
      }

      if (impactElapsed > 1.5) {
        this.timeline.phase = 'crater';
      }
    }

    // Crater phase - maintain the eerie glow
    if (this.timeline.phase === 'crater') {
      if (this.craterGlow) {
        const pulse = Math.sin(this.timeline.time * 2) * 0.15 + 0.85;
        this.craterGlow.scale.set(pulse, pulse, 1);

        // Cycle through purple/blue hues
        const hueShift = Math.sin(this.timeline.time * 0.5) * 0.2;
        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        material.color.setHSL(0.7 + hueShift, 0.9, 0.5);
      }
    }

    // Update particles
    this.trailSystem.update(deltaTime);
    this.explosionSystem.update(deltaTime);

    // Render
    this.composer.render();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
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
  const [buttonHover, setButtonHover] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('Initializing Three.js scene');
    const sceneManager = new SceneManager(canvasRef.current);
    sceneManagerRef.current = sceneManager;

    sceneManager.onImpact = () => {
      console.log('Impact callback - showing UI');
      setTimeout(() => setShowTitle(true), 1500);
      setTimeout(() => setShowButton(true), 3000);
    };

    // Animation loop
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {showTitle && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: '35%',
            animation: 'titleFadeIn 1.5s ease-out',
          }}
        >
          <h1
            className="text-8xl font-bold text-white tracking-widest select-none"
            style={{
              fontFamily: "'Rubik Burned', cursive",
              textShadow: `
                0 0 40px rgba(150, 100, 200, 0.9),
                0 0 80px rgba(100, 50, 150, 0.6),
                0 0 120px rgba(80, 40, 120, 0.4)
              `,
              filter: 'blur(0px)',
            }}
          >
            THE FINAL DESCENT
          </h1>
        </div>
      )}

      {showButton && (
        <div
          className="absolute left-1/2 pointer-events-auto select-none"
          style={{
            bottom: '20%',
            transform: 'translateX(-50%)',
            animation: 'buttonFadeIn 1s ease-out 0.5s both',
          }}
        >
          <div
            onClick={onBegin}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            className="cursor-pointer transition-all duration-300"
            style={{
              fontFamily: "'Rubik Marker Hatch', cursive",
              fontSize: '1.5rem',
              color: 'white',
              textShadow: buttonHover
                ? `
                  0 0 20px rgba(200, 150, 255, 1),
                  0 0 40px rgba(150, 100, 220, 0.8),
                  0 0 60px rgba(120, 80, 180, 0.6)
                `
                : `
                  0 0 15px rgba(150, 100, 200, 0.8),
                  0 0 30px rgba(120, 80, 180, 0.6)
                `,
              filter: buttonHover ? 'brightness(1.3)' : 'brightness(1)',
              letterSpacing: '0.15em',
            }}
          >
            BEGIN THE DESCENT
          </div>
        </div>
      )}

      <style>{`
        @keyframes titleFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes buttonFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
