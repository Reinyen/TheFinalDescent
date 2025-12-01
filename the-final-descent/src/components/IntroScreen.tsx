/**
 * IntroScreen - AAA-Quality Three.js Cinematic Experience
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Starfield with depth
function Starfield() {
  const starsRef = useRef<THREE.Points>(null);
  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < 2000; i++) {
      // Distribute stars in 3D space for depth
      positions.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 50 - 10 // Depth
      );

      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.1, 0.2, 0.8 + Math.random() * 0.2);
      colors.push(color.r, color.g, color.b);

      sizes.push(Math.random() * 2 + 0.5);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    return geo;
  });

  useFrame((state) => {
    if (!starsRef.current) return;
    const time = state.clock.getElapsedTime();

    // Animate star brightness (twinkling)
    const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = starsRef.current.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < positions.length / 3; i++) {
      const twinkle = Math.sin(time * 2 + i * 0.1) * 0.3 + 0.7;
      colors[i * 3] = (0.8 + Math.random() * 0.2) * twinkle;
      colors[i * 3 + 1] = (0.8 + Math.random() * 0.2) * twinkle;
      colors[i * 3 + 2] = (0.9 + Math.random() * 0.1) * twinkle;
    }

    starsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={starsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main meteor
function Meteor({ onImpact }: { onImpact: () => void }) {
  const meteorRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  const [active, setActive] = useState(false);
  const startTime = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(true);
      startTime.current = Date.now() / 1000;
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state) => {
    if (!active || !meteorRef.current) return;

    const elapsed = state.clock.getElapsedTime() - startTime.current;
    const speed = 0.3;

    meteorRef.current.position.y = 30 - elapsed * speed * 60;

    // Impact detection
    if (meteorRef.current.position.y < -15) {
      setActive(false);
      onImpact();
    }

    // Update trail
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = positions.length - 3; i > 2; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
      }
      positions[0] = meteorRef.current.position.x;
      positions[1] = meteorRef.current.position.y;
      positions[2] = meteorRef.current.position.z;
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  // Trail geometry
  const trailPositions = new Float32Array(300);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

  return (
    <group ref={meteorRef} position={[0, 30, 0]}>
      {/* Meteor core */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Meteor glow */}
      <mesh>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial
          color="#ffaa44"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial
          color="#ff6622"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Trail */}
      <points ref={trailRef} geometry={trailGeometry}>
        <pointsMaterial
          size={0.3}
          color="#ffaa44"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Particle explosion system
