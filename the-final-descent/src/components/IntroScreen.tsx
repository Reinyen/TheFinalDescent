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

const RealityCrackFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float time;
  uniform float intensity;
  uniform vec2 craterCenter; // Screen space center of crater
  uniform float craterRadius; // Radius of effect

  varying vec2 vUv;
  varying vec4 vWorldPosition;

  // Hash functions
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
  }

  // Fractal noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Simplex-style 3D noise
  float snoise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash2(i.xy + i.z * 57.0);
    float n100 = hash2(i.xy + vec2(1.0, 0.0) + i.z * 57.0);
    float n010 = hash2(i.xy + vec2(0.0, 1.0) + i.z * 57.0);
    float n110 = hash2(i.xy + vec2(1.0, 1.0) + i.z * 57.0);
    float n001 = hash2(i.xy + (i.z + 1.0) * 57.0);
    float n101 = hash2(i.xy + vec2(1.0, 0.0) + (i.z + 1.0) * 57.0);
    float n011 = hash2(i.xy + vec2(0.0, 1.0) + (i.z + 1.0) * 57.0);
    float n111 = hash2(i.xy + vec2(1.0, 1.0) + (i.z + 1.0) * 57.0);

    float res = mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z
    );

    return res * 2.0 - 1.0;
  }

  // Dr. Strange-style crystalline crack pattern
  float getCrackPattern(vec2 uv, float t) {
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    // RADIAL CRACK RAYS - highly visible
    float rayPattern = 0.0;
    for(int i = 0; i < 12; i++) {
      float rayAngle = float(i) * 0.523599 + t * 0.1; // 30 degrees apart
      float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

      // Make rays THICK and VISIBLE
      float ray = smoothstep(0.08, 0.0, angleDiff) * (1.0 - smoothstep(0.0, 0.6, radius));
      rayPattern = max(rayPattern, ray);
    }

    // FRACTAL NOISE CRACKS - guaranteed visible
    vec3 p = vec3(uv * 6.0, t * 0.2);
    float n1 = snoise3d(p);
    float n2 = snoise3d(p * 2.3 + 100.0);

    // Create THICK crack lines
    float noiseCracks = 0.0;
    noiseCracks += smoothstep(0.7, 0.3, abs(n1)) * 0.9;
    noiseCracks += smoothstep(0.6, 0.2, abs(n2)) * 0.7;

    // GUARANTEED VISIBLE BASE PATTERN
    float baseCracks = smoothstep(0.8, 0.4, abs(snoise3d(vec3(uv * 4.0, t * 0.15))));

    return max(max(rayPattern, noiseCracks), baseCracks);
  }

  void main() {
    vec2 screenUV = gl_FragCoord.xy / resolution;
    vec2 centeredUV = screenUV - craterCenter;
    float distFromCrater = length(centeredUV);

    // 15% of screen coverage - subtle boundary
    float radialFade = smoothstep(craterRadius * 1.3, craterRadius * 0.2, distFromCrater);

    if(radialFade < 0.01) {
      // Outside effect radius - show normal background
      gl_FragColor = texture2D(tDiffuse, screenUV);
      return;
    }

    // PULSING animation
    float pulse = sin(time * 2.5) * 0.4 + 0.6;
    float fastPulse = sin(time * 5.0) * 0.3 + 0.7;

    // ENHANCED CRACKED-GLASS EFFECT - Multiple crack layers
    float angle = atan(centeredUV.y, centeredUV.x);
    float radius = length(centeredUV);

    // PRIMARY: 15 THICK RADIAL CRACKS (main impact rays)
    float cracks = 0.0;
    for(int i = 0; i < 15; i++) {
      float rayAngle = float(i) * 0.418879; // 24 degrees
      float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
      // VERY THICK visible rays
      float ray = smoothstep(0.18, 0.0, angleDiff) * (1.0 - smoothstep(0.02, 0.65, radius));
      cracks = max(cracks, ray * 0.9);
    }

    // SECONDARY: Intersecting angular cracks (like broken glass)
    for(int i = 0; i < 8; i++) {
      float rayAngle = float(i) * 0.785398 + 0.2; // 45 degrees offset
      float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
      float ray = smoothstep(0.12, 0.0, angleDiff) * (1.0 - smoothstep(0.1, 0.5, radius));
      cracks = max(cracks, ray * 0.7);
    }

    // TERTIARY: Fine fracture network
    vec2 crackUV = centeredUV * 15.0;
    float fineCracks = 0.0;
    fineCracks += smoothstep(0.92, 0.88, abs(sin(crackUV.x + crackUV.y * 1.3 + time * 0.2))) * 0.5;
    fineCracks += smoothstep(0.94, 0.90, abs(sin(crackUV.x * 1.7 - crackUV.y * 0.9))) * 0.4;
    fineCracks += smoothstep(0.96, 0.92, abs(cos(crackUV.x * 2.1 + crackUV.y * 1.1))) * 0.3;
    cracks = max(cracks, fineCracks * (1.0 - smoothstep(0.0, 0.6, radius)));

    // NOISE-BASED organic cracks
    float n = snoise3d(vec3(centeredUV * 12.0, time * 0.3));
    cracks = max(cracks, smoothstep(0.5, 0.2, abs(n)) * 0.6);

    // Apply radial fade with enhanced visibility
    cracks = cracks * radialFade * 1.3; // Boosted by 30%

    // SUPER SCI-FI GLITCH EFFECTS
    float glitchTime = floor(time * 12.0);
    float glitchStrength = hash(glitchTime) * 0.8 + 0.2;

    // Digital pixel corruption
    vec2 pixelUV = floor(screenUV * resolution / 4.0) / (resolution / 4.0);
    float pixelGlitch = hash2(pixelUV + glitchTime) * glitchStrength;

    // Scanline glitch
    float scanline = sin(screenUV.y * resolution.y * 0.5 + time * 10.0);
    float scanlineGlitch = step(0.95, scanline) * glitchStrength;

    // Horizontal glitch offset (like TV static)
    vec2 glitchOffset = vec2(
      (hash(screenUV.y * 100.0 + glitchTime) - 0.5) * 0.05 * scanlineGlitch,
      0.0
    );

    // HEAVY REALITY WARPING around cracks
    vec2 crackGradient = vec2(
      getCrackPattern(centeredUV + vec2(0.01, 0.0), time) - getCrackPattern(centeredUV - vec2(0.01, 0.0), time),
      getCrackPattern(centeredUV + vec2(0.0, 0.01), time) - getCrackPattern(centeredUV - vec2(0.0, 0.01), time)
    );

    // Distort heavily along crack edges - Dr. Strange kaleidoscope effect
    float distortionStrength = cracks * 0.15 * pulse;
    vec2 distortedUV = screenUV;
    distortedUV += crackGradient * distortionStrength;
    distortedUV += vec2(sin(centeredUV.y * 30.0 + time * 2.0), cos(centeredUV.x * 30.0 - time * 2.0)) * distortionStrength * 0.5;
    distortedUV += glitchOffset * radialFade;

    // CHROMATIC ABERRATION (RGB split) - pulsing
    float aberration = 0.015 * radialFade * cracks * fastPulse;
    vec3 distortedColor;
    distortedColor.r = texture2D(tDiffuse, distortedUV + vec2(aberration, aberration * 0.5)).r;
    distortedColor.g = texture2D(tDiffuse, distortedUV).g;
    distortedColor.b = texture2D(tDiffuse, distortedUV - vec2(aberration, aberration * 0.5)).b;

    // OTHERWORLDLY PURPLE/BLUE GLOW from cracks (reality bleeding through)
    // SUPER BRIGHT - enhanced for more prominent shattered reality effect
    float glowIntensity = cracks * 20.0 * pulse; // Increased from 15.0 to 20.0

    // Purple/blue cosmic horror color - pulsing between shades
    vec3 purpleBlue1 = vec3(0.8, 0.4, 1.5);  // BRIGHTER Deep purple
    vec3 purpleBlue2 = vec3(0.5, 0.9, 1.8);  // BRIGHTER Electric blue
    vec3 glowColor = mix(purpleBlue1, purpleBlue2, sin(time * 3.0) * 0.5 + 0.5);

    // Add ethereal white-hot core to cracks for glass-like shimmer
    glowColor = mix(glowColor, vec3(1.8, 1.7, 2.0), cracks * fastPulse * 0.8);

    vec3 ominousGlow = glowColor * glowIntensity;

    // DIGITAL GLITCH ARTIFACTS - TV static style
    float staticNoise = hash2(screenUV * resolution * 0.1 + time * 20.0) * pixelGlitch * radialFade * 0.3;

    // Pixel corruption along cracks
    float corruption = step(0.9, hash2(pixelUV + cracks * 10.0)) * glitchStrength * radialFade * 0.4;

    // Reality warping - color inversion flicker
    float colorFlip = step(0.97, hash(glitchTime + cracks * 5.0)) * radialFade;

    // COMBINE ALL EFFECTS
    vec3 finalColor = distortedColor;

    // Add otherworldly glow from cracks
    finalColor += ominousGlow;

    // Add glitch artifacts
    finalColor += vec3(staticNoise);
    finalColor = mix(finalColor, vec3(corruption), corruption);

    // Color flip glitch
    finalColor = mix(finalColor, vec3(1.0) - finalColor, colorFlip * 0.6);

    // Subtle boundary distortion
    float boundaryGlitch = smoothstep(craterRadius * 1.3, craterRadius * 1.2, distFromCrater);
    boundaryGlitch *= step(0.8, hash(glitchTime + floor(atan(centeredUV.y, centeredUV.x) * 16.0)));
    finalColor = mix(finalColor, finalColor * 0.7, boundaryGlitch * 0.4);

    gl_FragColor = vec4(finalColor, 1.0);
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
  renderTarget: THREE.WebGLRenderTarget;

  meteorMesh: THREE.Mesh | null = null;
  meteorMaterial: THREE.ShaderMaterial | null = null;
  trailSystem: TrailParticleSystem;
  explosionSystem: TrailParticleSystem;
  shardsMeshes: THREE.Mesh[] = [];
  starfield: THREE.Points | null = null;
  starOriginalPositions: Float32Array | null = null;
  starsToCapture: Set<number> = new Set(); // Indices of stars to pull into meteor
  capturedStars: Set<number> = new Set(); // Stars that have been consumed
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

    // Create render target for glass shard refraction
    this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

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

      // Reduced star size range for realistic starry sky (from 0.5-2.5 to 0.2-0.8)
      sizes[i] = Math.random() * 0.6 + 0.2;
    }

    // Store original positions for gravitational pull effect
    this.starOriginalPositions = new Float32Array(positions);

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.25, // Reduced from 0.5 to 0.25 for smaller, more realistic stars
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
    // Reduced size by 50% (from 1.2 to 0.6)
    const geometry = new THREE.IcosahedronGeometry(0.6, 3);

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
    // Start far away, high up - will fall at 60-degree angle toward viewer
    this.meteorMesh.position.set(0, 100, -200);
    this.meteorMesh.scale.set(0.01, 0.01, 0.01); // Start VERY small
    this.meteorMesh.visible = false;
    this.scene.add(this.meteorMesh);

    // Add meteor glow (proportionally reduced by 50%)
    const glowGeometry = new THREE.IcosahedronGeometry(1.05, 2);
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

    // Select stars to capture (30% of stars within 30-80 unit range from meteor's starting position)
    if (this.starfield && this.starOriginalPositions) {
      const meteorStartPos = new THREE.Vector3(0, 100, -200);
      const starCount = this.starOriginalPositions.length / 3;
      const starsInRange: number[] = [];

      for (let i = 0; i < starCount; i++) {
        const x = this.starOriginalPositions[i * 3];
        const y = this.starOriginalPositions[i * 3 + 1];
        const z = this.starOriginalPositions[i * 3 + 2];

        const dist = Math.sqrt(
          Math.pow(x - meteorStartPos.x, 2) +
          Math.pow(y - meteorStartPos.y, 2) +
          Math.pow(z - meteorStartPos.z, 2)
        );

        if (dist >= 30 && dist <= 80) {
          starsInRange.push(i);
        }
      }

      // Select 30% of stars in range
      const numToCapture = Math.ceil(starsInRange.length * 0.3);
      for (let i = 0; i < numToCapture; i++) {
        const randomIndex = Math.floor(Math.random() * starsInRange.length);
        this.starsToCapture.add(starsInRange[randomIndex]);
        starsInRange.splice(randomIndex, 1);
      }

      console.log(`Selected ${this.starsToCapture.size} stars to capture`);
    }
  }

  createImpactEffects() {
    console.log('Creating impact effects');
    const impactPoint = new THREE.Vector3(0, -5, 5);

    // Massive explosion burst with debris
    const debrisVelocity = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < 360; i += 2) {
      const angle = (i / 360) * Math.PI * 2;
      const elevAngle = (Math.random() * 0.6 + 0.2) * Math.PI;
      const speed = 20 + Math.random() * 35;

      debrisVelocity.set(
        Math.cos(angle) * Math.sin(elevAngle) * speed,
        Math.cos(elevAngle) * speed,
        Math.sin(angle) * Math.sin(elevAngle) * speed
      );

      // Mix of plasma, ember, and smoke for realistic explosion (more particles)
      this.explosionSystem.emit(impactPoint, debrisVelocity, 5, 'plasma');
      this.explosionSystem.emit(impactPoint, debrisVelocity, 4, 'ember');
      this.explosionSystem.emit(impactPoint, debrisVelocity, 2, 'smoke');
    }

    // Create expanding shockwave rings (larger for visibility at distance)
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(2, 4, 64);
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
      ring.userData.startTime = this.timeline.time + i * 0.15;
      ring.userData.initialScale = 1.0;
      this.shockwaveRings.push(ring);
      this.scene.add(ring);
    }

    // Create eerie purple/blue crater glow (much larger and brighter)
    const craterGeometry = new THREE.CircleGeometry(25, 64);
    const craterMaterial = new THREE.MeshBasicMaterial({
      color: 0x6633ff,
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
    console.log('Creating reality crack effect around crash site');

    // Create a SINGLE large plane covering the crater area
    // This will use procedural shader to generate crack patterns
    const impactPoint = new THREE.Vector3(0, -5, 5);
    const effectRadius = 50; // Large radius to cover crater and button area

    // Create circular plane geometry
    const geometry = new THREE.PlaneGeometry(effectRadius * 2, effectRadius * 2, 1, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        time: { value: 0 },
        intensity: { value: 0.0 }, // Start at 0, will fade in
        craterCenter: { value: new THREE.Vector2(0.5, 0.5) }, // Will be updated each frame
        craterRadius: { value: 0.15 }, // Screen space radius - 15% of screen
      },
      vertexShader: RefractionShardVertexShader,
      fragmentShader: RealityCrackFragmentShader,
      transparent: false,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(impactPoint);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    mesh.userData.targetIntensity = 1.0;

    this.shardsMeshes.push(mesh);
    this.scene.add(mesh);
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
      const linearProgress = Math.min(elapsed / 3.0, 1.0); // 3 second descent

      // Apply easing - starts slow, accelerates (like gravity)
      // Using quadratic ease-in for acceleration effect
      const progress = linearProgress * linearProgress;

      // 60-degree angle trajectory - falls toward viewer at 60-degree angle
      // Camera at (0, 0, 30), impact point visible in front of camera
      const startPos = new THREE.Vector3(0, 150, -100);
      const endPos = new THREE.Vector3(0, -5, 5);

      this.meteorMesh.position.lerpVectors(startPos, endPos, progress);
      this.meteorMesh.rotation.x += deltaTime * 2.5;
      this.meteorMesh.rotation.y += deltaTime * 1.8;

      // Meteor growth: tiny dot for 2s, then explosive growth in last 1s
      // REDUCED BY 50%: First 2 seconds (elapsed 0-2): slow but VISIBLE growth 0.01 → 1.0
      // REDUCED BY 50%: Last second (elapsed 2-3): explosive dramatic growth 1.0 → 5.0
      let scale;
      if (elapsed < 2.0) {
        // Slow but visible growth for first 2 seconds
        const firstTwoProgress = elapsed / 2.0;
        scale = 0.01 + firstTwoProgress * 0.99; // 0.01 to 1.0 (REDUCED BY 50%)
      } else {
        // Last second: dramatic explosive growth to final size
        const lastSecondProgress = (elapsed - 2.0) / 1.0;
        // Exponential curve for "OH MY GOD IT'S HUGE" effect
        const explosiveGrowth = Math.pow(lastSecondProgress, 0.4);
        scale = 1.0 + explosiveGrowth * 4.0; // 1.0 to 5.0 (REDUCED BY 50%)
      }

      this.meteorMesh.scale.set(scale, scale, scale);

      // Update meteor shader
      if (this.meteorMaterial) {
        this.meteorMaterial.uniforms.time.value = this.timeline.time;
        this.meteorMaterial.uniforms.heatIntensity.value = 1.0 + progress * 0.5;
      }

      // Emit trail particles - denser and faster as meteor accelerates
      const velocity = endPos.clone().sub(startPos).normalize().multiplyScalar(50 * (1 + progress));
      const trailDensity = 1.0 + progress * 2.0; // More particles as it speeds up

      this.trailSystem.emit(this.meteorMesh.position, velocity, Math.floor(20 * trailDensity), 'plasma');
      this.trailSystem.emit(this.meteorMesh.position, velocity, Math.floor(15 * trailDensity), 'ember');
      this.trailSystem.emit(this.meteorMesh.position, velocity, Math.floor(10 * trailDensity), 'smoke');

      // Star capture effect - pull selected stars into meteor and make them disappear
      if (this.starfield && this.starOriginalPositions) {
        const positions = this.starfield.geometry.attributes.position.array as Float32Array;
        const sizes = this.starfield.geometry.attributes.size.array as Float32Array;
        const meteorPos = this.meteorMesh.position;

        this.starsToCapture.forEach((starIndex) => {
          if (this.capturedStars.has(starIndex)) return; // Already consumed

          const i = starIndex * 3;
          const origX = this.starOriginalPositions![i];
          const origY = this.starOriginalPositions![i + 1];
          const origZ = this.starOriginalPositions![i + 2];

          const dx = meteorPos.x - origX;
          const dy = meteorPos.y - origY;
          const dz = meteorPos.z - origZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Move star toward meteor - closer stars move faster
          const speed = deltaTime * 40 * (1 / (dist * 0.1 + 1)); // Inverse distance for speed
          const moveAmount = Math.min(speed / dist, 1.0);

          positions[i] += dx * moveAmount;
          positions[i + 1] += dy * moveAmount;
          positions[i + 2] += dz * moveAmount;

          // If star is very close to meteor, hide it (consumed)
          if (dist < 3) {
            sizes[starIndex] = 0; // Hide the star
            this.capturedStars.add(starIndex);
          }
        });

        this.starfield.geometry.attributes.position.needsUpdate = true;
        this.starfield.geometry.attributes.size.needsUpdate = true;
      }

      // Impact detection - when meteor reaches ground
      if (this.meteorMesh.position.y <= -20 || progress >= 1.0) {
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

      // Animate shockwave rings (expand dramatically)
      this.shockwaveRings.forEach((ring) => {
        const ringElapsed = this.timeline.time - ring.userData.startTime;
        if (ringElapsed > 0) {
          const ringProgress = Math.min(ringElapsed / 1.5, 1.0);
          const scale = ring.userData.initialScale + ringProgress * 50;
          ring.scale.set(scale, scale, 1);

          const material = ring.material as THREE.MeshBasicMaterial;
          material.opacity = Math.max(0, 0.9 - ringProgress * 0.9);
        }
      });

      // Crater glow fade in (brighter and more visible)
      if (this.craterGlow) {
        const glowProgress = Math.min(impactElapsed / 0.8, 1.0);
        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        material.opacity = glowProgress * 0.85;

        // Pulsing glow effect
        const pulse = Math.sin(this.timeline.time * 3) * 0.15 + 0.9;
        this.craterGlow.scale.set(pulse, pulse, 1);
      }

      // Show reality crack effect - fade in intensity
      if (impactElapsed > 0.05 && this.shardsMeshes.length > 0) {
        const crackPlane = this.shardsMeshes[0];
        crackPlane.visible = true;

        const crackElapsed = impactElapsed - 0.05;

        // Fade in intensity over 0.3 seconds
        const intensityProgress = Math.min(crackElapsed / 0.3, 1.0);
        const easedIntensity = 1.0 - Math.pow(1.0 - intensityProgress, 2);

        const material = crackPlane.material as THREE.ShaderMaterial;

        // Update uniforms
        if (material.uniforms.intensity) {
          material.uniforms.intensity.value = easedIntensity;
        }
        if (material.uniforms.time) {
          material.uniforms.time.value = this.timeline.time;
        }

        // Calculate crater center in screen space
        const craterWorldPos = crackPlane.position.clone();
        craterWorldPos.project(this.camera);

        // Convert from NDC (-1 to 1) to screen space (0 to 1)
        const craterScreenX = (craterWorldPos.x + 1.0) * 0.5;
        const craterScreenY = (craterWorldPos.y + 1.0) * 0.5;

        if (material.uniforms.craterCenter) {
          material.uniforms.craterCenter.value.set(craterScreenX, craterScreenY);
        }
      }

      if (impactElapsed > 1.5) {
        this.timeline.phase = 'crater';
      }
    }

    // Crater phase - maintain the eerie glow and shard animation
    if (this.timeline.phase === 'crater') {
      if (this.craterGlow) {
        const pulse = Math.sin(this.timeline.time * 2) * 0.2 + 0.9;
        this.craterGlow.scale.set(pulse, pulse, 1);

        // Cycle through purple/blue hues - stronger saturation
        const hueShift = Math.sin(this.timeline.time * 0.5) * 0.15;
        const material = this.craterGlow.material as THREE.MeshBasicMaterial;
        material.color.setHSL(0.68 + hueShift, 1.0, 0.55);
        material.opacity = 0.85;
      }

      // Continue reality crack effect
      if (this.shardsMeshes.length > 0) {
        const crackPlane = this.shardsMeshes[0];
        if (crackPlane.visible) {
          const material = crackPlane.material as THREE.ShaderMaterial;

          // Update time uniform for animated cracks
          if (material.uniforms.time) {
            material.uniforms.time.value = this.timeline.time;
          }

          // Keep intensity at full
          if (material.uniforms.intensity) {
            material.uniforms.intensity.value = 1.0;
          }

          // Update crater center in screen space
          const craterWorldPos = crackPlane.position.clone();
          craterWorldPos.project(this.camera);
          const craterScreenX = (craterWorldPos.x + 1.0) * 0.5;
          const craterScreenY = (craterWorldPos.y + 1.0) * 0.5;

          if (material.uniforms.craterCenter) {
            material.uniforms.craterCenter.value.set(craterScreenX, craterScreenY);
          }
        }
      }
    }

    // Update particles
    this.trailSystem.update(deltaTime);
    this.explosionSystem.update(deltaTime);

    // Render scene to texture for glass shard refraction
    // Hide shards temporarily to capture clean background
    const shardVisibility = this.shardsMeshes.map(s => s.visible);
    this.shardsMeshes.forEach(s => s.visible = false);

    // Render background to texture
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // Update shard materials with background texture
    this.shardsMeshes.forEach(shard => {
      const material = shard.material as THREE.ShaderMaterial;
      if (material.uniforms.tDiffuse) {
        material.uniforms.tDiffuse.value = this.renderTarget.texture;
      }
    });

    // Restore shard visibility
    this.shardsMeshes.forEach((s, i) => s.visible = shardVisibility[i]);

    // Render final scene with post-processing
    this.composer.render();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.renderTarget.setSize(window.innerWidth, window.innerHeight);
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
            top: '60%',
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
              fontSize: '0.75rem',
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
