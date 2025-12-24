// Alienware-style animated starfield background for the marketplace
'use client';
import React, { useEffect, useRef } from 'react';
import '../app/starfield.css';

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Star config
    const STAR_COLORS = ['#39ff14', '#00ffea', '#fff', '#0ff', '#1f2049'];
    const STAR_COUNT = 180;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      o: 0.7 + Math.random() * 0.3,
      r: 0.7 + Math.random() * 1.3,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        // Move star
        star.z -= 1.2;
        if (star.z <= 0) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = width;
        }
        // Project 3D to 2D
        const k = 128.0 / star.z;
        const sx = star.x * k + width / 2;
        const sy = star.y * k + height / 2;
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
        ctx.globalAlpha = star.o;
        ctx.beginPath();
        ctx.arc(sx, sy, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  );
}
