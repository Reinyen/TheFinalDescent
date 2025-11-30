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
  pulledByMeteor?: boolean;
  shouldBePulled?: boolean;
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

interface GlassFragment {
  x: number;
  y: number;
  points: Array<{ x: number; y: number }>;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  glowIntensity: number;
  pulsePhase: number;
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
  const [titleGlitch, setTitleGlitch] = useState({ active: false, intensity: 0 });
  const buttonHoverRef = useRef(false);

  const animationRef = useRef<number | undefined>(undefined);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const glassFragmentsRef = useRef<GlassFragment[]>([]);
  const backgroundMeteorsRef = useRef<BackgroundMeteor[]>([]);
  const energySparksRef = useRef<EnergySpark[]>([]);
  const meteorSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const meteorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const phaseRef = useRef<'starfield' | 'meteor' | 'impact' | 'crater' | 'complete'>('starfield');
  const timeRef = useRef(0);
  const impactTimeRef = useRef(0);
  const nextGlitchRef = useRef(0);

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

    // Initialize stars across ENTIRE screen
    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 400; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height, // Full height coverage
          size: Math.random() * 2.5 + 0.5,
          brightness: Math.random() * 0.6 + 0.4,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          shouldBePulled: Math.random() < 0.3, // Only 30% can be pulled
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

