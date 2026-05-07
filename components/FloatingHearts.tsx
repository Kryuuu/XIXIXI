'use client';

import { useEffect, useRef } from 'react';

export default function FloatingHearts() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createHeart = () => {
      const heart = document.createElement('div');
      const size = Math.random() * 20 + 8;
      const left = Math.random() * 100;
      const duration = Math.random() * 8 + 8;
      const delay = Math.random() * 5;

      heart.innerHTML = '❤';
      heart.style.cssText = `
        position: fixed;
        left: ${left}%;
        font-size: ${size}px;
        opacity: 0;
        pointer-events: none;
        z-index: 0;
        animation: floatHeart ${duration}s ${delay}s ease-in infinite;
        color: rgba(236, 64, 122, ${Math.random() * 0.3 + 0.1});
        filter: blur(${size > 20 ? 1 : 0}px);
      `;

      container.appendChild(heart);

      // Clean up after animation
      setTimeout(() => {
        if (heart.parentNode === container) {
          container.removeChild(heart);
        }
      }, (duration + delay) * 1000);
    };

    // Create initial batch
    for (let i = 0; i < 12; i++) {
      setTimeout(() => createHeart(), i * 400);
    }

    // Continue creating hearts
    const interval = setInterval(createHeart, 2500);

    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}