function ExplosionParticles({ trigger }: { trigger: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array | null>(null);

  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < 2000; i++) {
      positions.push(0, -15, 0);

      // Mix of orange fire and purple void
      if (Math.random() < 0.6) {
        colors.push(1, 0.5 + Math.random() * 0.3, 0.1);
      } else {
        colors.push(0.6, 0.3, 0.8 + Math.random() * 0.2);
      }

      sizes.push(Math.random() * 0.3 + 0.1);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Create velocities
    const vels = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = Math.random() * 0.5 + 0.2;

      vels[i] = Math.sin(phi) * Math.cos(theta) * speed;
      vels[i + 1] = Math.abs(Math.cos(phi)) * speed * 0.5 + 0.3;
      vels[i + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    velocities.current = vels;

    return geo;
  });

  useFrame(() => {
    if (!trigger || !particlesRef.current || !velocities.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities.current[i];
      positions[i + 1] += velocities.current[i + 1];
      positions[i + 2] += velocities.current[i + 2];

      velocities.current[i + 1] -= 0.01; // Gravity
      velocities.current[i] *= 0.99;
      velocities.current[i + 2] *= 0.99;

      sizes[i / 3] *= 0.99;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.size.needsUpdate = true;
  });

  if (!trigger) return null;

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Shattered glass fragments
function ShatteredGlass({ trigger }: { trigger: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [fragments] = useState(() => {
    const frags = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI - Math.PI / 2;
      const distance = 3 + Math.random() * 2;
      const shape = new THREE.Shape();

      // Create irregular polygon
      const sides = 5 + Math.floor(Math.random() * 3);
      const size = 0.3 + Math.random() * 0.2;

      for (let j = 0; j < sides; j++) {
        const a = (j / sides) * Math.PI * 2;
        const r = size * (0.7 + Math.random() * 0.3);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;

        if (j === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();

      frags.push({
        shape,
        position: [
          Math.cos(angle) * distance,
          -15 + Math.sin(angle) * distance * 0.5,
          (Math.random() - 0.5) * 2
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        rotationSpeed: [(Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02] as [number, number, number],
      });
    }
    return frags;
  });

  useFrame(() => {
    if (!trigger || !groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      const frag = fragments[i];
      child.rotation.x += frag.rotationSpeed[0];
      child.rotation.y += frag.rotationSpeed[1];
      child.rotation.z += frag.rotationSpeed[2];
    });
  });

  if (!trigger) return null;

  return (
    <group ref={groupRef}>
      {fragments.map((frag, i) => (
        <mesh key={i} position={frag.position} rotation={frag.rotation}>
          <shapeGeometry args={[frag.shape]} />
          <meshBasicMaterial
            color="#8844ff"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Volumetric light beams from crater
function VoidBeams({ trigger }: { trigger: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!trigger || !groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const pulse = Math.sin(time * 2 + i * 0.5) * 0.3 + 0.7;
      (child as THREE.Mesh).material.opacity = 0.4 * pulse;
    });
  });

  if (!trigger) return null;

  const beams = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI - Math.PI / 2;
    const length = 8 + Math.random() * 4;

    beams.push({
      angle,
      length,
      width: 0.05 + Math.random() * 0.05,
    });
  }

  return (
    <group ref={groupRef} position={[0, -15, 0]}>
      {beams.map((beam, i) => {
        const geometry = new THREE.CylinderGeometry(beam.width, beam.width * 0.3, beam.length, 8, 1, true);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0.5, 0.2, 0.8),
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });

        return (
          <mesh
            key={i}
            geometry={geometry}
            material={material}
            position={[
              Math.cos(beam.angle) * 0.5,
              beam.length / 2,
              Math.sin(beam.angle) * 0.5
            ]}
            rotation={[0, 0, beam.angle + Math.PI / 2]}
          />
        );
      })}
    </group>
  );
}

// Background meteors
function BackgroundMeteors({ trigger }: { trigger: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [meteors, setMeteors] = useState<Array<{
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    size: number;
    life: number;
  }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.7) {
        const side = Math.random();
        let pos, vel;

        if (side < 0.33) {
          pos = new THREE.Vector3(-20 + Math.random() * 15, 20 + Math.random() * 10, -10 + Math.random() * 5);
          vel = new THREE.Vector3(0.3 + Math.random() * 0.2, -0.5 - Math.random() * 0.3, 0);
        } else if (side < 0.66) {
          pos = new THREE.Vector3(5 + Math.random() * 15, 20 + Math.random() * 10, -10 + Math.random() * 5);
          vel = new THREE.Vector3(-0.3 - Math.random() * 0.2, -0.5 - Math.random() * 0.3, 0);
        } else {
          pos = new THREE.Vector3((Math.random() - 0.5) * 40, 20 + Math.random() * 10, -10 + Math.random() * 5);
          vel = new THREE.Vector3((Math.random() - 0.5) * 0.4, -0.5 - Math.random() * 0.3, 0);
        }

        setMeteors(prev => [...prev, {
          id: Date.now() + Math.random(),
          position: pos,
          velocity: vel,
          size: 0.3 + Math.random() * 0.2,
          life: 1,
        }]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [trigger]);

  useFrame(() => {
    setMeteors(prev => prev.filter(m => {
      m.position.add(m.velocity);
      m.life -= 0.01;
      return m.life > 0 && m.position.y > -10;
    }));
  });

  if (!trigger) return null;

  return (
    <group ref={groupRef}>
      {meteors.map(meteor => (
        <group key={meteor.id} position={meteor.position}>
          <mesh>
            <sphereGeometry args={[meteor.size, 8, 8]} />
            <meshBasicMaterial
              color="#ffcc88"
              transparent
              opacity={meteor.life}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[meteor.size * 2, 8, 8]} />
            <meshBasicMaterial
              color="#ff8844"
              transparent
              opacity={meteor.life * 0.5}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Camera controller
function CameraController({ impacted }: { impacted: boolean }) {
  const { camera } = useThree();
  const impactTime = useRef(0);

  useEffect(() => {
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    if (impacted && impactTime.current === 0) {
      impactTime.current = state.clock.getElapsedTime();
    }

    if (impactTime.current > 0) {
      const elapsed = state.clock.getElapsedTime() - impactTime.current;

      // Camera shake during impact
      if (elapsed < 0.5) {
        const intensity = (0.5 - elapsed) * 2;
        camera.position.x = Math.sin(elapsed * 50) * intensity * 0.5;
        camera.position.y = Math.cos(elapsed * 30) * intensity * 0.3;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }
    }
  });

  return null;
}

// Main scene component
function Scene({ onImpact }: { onImpact: () => void }) {
  const [impacted, setImpacted] = useState(false);

  const handleImpact = () => {
    setImpacted(true);
    onImpact();
  };

  return (
    <>
      <CameraController impacted={impacted} />
      <Starfield />
      <Meteor onImpact={handleImpact} />
      <ExplosionParticles trigger={impacted} />
      <ShatteredGlass trigger={impacted} />
      <VoidBeams trigger={impacted} />
      <BackgroundMeteors trigger={impacted} />

      {/* Crater glow */}
      {impacted && (
        <mesh position={[0, -15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[8, 32]} />
          <meshBasicMaterial
            color="#6633aa"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          offset={[0.002, 0.002]}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          opacity={0.15}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </>
  );
}

// Main IntroScreen component
export function IntroScreen({ onBegin }: { onBegin: () => void }) {
  const [showTitle, setShowTitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [titleGlitch, setTitleGlitch] = useState({ active: false, intensity: 0 });
  const nextGlitchRef = useRef(0);

  const handleImpact = () => {
    setTimeout(() => setShowTitle(true), 1500);
    setTimeout(() => setShowButton(true), 3000);
  };

  useEffect(() => {
    if (!showTitle) return;

    const interval = setInterval(() => {
      setTitleGlitch({ active: true, intensity: Math.random() });
      setTimeout(() => {
        setTitleGlitch({ active: false, intensity: 0 });
      }, 50 + Math.random() * 100);
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [showTitle]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene onImpact={handleImpact} />
      </Canvas>

      {showTitle && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: '35%',
            transform: titleGlitch.active
              ? `translate(${(Math.random() - 0.5) * 20 * titleGlitch.intensity}px, ${(Math.random() - 0.5) * 10 * titleGlitch.intensity}px)`
              : 'translate(0, 0)',
            transition: titleGlitch.active ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <h1
            className="text-8xl font-bold text-white tracking-widest select-none"
            style={{
              fontFamily: "'Rubik Burned', cursive",
              textShadow: titleGlitch.active
                ? `
                  ${(Math.random() - 0.5) * 10}px ${(Math.random() - 0.5) * 10}px 20px rgba(255, 0, 100, ${titleGlitch.intensity}),
                  ${(Math.random() - 0.5) * 10}px ${(Math.random() - 0.5) * 10}px 20px rgba(0, 255, 255, ${titleGlitch.intensity}),
                  0 0 40px rgba(150, 100, 200, 0.9),
                  0 0 80px rgba(100, 50, 150, 0.6),
                  0 0 120px rgba(80, 40, 120, 0.4)
                `
                : `
                  0 0 40px rgba(150, 100, 200, 0.9),
                  0 0 80px rgba(100, 50, 150, 0.6),
                  0 0 120px rgba(80, 40, 120, 0.4)
                `,
              filter: titleGlitch.active
                ? `hue-rotate(${Math.random() * 360}deg) saturate(${1 + titleGlitch.intensity * 2})`
                : 'none',
              opacity: titleGlitch.active && Math.random() < 0.3 ? 0.3 : 1,
              animation: 'titleFloat 3s ease-in-out infinite',
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
            animation: 'buttonGlitchIn 1.2s ease-out, buttonFloat 4s ease-in-out infinite 1.2s',
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
                  0 0 60px rgba(120, 80, 180, 0.6),
                  0 0 80px rgba(100, 60, 150, 0.4)
                `
                : `
                  0 0 15px rgba(150, 100, 200, 0.8),
                  0 0 30px rgba(120, 80, 180, 0.6),
                  0 0 45px rgba(100, 60, 150, 0.4)
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
        @keyframes titleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes buttonFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0px);
          }
          50% {
            transform: translateX(-50%) translateY(-8px);
          }
        }

        @keyframes buttonGlitchIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(30px);
            filter: blur(20px) hue-rotate(180deg);
          }
          10% {
            opacity: 0.2;
            transform: translateX(calc(-50% + 30px)) translateY(10px);
            filter: blur(15px) hue-rotate(90deg);
          }
          15% {
            opacity: 0;
            transform: translateX(calc(-50% - 25px)) translateY(5px);
          }
          25% {
            opacity: 0.5;
            transform: translateX(calc(-50% + 15px)) translateY(-5px);
            filter: blur(10px) hue-rotate(270deg);
          }
          35% {
            opacity: 0.1;
            transform: translateX(calc(-50% - 20px)) translateY(8px);
          }
          45% {
            opacity: 0.7;
            transform: translateX(calc(-50% + 10px)) translateY(-3px);
            filter: blur(8px) hue-rotate(45deg);
          }
          55% {
            opacity: 0.3;
            transform: translateX(calc(-50% - 12px)) translateY(4px);
          }
          65% {
            opacity: 0.8;
            transform: translateX(calc(-50% + 8px)) translateY(-2px);
            filter: blur(5px) hue-rotate(180deg);
          }
          75% {
            opacity: 0.4;
            transform: translateX(calc(-50% - 6px)) translateY(2px);
          }
          85% {
            opacity: 0.9;
            transform: translateX(calc(-50% + 3px)) translateY(-1px);
            filter: blur(2px) hue-rotate(90deg);
          }
          95% {
            opacity: 0.6;
            transform: translateX(calc(-50% - 2px)) translateY(1px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px);
            filter: blur(0px) hue-rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
