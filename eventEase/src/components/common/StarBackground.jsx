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

    // --- Configuration ---
    const starColor = '#E11D48'; // Primary Brand Red/Crimson
    const bgStarCount = 1200;
    const heroCount = 3;
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;

    // --- Star Classes ---
    class BackgroundStar {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2000; // Depth for parallax
        this.size = Math.random() * 1.2 + 0.1;
        this.opacity = Math.random() * 0.6 + 0.1;
        this.twinkle = Math.random() * 0.02 + 0.005;
      }
      update(currentScrollY) {
        // Parallax: Stars further away (higher z) move slower
        const parallaxFactor = 50 / (this.z + 1);
        this.currentY = (this.y + currentScrollY * parallaxFactor) % height;
        if (this.currentY < 0) this.currentY += height;

        this.opacity += this.twinkle;
        if (this.opacity > 0.8 || this.opacity < 0.1) this.twinkle = -this.twinkle;
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.currentY, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class HeroStar {
      constructor(index) {
        this.index = index;
        this.x = width * (0.42 + index * 0.08); // Side-by-side near center
        this.yOffset = index * 300; // Vertical stagger
        this.rotation = 0;
      }
      update(currentScrollY) {
        // Hero stars move faster (foreground)
        this.y = ((currentScrollY * 0.8) + this.yOffset) % (height * 3) - height;
        this.rotation += 0.01;
      }
      draw() {
        const x = this.x;
        const y = this.y;
        
        // 1. Draw Vertical Trail (Streak)
        const trailGradient = ctx.createLinearGradient(x, y - 500, x, y);
        trailGradient.addColorStop(0, 'transparent');
        trailGradient.addColorStop(1, `${starColor}66`); // 40% opacity
        
        ctx.beginPath();
        ctx.moveTo(x, y - 500);
        ctx.lineTo(x, y);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = trailGradient;
        ctx.stroke();

        // 2. Draw Glow (Multi-layered for "Bloom")
        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = starColor;
        ctx.globalCompositeOperation = 'screen';
        
        // 3. Draw 4-Point Star Shape
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#FFFFFF'; // Inner core is bright white
        
        const drawCross = (size) => {
          ctx.beginPath();
          ctx.moveTo(-size, 0);
          ctx.lineTo(size, 0);
          ctx.moveTo(0, -size);
          ctx.lineTo(0, size);
          ctx.lineWidth = 2;
          ctx.strokeStyle = starColor;
          ctx.stroke();
          
          // Core point
          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fill();
        };

        drawCross(10);
        
        // Outer faint glow
        ctx.shadowBlur = 80;
        ctx.shadowColor = starColor;
        drawCross(15);

        ctx.restore();
      }
    }

    // --- Initialization ---
    const bgStars = Array.from({ length: bgStarCount }, () => new BackgroundStar());
    const heroes = Array.from({ length: heroCount }, (_, i) => new HeroStar(i));

    const animate = () => {
      // Smooth Scroll Interpolation
      targetScrollY = window.scrollY;
      scrollY += (targetScrollY - scrollY) * 0.1; // Smooth dampening

      ctx.clearRect(0, 0, width, height);

      // Draw Background Nebula
      const nebula = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
      nebula.addColorStop(0, 'rgba(20, 0, 5, 1)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      // Update and Draw Background
      bgStars.forEach(star => {
        star.update(scrollY);
        star.draw();
      });

      // Update and Draw Heroes
      heroes.forEach(hero => {
        hero.update(scrollY);
        hero.draw();
      });

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
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
};

export default StarBackground;
