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
    window.addEventListener('resize', resize);

    // 45 hex particles
    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,
      vx:   (Math.random() - 0.5) * 0.25,
      vy:   -(Math.random() * 0.35 + 0.08),
      size: Math.random() * 14 + 5,
      opacity: Math.random() * 0.1 + 0.03,
      rot:  Math.random() * 360,
      rotV: (Math.random() - 0.5) * 0.4,
    }));

    const drawHex = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = ((i * 60 + rot) * Math.PI) / 180;
        const px = x + r * Math.cos(a);
        const py = y + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(205,127,50,${0.05 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;

        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        if (p.x < -30)              p.x = canvas.width + 20;
        if (p.x > canvas.width + 30) p.x = -20;

        drawHex(p.x, p.y, p.size, p.rot);
        ctx.fillStyle   = `rgba(205,127,50,${p.opacity})`;
        ctx.strokeStyle = `rgba(205,127,50,${p.opacity * 2.2})`;
        ctx.lineWidth   = 0.6;
        ctx.fill();
        ctx.stroke();
      });

      raf = requestAnimationFrame(tick);
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
      style={{ zIndex: 0 }}
    />
  );
}
