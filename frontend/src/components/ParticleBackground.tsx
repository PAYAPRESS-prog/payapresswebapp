'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  rot: number; rotV: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Reduced to 16 particles (was 45) — eliminates O(n²) overhead on mobile
    const COUNT = window.innerWidth < 768 ? 10 : 16;
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      vx:      (Math.random() - 0.5) * 0.18,
      vy:      -(Math.random() * 0.28 + 0.06),
      size:    Math.random() * 12 + 4,
      opacity: Math.random() * 0.09 + 0.02,
      rot:     Math.random() * 360,
      rotV:    (Math.random() - 0.5) * 0.3,
    }));

    const drawHex = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = ((i * 60 + rot) * Math.PI) / 180;
        i === 0
          ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
          : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      }
      ctx.closePath();
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);

      // Skip rendering when tab is not visible — saves battery/CPU
      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connection lines removed: O(n²) was the main CPU cost on mobile
      // (45×44/2 = 990 checks per frame at 60fps = ~59,400/s)

      for (const p of particles) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;

        if (p.y < -30)                p.y = canvas.height + 20, p.x = Math.random() * canvas.width;
        if (p.x < -30)                p.x = canvas.width + 20;
        if (p.x > canvas.width + 30)  p.x = -20;

        drawHex(p.x, p.y, p.size, p.rot);
        ctx.fillStyle   = `rgba(205,127,50,${p.opacity})`;
        ctx.strokeStyle = `rgba(205,127,50,${p.opacity * 2})`;
        ctx.lineWidth   = 0.5;
        ctx.fill();
        ctx.stroke();
      }
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, willChange: 'contents' }}
    />
  );
}
