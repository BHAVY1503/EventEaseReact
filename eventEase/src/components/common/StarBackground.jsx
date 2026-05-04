import React, { useEffect, useRef } from 'react';

const StarBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars = [];
    const numStars = 150; // reduced background stars for focus
    const speedBase = 0.15;
    let lastScrollY = window.scrollY;

    class Star {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 1.2 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = '#FFFFFF'; 
      }

      update(scrollDelta) {
        this.y += speedBase * (1000 / (this.z + 1));
        const scrollFactor = (1000 / (this.z + 1)) * 0.4;
        this.y -= scrollDelta * scrollFactor;

        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
        } else if (this.y < -10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
        this.currentSize = this.size;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
      }
    }

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }

    const animate = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      ctx.clearRect(0, 0, width, height);
      
      // 1. Background Nebula Glow
      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.8);
      gradient.addColorStop(0, 'rgba(5, 5, 5, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw background stars
      stars.forEach(star => {
        star.update(scrollDelta);
        star.draw();
      });

      // 3. Draw THE HERO STARS (3 Stars Staggered)
      const neonColor = '#E11D48';
      const drawHeroStar = (x, yOffset) => {
        // Map scroll to a vertical range, with some constant drift
        const heroYBase = ((currentScrollY * 0.9) + yOffset) % (height * 3);
        const heroY = heroYBase - height * 0.8;
        
        // Trail
        const trailLength = 1000;
        const trailGradient = ctx.createLinearGradient(x, heroY - trailLength, x, heroY);
        trailGradient.addColorStop(0, 'rgba(225, 29, 72, 0)');
        trailGradient.addColorStop(0.5, 'rgba(225, 29, 72, 0.2)');
        trailGradient.addColorStop(1, 'rgba(225, 29, 72, 0.8)');
        
        ctx.beginPath();
        ctx.moveTo(x, heroY - trailLength);
        ctx.lineTo(x, heroY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = trailGradient;
        ctx.stroke();

        // Glowing Point
        ctx.beginPath();
        ctx.arc(x, heroY, 7, 0, Math.PI * 2);
        ctx.fillStyle = neonColor;
        ctx.shadowBlur = 70; // Increased brightness
        ctx.shadowColor = neonColor;
        ctx.fill();
        
        // Inner core
        ctx.beginPath();
        ctx.arc(x, heroY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 20; // Brighter core
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      // Draw Middle Star (First)
      drawHeroStar(width * 0.5, 0);
      
      // Draw Side Stars (Closer distance, Staggered)
      drawHeroStar(width * 0.42, -250);
      drawHeroStar(width * 0.58, -250);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] bg-black"
      style={{ filter: 'contrast(1.2) brightness(0.8)' }}
    />
  );
};

export default StarBackground;
