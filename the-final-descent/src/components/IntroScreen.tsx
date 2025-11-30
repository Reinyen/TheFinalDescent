/**
 * Intro Screen - Professional cinematic animation
 */

import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  falling?: boolean;
  fallSpeed?: number;
  pulledByMeteor?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: { r: number; g: number; b: number };
}

interface VoidBeam {
  x: number;
  y: number;
  angle: number;
  length: number;
  growth: number;
  pulsePhase: number;
  branches: Array<{ offset: number; angle: number; length: number }>;
}

interface BackgroundMeteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  burnProgress: number;
}

interface EnergySpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function IntroScreen({ onBegin }: { onBegin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const buttonHoverRef = useRef(false);

  const animationRef = useRef<number | undefined>(undefined);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const beamsRef = useRef<VoidBeam[]>([]);
  const backgroundMeteorsRef = useRef<BackgroundMeteor[]>([]);
  const energySparksRef = useRef<EnergySpark[]>([]);

  const meteorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const phaseRef = useRef<'starfield' | 'meteor' | 'impact' | 'crater' | 'complete'>('starfield');
  const timeRef = useRef(0);
  const impactTimeRef = useRef(0);
  const glitchRef = useRef({ active: false, intensity: 0, nextGlitch: 0 });

  useEffect(() => {
    buttonHoverRef.current = buttonHover;
  }, [buttonHover]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize stars with better distribution
    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 300; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          brightness: Math.random() * 0.6 + 0.4,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };
    initStars();

    // Create explosion particles
    const createExplosion = (x: number, y: number) => {
      const particles: Particle[] = [];

      // Main explosion particles (orange/yellow)
      for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          life: 1,
          maxLife: Math.random() * 1.5 + 1,
          color: {
            r: 255,
            g: Math.random() * 100 + 155,
            b: Math.random() * 50
          },
        });
      }

      // Purple void particles
      for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          life: 1,
          maxLife: Math.random() * 2 + 1.5,
          color: {
            r: Math.random() * 100 + 100,
            g: Math.random() * 50 + 50,
            b: Math.random() * 100 + 150
          },
        });
      }

      particlesRef.current = particles;
    };

    // Create void beams with branches
    const createVoidBeams = (x: number, y: number) => {
      const beams: VoidBeam[] = [];
      const beamCount = 16;

      for (let i = 0; i < beamCount; i++) {
        const mainAngle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const beam: VoidBeam = {
          x,
          y,
          angle: mainAngle,
          length: 0,
          growth: Math.random() * 4 + 3,
          pulsePhase: Math.random() * Math.PI * 2,
          branches: [],
        };

        // Add branches to each beam
        const branchCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < branchCount; j++) {
          beam.branches.push({
            offset: Math.random() * 0.7 + 0.3,
            angle: (Math.random() - 0.5) * Math.PI * 0.5,
            length: Math.random() * 100 + 50,
          });
        }

        beams.push(beam);
      }

      beamsRef.current = beams;
    };

    // Spawn background meteor
    const spawnBackgroundMeteor = () => {
      if (phaseRef.current !== 'crater' && phaseRef.current !== 'complete') return;

      const side = Math.random();
      let x, y, vx, vy;

      if (side < 0.5) {
        // From left
        x = -50;
        y = Math.random() * canvas.height * 0.5;
        vx = Math.random() * 3 + 2;
        vy = Math.random() * 4 + 3;
      } else {
        // From right
        x = canvas.width + 50;
        y = Math.random() * canvas.height * 0.5;
        vx = -(Math.random() * 3 + 2);
        vy = Math.random() * 4 + 3;
      }

      backgroundMeteorsRef.current.push({
        x, y, vx, vy,
        size: Math.random() * 3 + 2,
        life: 1,
        burnProgress: 0,
      });
    };

    // Create energy sparks for title
    const createEnergySparks = (titleX: number, titleY: number) => {
      if (Math.random() < 0.1) {
        const sparkCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < sparkCount; i++) {
          energySparksRef.current.push({
            x: titleX + (Math.random() - 0.5) * 600,
            y: titleY + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: Math.random() * 0.5 + 0.5,
          });
        }
      }
    };

    // Start meteor after 2 seconds
    setTimeout(() => {
      if (phaseRef.current === 'starfield') {
        phaseRef.current = 'meteor';
        meteorRef.current = {
          x: canvas.width / 2,
          y: -50,
          active: true,
        };
      }
    }, 2000);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.016;

      // Background
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      starsRef.current.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const alpha = Math.min(1.0, star.brightness * twinkle);

        // Pull stars toward meteor
        if (phaseRef.current === 'meteor' && meteorRef.current.active) {
          const dx = star.x - meteorRef.current.x;
          const dy = star.y - meteorRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200 && star.y < meteorRef.current.y) {
            star.pulledByMeteor = true;
          }
        }

        if (star.pulledByMeteor) {
          const dx = meteorRef.current.x - star.x;
          const dy = meteorRef.current.y - star.y;
          star.x += dx * 0.08;
          star.y += dy * 0.08 + 4;
        }

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        if (star.size > 1.5) {
          const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          glowGradient.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.4})`);
          glowGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw meteor
      if (phaseRef.current === 'meteor' && meteorRef.current.active) {
        const meteor = meteorRef.current;
        meteor.y += 6;

        // Meteor glow
        const meteorGlow = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 60);
        meteorGlow.addColorStop(0, 'rgba(255, 240, 200, 1)');
        meteorGlow.addColorStop(0.3, 'rgba(255, 180, 100, 0.8)');
        meteorGlow.addColorStop(0.6, 'rgba(255, 120, 60, 0.4)');
        meteorGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = meteorGlow;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 60, 0, Math.PI * 2);
        ctx.fill();

        // Meteor core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Trail particles
        for (let i = 0; i < 8; i++) {
          const trailY = meteor.y - (i * 30);
          const trailSize = 25 - i * 2;
          const trailAlpha = (8 - i) / 8;

          const trailGradient = ctx.createRadialGradient(
            meteor.x + (Math.random() - 0.5) * 10,
            trailY,
            0,
            meteor.x,
            trailY,
            trailSize
          );
          trailGradient.addColorStop(0, `rgba(255, 200, 100, ${trailAlpha * 0.9})`);
          trailGradient.addColorStop(0.5, `rgba(255, 120, 60, ${trailAlpha * 0.6})`);
          trailGradient.addColorStop(1, `rgba(255, 80, 40, 0)`);

          ctx.fillStyle = trailGradient;
          ctx.beginPath();
          ctx.arc(meteor.x, trailY, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Impact
        if (meteor.y >= canvas.height - 100) {
          phaseRef.current = 'impact';
          meteorRef.current.active = false;
          impactTimeRef.current = timeRef.current;

          createExplosion(canvas.width / 2, canvas.height);
          createVoidBeams(canvas.width / 2, canvas.height);

          setTimeout(() => {
            setShowTitle(true);
            glitchRef.current.nextGlitch = timeRef.current + Math.random() * 2 + 0.5;
          }, 1500);

          setTimeout(() => setShowButton(true), 3000);

          // Start spawning background meteors
          setInterval(() => {
            if (Math.random() < 0.3) spawnBackgroundMeteor();
          }, 2000);
        }
      }

      // Impact effects
      if (phaseRef.current === 'impact' || phaseRef.current === 'crater' || phaseRef.current === 'complete') {
        const timeSinceImpact = timeRef.current - impactTimeRef.current;

        // Flash
        if (timeSinceImpact < 0.3) {
          const flashAlpha = Math.max(0, 1 - timeSinceImpact * 3.5);
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Massive shockwave rings
        for (let ring = 0; ring < 3; ring++) {
          const delay = ring * 0.15;
          if (timeSinceImpact > delay && timeSinceImpact < delay + 2) {
            const ringTime = timeSinceImpact - delay;
            const shockwaveRadius = ringTime * 600;
            const shockwaveAlpha = Math.max(0, 0.7 - ringTime * 0.4);

            const shockGradient = ctx.createRadialGradient(
              canvas.width / 2,
              canvas.height,
              Math.max(0, shockwaveRadius - 40),
              canvas.width / 2,
              canvas.height,
              shockwaveRadius + 40
            );
            shockGradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
            shockGradient.addColorStop(0.5, `rgba(255, 150, 80, ${shockwaveAlpha})`);
            shockGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

            ctx.fillStyle = shockGradient;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height, shockwaveRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Update and draw explosion particles
        particlesRef.current = particlesRef.current.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2; // Gravity
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.life -= 0.016 / p.maxLife;

          if (p.life > 0) {
            const alpha = p.life;
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();

            // Particle glow
            const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2 * p.life);
            particleGlow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.5})`);
            particleGlow.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
            ctx.fillStyle = particleGlow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2 * p.life, 0, Math.PI * 2);
            ctx.fill();

            return true;
          }
          return false;
        });

        if (timeSinceImpact > 1) {
          phaseRef.current = 'crater';
        }
      }

      // Draw void beams with energy
      if (phaseRef.current === 'crater' || phaseRef.current === 'complete') {
        beamsRef.current.forEach(beam => {
          if (beam.length < 400) {
            beam.length += beam.growth;
          }
          beam.pulsePhase += 0.05;
          const pulse = Math.sin(beam.pulsePhase) * 0.3 + 0.7;

          // Main beam
          const endX = beam.x + Math.cos(beam.angle) * beam.length;
          const endY = beam.y + Math.sin(beam.angle) * beam.length;

          // Outer glow
          const glowGradient = ctx.createLinearGradient(beam.x, beam.y, endX, endY);
          glowGradient.addColorStop(0, `rgba(120, 60, 180, ${0.6 * pulse})`);
          glowGradient.addColorStop(0.5, `rgba(150, 80, 200, ${0.4 * pulse})`);
          glowGradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
          ctx.strokeStyle = glowGradient;
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(beam.x, beam.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Inner bright line
          const brightGradient = ctx.createLinearGradient(beam.x, beam.y, endX, endY);
          brightGradient.addColorStop(0, `rgba(200, 150, 255, ${0.9 * pulse})`);
          brightGradient.addColorStop(0.7, `rgba(150, 100, 220, ${0.6 * pulse})`);
          brightGradient.addColorStop(1, 'rgba(120, 80, 180, 0)');
          ctx.strokeStyle = brightGradient;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(beam.x, beam.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Core line
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * pulse})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(beam.x, beam.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Draw branches
          beam.branches.forEach(branch => {
            const branchStartX = beam.x + Math.cos(beam.angle) * beam.length * branch.offset;
            const branchStartY = beam.y + Math.sin(beam.angle) * beam.length * branch.offset;
            const branchAngle = beam.angle + branch.angle;
            const branchEndX = branchStartX + Math.cos(branchAngle) * branch.length;
            const branchEndY = branchStartY + Math.sin(branchAngle) * branch.length;

            const branchGradient = ctx.createLinearGradient(branchStartX, branchStartY, branchEndX, branchEndY);
            branchGradient.addColorStop(0, `rgba(150, 80, 200, ${0.5 * pulse})`);
            branchGradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
            ctx.strokeStyle = branchGradient;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(branchStartX, branchStartY);
            ctx.lineTo(branchEndX, branchEndY);
            ctx.stroke();
          });
        });

        // Crater glow with pulsing
        const craterPulse = Math.sin(timeRef.current * 2) * 0.2 + 0.8;
        const craterGradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height,
          0,
          canvas.width / 2,
          canvas.height,
          250
        );
        craterGradient.addColorStop(0, `rgba(120, 60, 180, ${0.4 * craterPulse})`);
        craterGradient.addColorStop(0.5, `rgba(100, 50, 150, ${0.2 * craterPulse})`);
        craterGradient.addColorStop(1, 'rgba(80, 40, 120, 0)');
        ctx.fillStyle = craterGradient;
        ctx.fillRect(0, canvas.height - 300, canvas.width, 300);
      }

      // Background meteors
      backgroundMeteorsRef.current = backgroundMeteorsRef.current.filter(m => {
        m.x += m.vx;
        m.y += m.vy;
        m.burnProgress += 0.02;

        if (m.burnProgress < 1 && m.y < canvas.height - 200) {
          // Meteor trail
          for (let i = 0; i < 4; i++) {
            const trailX = m.x - m.vx * i * 3;
            const trailY = m.y - m.vy * i * 3;
            const trailAlpha = (1 - m.burnProgress) * (4 - i) / 4 * 0.6;

            const trailGradient = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, m.size * 2);
            trailGradient.addColorStop(0, `rgba(255, 200, 150, ${trailAlpha})`);
            trailGradient.addColorStop(1, `rgba(255, 100, 50, 0)`);
            ctx.fillStyle = trailGradient;
            ctx.beginPath();
            ctx.arc(trailX, trailY, m.size * 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Meteor body
          const meteorAlpha = 1 - m.burnProgress;
          ctx.fillStyle = `rgba(255, 220, 180, ${meteorAlpha})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fill();

          return true;
        }
        return false;
      });

      // Energy sparks for title
      if (showTitle) {
        createEnergySparks(canvas.width / 2, canvas.height * 0.35);

        energySparksRef.current = energySparksRef.current.filter(spark => {
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.life -= 0.016;

          if (spark.life > 0) {
            const alpha = spark.life;
            ctx.fillStyle = `rgba(200, 150, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
            ctx.fill();

            // Spark glow
            const sparkGlow = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, 6);
            sparkGlow.addColorStop(0, `rgba(255, 200, 255, ${alpha * 0.8})`);
            sparkGlow.addColorStop(1, 'rgba(200, 150, 255, 0)');
            ctx.fillStyle = sparkGlow;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 6, 0, Math.PI * 2);
            ctx.fill();

            return true;
          }
          return false;
        });

        // Title glitch effect
        if (timeRef.current > glitchRef.current.nextGlitch) {
          glitchRef.current.active = true;
          glitchRef.current.intensity = Math.random();
          glitchRef.current.nextGlitch = timeRef.current + Math.random() * 3 + 1;
          setTimeout(() => {
            glitchRef.current.active = false;
          }, 50 + Math.random() * 100);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0a0a14]">
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
            transform: glitchRef.current.active
              ? `translate(${(Math.random() - 0.5) * 20 * glitchRef.current.intensity}px, ${(Math.random() - 0.5) * 10 * glitchRef.current.intensity}px)`
              : 'translate(0, 0)',
          }}
        >
          <h1
            className="text-8xl font-bold text-white tracking-widest select-none"
            style={{
              fontFamily: "'Rubik Burned', cursive",
              textShadow: glitchRef.current.active
                ? `
                  ${(Math.random() - 0.5) * 10}px ${(Math.random() - 0.5) * 10}px 20px rgba(255, 0, 100, ${glitchRef.current.intensity}),
                  ${(Math.random() - 0.5) * 10}px ${(Math.random() - 0.5) * 10}px 20px rgba(0, 255, 255, ${glitchRef.current.intensity}),
                  0 0 40px rgba(150, 100, 200, 0.9),
                  0 0 80px rgba(100, 50, 150, 0.6),
                  0 0 120px rgba(80, 40, 120, 0.4)
                `
                : `
                  0 0 40px rgba(150, 100, 200, 0.9),
                  0 0 80px rgba(100, 50, 150, 0.6),
                  0 0 120px rgba(80, 40, 120, 0.4)
                `,
              filter: glitchRef.current.active
                ? `hue-rotate(${Math.random() * 360}deg) saturate(${1 + glitchRef.current.intensity * 2})`
                : 'none',
              opacity: glitchRef.current.active && Math.random() < 0.3 ? 0.3 : 1,
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
            animation: 'buttonGlitchIn 0.8s ease-out, buttonFloat 4s ease-in-out infinite',
          }}
        >
          <div
            onClick={onBegin}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            className="cursor-pointer transition-all duration-300"
            style={{
              fontFamily: "'Rubik Burned', cursive",
              fontSize: '2.5rem',
              color: 'white',
              textShadow: buttonHoverRef.current
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
              filter: buttonHoverRef.current ? 'brightness(1.3)' : 'brightness(1)',
              letterSpacing: '0.1em',
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
            transform: translateX(-50%) translateY(20px);
            filter: blur(10px);
          }
          20% {
            opacity: 0.3;
            transform: translateX(calc(-50% + 10px)) translateY(0px);
          }
          40% {
            opacity: 0.7;
            transform: translateX(calc(-50% - 8px)) translateY(0px);
          }
          60% {
            opacity: 0.4;
            transform: translateX(calc(-50% + 5px)) translateY(0px);
          }
          80% {
            opacity: 0.9;
            transform: translateX(calc(-50% - 3px)) translateY(0px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px);
            filter: blur(0px);
          }
        }
      `}</style>
    </div>
  );
}
