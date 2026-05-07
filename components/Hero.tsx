'use client';

import { useEffect, useState } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const scrollToNext = () => {
    const section = document.getElementById('soundtrack');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero}>
      {/* Ambient glow orbs */}
      <div className={styles.orbContainer}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
        <div className={`${styles.orb} ${styles.orb3}`}></div>
      </div>

      <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
        <p className={styles.preTitle}>for my favorite person ✨</p>
        <h1 className={styles.mainTitle}>
          She Is<br />
          <span className={styles.highlight}>Everything</span>
        </h1>
        <p className={styles.subText}>
          Every moment with you is a favorite memory.<br />
          You are the reason I believe in love.
        </p>

        <div className={styles.dateBadge}>
          <i className="ri-heart-3-fill"></i>
          <span>Together since the day we met</span>
        </div>
      </div>

      <button className={styles.scrollDown} onClick={scrollToNext} aria-label="Scroll to content">
        <span>Scroll to see us</span>
        <i className="ri-arrow-down-line"></i>
      </button>
    </section>
  );
}
