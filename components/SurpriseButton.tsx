'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './SurpriseButton.module.css';

export default function SurpriseButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.sparkleContainer}>
        {[...Array(6)].map((_, i) => (
          <span key={i} className={styles.sparkle} style={{ animationDelay: `${i * 0.3}s` }}>✨</span>
        ))}
      </div>

      <Link href="/birthday" className={`${styles.surpriseBtn} ${isVisible ? styles.visible : ''}`}>
        <span className={styles.btnGlow}></span>
        <span className={styles.btnContent}>
          <i className="ri-gift-2-line"></i>
          <span>Klik disini</span>
          <i className="ri-heart-3-fill"></i>
        </span>
        <span className={styles.btnRipple}></span>
      </Link>

      <p className={`${styles.hint} ${isVisible ? styles.visible : ''}`}>
        ada kejutan spesial buat kamu 💕
      </p>
    </section>
  );
}