    // Create shattered glass/reality effect
    const createShatteredReality = (x: number, y: number) => {
      const fragments: GlassFragment[] = [];
      const fragmentCount = 40;

      for (let i = 0; i < fragmentCount; i++) {
        const angle = (Math.PI / 2) * (i / fragmentCount) - (Math.PI / 4);
        const distance = Math.random() * 150 + 100;

        const centerX = x + Math.cos(angle) * distance;
        const centerY = y + Math.sin(angle) * distance;

        // Create irregular polygon (glass shard)
        const points: Array<{ x: number; y: number }> = [];
        const sides = Math.floor(Math.random() * 3) + 4; // 4-6 sides
        const size = Math.random() * 40 + 30;

        for (let j = 0; j < sides; j++) {
          const a = (Math.PI * 2 * j) / sides + Math.random() * 0.5;
          const r = size * (0.5 + Math.random() * 0.5);
          points.push({
            x: Math.cos(a) * r,
            y: Math.sin(a) * r,
          });
        }

        fragments.push({
          x: centerX,
          y: centerY,
          points,
          velocity: {
            x: (Math.random() - 0.5) * 0.3,
            y: (Math.random() - 0.5) * 0.3,
          },
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          alpha: 0.7,
          glowIntensity: Math.random() * 0.5 + 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      glassFragmentsRef.current = fragments;
    };

    // Spawn background meteor - MUCH LARGER AND FASTER
    const spawnBackgroundMeteor = () => {
      if (phaseRef.current !== 'crater' && phaseRef.current !== 'complete') return;

      const side = Math.random();
      let x, y, vx, vy;

      if (side < 0.33) {
        // From top left
        x = Math.random() * canvas.width * 0.3;
        y = -50;
        vx = Math.random() * 4 + 3;
        vy = Math.random() * 8 + 6;
      } else if (side < 0.66) {
        // From top right
        x = canvas.width - Math.random() * canvas.width * 0.3;
        y = -50;
        vx = -(Math.random() * 4 + 3);
        vy = Math.random() * 8 + 6;
      } else {
        // Diagonal across screen
        if (Math.random() < 0.5) {
          x = -50;
          y = Math.random() * canvas.height * 0.3;
          vx = Math.random() * 6 + 5;
          vy = Math.random() * 6 + 4;
        } else {
          x = canvas.width + 50;
          y = Math.random() * canvas.height * 0.3;
          vx = -(Math.random() * 6 + 5);
          vy = Math.random() * 6 + 4;
        }
      }

      backgroundMeteorsRef.current.push({
        x, y, vx, vy,
        size: Math.random() * 8 + 10, // Much larger: 10-18px
        life: 1,
        burnProgress: 0,
      });
    };

    // Create energy sparks for title
    const createEnergySparks = (titleX: number, titleY: number) => {
      if (Math.random() < 0.15) {
        const sparkCount = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < sparkCount; i++) {
          energySparksRef.current.push({
            x: titleX + (Math.random() - 0.5) * 700,
            y: titleY + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: Math.random() * 0.7 + 0.5,
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

        // Pull SOME stars toward meteor (only those marked shouldBePulled)
        if (phaseRef.current === 'meteor' && meteorRef.current.active && star.shouldBePulled) {
          const dx = star.x - meteorRef.current.x;
          const dy = star.y - meteorRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200 && star.y < meteorRef.current.y && !star.pulledByMeteor) {
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
          createShatteredReality(canvas.width / 2, canvas.height);

          setTimeout(() => {
            setShowTitle(true);
            nextGlitchRef.current = timeRef.current + Math.random() * 2 + 0.5;
          }, 1500);

          setTimeout(() => setShowButton(true), 3000);

          // Start spawning background meteors - more frequently
          meteorSpawnIntervalRef.current = setInterval(() => {
            if (Math.random() < 0.7) spawnBackgroundMeteor();
          }, 1500);
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

      // Draw shattered glass/reality effect
      if (phaseRef.current === 'crater' || phaseRef.current === 'complete') {
        glassFragmentsRef.current.forEach(fragment => {
          fragment.x += fragment.velocity.x;
          fragment.y += fragment.velocity.y;
          fragment.rotation += fragment.rotationSpeed;
          fragment.pulsePhase += 0.03;

          const pulse = Math.sin(fragment.pulsePhase) * 0.3 + 0.7;

          ctx.save();
          ctx.translate(fragment.x, fragment.y);
          ctx.rotate(fragment.rotation);

          // Draw glass fragment with multiple layers

          // Outer glow
          ctx.strokeStyle = `rgba(120, 80, 200, ${fragment.alpha * 0.4 * pulse})`;
          ctx.lineWidth = 6;
          ctx.lineJoin = 'miter';
          ctx.beginPath();
          fragment.points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.stroke();

          // Middle layer - brighter
          ctx.strokeStyle = `rgba(180, 120, 255, ${fragment.alpha * 0.6 * pulse * fragment.glowIntensity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          fragment.points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.stroke();

          // Core white line
          ctx.strokeStyle = `rgba(255, 255, 255, ${fragment.alpha * 0.8 * pulse})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          fragment.points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.stroke();

          // Fill with semi-transparent purple void
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
          gradient.addColorStop(0, `rgba(100, 50, 150, ${fragment.alpha * 0.15 * pulse})`);
          gradient.addColorStop(1, `rgba(80, 40, 120, ${fragment.alpha * 0.05 * pulse})`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          fragment.points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.fill();

          ctx.restore();
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

      // Background meteors - MUCH MORE VISIBLE
      backgroundMeteorsRef.current = backgroundMeteorsRef.current.filter(m => {
        m.x += m.vx;
        m.y += m.vy;
        m.burnProgress += 0.015;

        if (m.burnProgress < 1 && m.y < canvas.height - 150) {
          // Long, bright trail
          for (let i = 0; i < 10; i++) {
            const trailX = m.x - m.vx * i * 5;
            const trailY = m.y - m.vy * i * 5;
            const trailAlpha = (1 - m.burnProgress) * (10 - i) / 10 * 0.8;
            const trailSize = m.size * (1 - i * 0.08);

            const trailGradient = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, trailSize * 3);
            trailGradient.addColorStop(0, `rgba(255, 240, 200, ${trailAlpha})`);
            trailGradient.addColorStop(0.4, `rgba(255, 180, 120, ${trailAlpha * 0.7})`);
            trailGradient.addColorStop(1, `rgba(255, 100, 50, 0)`);
            ctx.fillStyle = trailGradient;
            ctx.beginPath();
            ctx.arc(trailX, trailY, trailSize * 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Meteor body with glow
          const meteorAlpha = 1 - m.burnProgress;
          const bodyGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 2);
          bodyGlow.addColorStop(0, `rgba(255, 255, 255, ${meteorAlpha})`);
          bodyGlow.addColorStop(0.5, `rgba(255, 200, 150, ${meteorAlpha * 0.8})`);
          bodyGlow.addColorStop(1, `rgba(255, 150, 100, 0)`);
          ctx.fillStyle = bodyGlow;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * 2, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(255, 240, 220, ${meteorAlpha})`;
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

            // Spark trail
            ctx.fillStyle = `rgba(200, 150, 255, ${alpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Spark glow
            const sparkGlow = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, 10);
            sparkGlow.addColorStop(0, `rgba(255, 200, 255, ${alpha})`);
            sparkGlow.addColorStop(0.5, `rgba(220, 180, 255, ${alpha * 0.6})`);
            sparkGlow.addColorStop(1, 'rgba(200, 150, 255, 0)');
            ctx.fillStyle = sparkGlow;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 10, 0, Math.PI * 2);
            ctx.fill();

            return true;
          }
          return false;
        });

        // Title glitch effect - update state to trigger re-render
        if (timeRef.current > nextGlitchRef.current) {
          setTitleGlitch({ active: true, intensity: Math.random() });
          nextGlitchRef.current = timeRef.current + Math.random() * 3 + 1;
          setTimeout(() => {
            setTitleGlitch({ active: false, intensity: 0 });
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
      if (meteorSpawnIntervalRef.current) {
        clearInterval(meteorSpawnIntervalRef.current);
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
