/**
 * Intro Screen - Animated starfield telling the catastrophe story
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

interface VoidCrack {
  x: number;
  y: number;
  angle: number;
  length: number;
  growth: number;
}

export function IntroScreen({ onBegin }: { onBegin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const buttonHoverRef = useRef(false);
  const showButtonRef = useRef(false);
  const starsRef = useRef<Star[]>([]);
  const cracksRef = useRef<VoidCrack[]>([]);
  const meteorRef = useRef<{ x: number; y: number; active: boolean; pulledStars: Star[] }>({
    x: 0,
    y: 0,
    active: false,
    pulledStars: [],
  });
  const phaseRef = useRef<'starfield' | 'meteor' | 'impact' | 'crater' | 'complete'>('starfield');
  const timeRef = useRef(0);
  const impactTimeRef = useRef(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousBackground = document.body.style.background;
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#05050c';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.background = previousBackground;
    };
  }, []);

  useEffect(() => {
    buttonHoverRef.current = buttonHover;
  }, [buttonHover]);

  useEffect(() => {
    showButtonRef.current = showButton;
  }, [showButton]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      setInitFailed(true);
      setShowTitle(true);
      setShowButton(true);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2d context');
      setInitFailed(true);
      setShowTitle(true);
      setShowButton(true);
      return;
    }

    setCanvasReady(true);

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize stars
    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.5 + 0.5,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };
    initStars();

    // Start meteor quickly so the intro never feels blank
    const meteorTimer = setTimeout(() => {
      if (phaseRef.current === 'starfield') {
        phaseRef.current = 'meteor';
        meteorRef.current = {
          x: canvas.width / 2,
          y: -50,
          active: true,
          pulledStars: [],
        };
      }
    }, 600);

    // Fallback: show title/button even if animation stalls
    const titleTimer = setTimeout(() => setShowTitle(true), 2800);
    const buttonTimer = setTimeout(() => setShowButton(true), 3800);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.016;
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#0f1026');
      skyGradient.addColorStop(0.45, '#0b0b19');
      skyGradient.addColorStop(1, '#06060f');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      starsRef.current.forEach((star, index) => {
        // Twinkling effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const alpha = Math.min(1, star.brightness * twinkle + 0.2);

        // Check if pulled by meteor
        if (phaseRef.current === 'meteor' && meteorRef.current.active) {
          const dx = star.x - meteorRef.current.x;
          const dy = star.y - meteorRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150 && star.y < meteorRef.current.y) {
            star.pulledByMeteor = true;
            meteorRef.current.pulledStars.push(star);
          }
        }

        // Update pulled stars
        if (star.pulledByMeteor) {
          const dx = meteorRef.current.x - star.x;
          const dy = meteorRef.current.y - star.y;
          star.x += dx * 0.05;
          star.y += dy * 0.05 + 3;
        }

        // Sporadic falling (only during starfield phase)
        if (phaseRef.current === 'starfield' && Math.random() < 0.001 && !star.falling) {
          star.falling = true;
          star.fallSpeed = Math.random() * 2 + 1;
        }

        if (star.falling && star.fallSpeed) {
          star.y += star.fallSpeed;
          star.fallSpeed += 0.1;
          if (star.y > canvas.height + 10) {
            star.y = -10;
            star.x = Math.random() * canvas.width;
            star.falling = false;
            star.fallSpeed = undefined;
          }
        }

        // Check if star is near crack and pull it in
        if (phaseRef.current === 'crater') {
          for (const crack of cracksRef.current) {
            const crackEndX = canvas.width / 2 + Math.cos(crack.angle) * crack.length;
            const crackEndY = canvas.height + Math.sin(crack.angle) * crack.length;
            const distToCrack = Math.sqrt(
              Math.pow(star.x - crackEndX, 2) + Math.pow(star.y - crackEndY, 2)
            );

            if (distToCrack < 40) {
              star.x += (canvas.width / 2 - star.x) * 0.02;
              star.y += (canvas.height - star.y) * 0.02;
              star.size *= 0.98;
              if (star.size < 0.1) {
                // Reset star far away
                star.x = Math.random() * canvas.width;
                star.y = Math.random() * canvas.height * 0.5;
                star.size = Math.random() * 2 + 0.5;
              }
            }
          }
        }

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow for larger stars
        if (star.size > 1.5) {
          ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw meteor
      if (phaseRef.current === 'meteor' && meteorRef.current.active) {
        const meteor = meteorRef.current;
        meteor.y += 6;

        // Meteor body
        const gradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 25);
        gradient.addColorStop(0, 'rgba(255, 240, 200, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 180, 100, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Meteor trail
        for (let i = 0; i < 5; i++) {
          const trailY = meteor.y - (i * 20);
          const trailAlpha = (5 - i) / 5 * 0.6;
          ctx.fillStyle = `rgba(255, 150, 80, ${trailAlpha})`;
          ctx.beginPath();
          ctx.arc(meteor.x, trailY, 15 - i * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Impact
        if (meteor.y >= canvas.height - 50) {
          phaseRef.current = 'impact';
          meteorRef.current.active = false;
          impactTimeRef.current = timeRef.current;

          // Create cracks
          const crackCount = 12;
          for (let i = 0; i < crackCount; i++) {
            cracksRef.current.push({
              x: canvas.width / 2,
              y: canvas.height,
              angle: -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8,
              length: 0,
              growth: Math.random() * 3 + 2,
            });
          }

          // Show title after impact
          setTimeout(() => setShowTitle(true), 1000);
          setTimeout(() => setShowButton(true), 2000);
        }
      }

      // Impact flash and shockwave
      if (phaseRef.current === 'impact') {
        const timeSinceImpact = timeRef.current - impactTimeRef.current;

        if (timeSinceImpact < 0.5) {
          // Flash
          const flashAlpha = Math.max(0, 0.8 - timeSinceImpact * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Shockwave
        if (timeSinceImpact < 1) {
          const shockwaveRadius = timeSinceImpact * 500;
          const shockwaveAlpha = Math.max(0, 0.6 - timeSinceImpact);

          const shockGradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height,
            shockwaveRadius - 20,
            canvas.width / 2,
            canvas.height,
            shockwaveRadius + 20
          );
          shockGradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
          shockGradient.addColorStop(0.5, `rgba(255, 150, 80, ${shockwaveAlpha})`);
          shockGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

          ctx.fillStyle = shockGradient;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height, shockwaveRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (timeSinceImpact > 1) {
          phaseRef.current = 'crater';
        }
      }

      // Draw void cracks
      if (phaseRef.current === 'crater' || phaseRef.current === 'complete') {
        ctx.strokeStyle = 'rgba(100, 50, 150, 0.8)';
        ctx.lineWidth = 2;

        cracksRef.current.forEach(crack => {
          if (crack.length < 300) {
            crack.length += crack.growth;
          }

          ctx.beginPath();
          ctx.moveTo(crack.x, crack.y);
          const endX = crack.x + Math.cos(crack.angle) * crack.length;
          const endY = crack.y + Math.sin(crack.angle) * crack.length;
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Void glow
          const crackGradient = ctx.createLinearGradient(crack.x, crack.y, endX, endY);
          crackGradient.addColorStop(0, 'rgba(80, 40, 120, 0.4)');
          crackGradient.addColorStop(1, 'rgba(120, 60, 180, 0)');
          ctx.strokeStyle = crackGradient;
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.strokeStyle = 'rgba(100, 50, 150, 0.8)';
          ctx.lineWidth = 2;
        });

        // Void crater center glow
        const craterGradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height,
          0,
          canvas.width / 2,
          canvas.height,
          150
        );
        craterGradient.addColorStop(0, 'rgba(100, 50, 150, 0.3)');
        craterGradient.addColorStop(1, 'rgba(80, 40, 120, 0)');
        ctx.fillStyle = craterGradient;
        ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
      }

      // Draw ghostly trails on hover
      if (buttonHoverRef.current && showButtonRef.current) {
        // Six stars representing the original expedition
        for (let i = 0; i < 6; i++) {
          const offsetX = (i - 2.5) * 80;
          const startY = canvas.height * 0.3 + Math.sin(timeRef.current * 2 + i) * 20;

          ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 + Math.sin(timeRef.current * 3 + i) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 10]);

          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + offsetX, startY);
          ctx.lineTo(canvas.width / 2, canvas.height - 100);
          ctx.stroke();

          ctx.setLineDash([]);

          // Ghostly star at trail start
          ctx.fillStyle = `rgba(150, 200, 255, ${0.4 + Math.sin(timeRef.current * 3 + i) * 0.2})`;
          ctx.beginPath();
          ctx.arc(canvas.width / 2 + offsetX, startY, 3, 0, Math.PI * 2);
          ctx.fill();
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
      clearTimeout(meteorTimer);
      clearTimeout(titleTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c0d1d 0%, #060610 65%, #04040a 100%)' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {!canvasReady && !initFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-gradient-to-b from-black/30 via-transparent to-black/50">
          <p className="text-lg font-semibold tracking-wide">Preparing the descent...</p>
          <p className="text-sm text-slate-400 mt-2">If this screen stays empty, the button below will still let you begin.</p>
        </div>
      )}

      {initFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 bg-black/60 backdrop-blur-sm text-center px-6">
          <p className="text-lg font-semibold">Canvas unavailable</p>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Your browser blocked the intro animation, but you can still start the expedition immediately below.
          </p>
        </div>
      )}

      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center max-w-2xl px-6 text-slate-200 drop-shadow-md">
        <p className="text-lg font-semibold tracking-wide">Signal lost. Six souls vanished into the Abyss.</p>
        <p className="text-sm text-slate-400 mt-1">
          Watch the starfield coalesce. Once the impact stabilizes, begin your own descent to uncover their fate.
        </p>
      </div>

      {showTitle && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1
            className="text-7xl font-bold text-white mb-8 animate-fade-in tracking-wider"
            style={{
              textShadow: '0 0 20px rgba(150, 100, 200, 0.8), 0 0 40px rgba(100, 50, 150, 0.4)',
              animation: 'fadeIn 1.5s ease-out',
            }}
          >
            THE FINAL DESCENT
          </h1>
        </div>
      )}

      {showButton && (
        <div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto"
          style={{ animation: 'fadeIn 1s ease-out' }}
        >
          <button
            aria-label="Begin the descent"
            onClick={onBegin}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            className="px-8 py-4 bg-purple-900/50 hover:bg-purple-800/70 text-white text-xl rounded-lg border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300"
            style={{
              textShadow: '0 0 10px rgba(150, 100, 200, 0.8)',
              boxShadow: buttonHover
                ? '0 0 30px rgba(150, 100, 200, 0.6)'
                : '0 0 15px rgba(100, 50, 150, 0.4)',
            }}
          >
            Begin the Descent
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
