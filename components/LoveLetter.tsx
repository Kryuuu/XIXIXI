'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LoveLetter.module.css';

export default function LoveLetter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="love-letter" className={styles.section} ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title">A Letter for You</h2>
        <p className="section-subtitle">dari hati yang paling dalam ❤️</p>

        <div className={`${styles.letterCard} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.letterSeal}>
            <span>❤</span>
          </div>
          
          <div className={styles.letterContent}>
            <p className={styles.greeting}>Dear, My Love...</p>
            
            <p className={styles.letterBody}>
              Terima kasih sudah hadir di hidupku. Kamu adalah alasan kenapa setiap hari terasa lebih 
              berwarna, setiap tawa terasa lebih berarti, dan setiap momen menjadi kenangan yang 
              tak terlupakan.
            </p>
            
            <p className={styles.letterBody}>
              Bersama kamu, aku belajar bahwa cinta bukan tentang sempurna — tapi tentang menemukan 
              seseorang yang membuat segalanya terasa <em>cukup</em>. Dan kamu lebih dari cukup, 
              kamu adalah segalanya.
            </p>

            <p className={styles.letterBody}>
              Setiap foto di atas, setiap lagu yang kita dengarkan bersama, semuanya adalah 
              potongan-potongan kecil dari cerita kita yang indah. Dan aku tidak sabar untuk 
              menulis bab-bab berikutnya bersamamu. 💕
            </p>

            <div className={styles.signature}>
              <p className={styles.signatureText}>Forever yours,</p>
              <p className={styles.signatureName}>with all my love ∞</p>
            </div>
          </div>

          <div className={styles.letterDecor}>
            <span className={styles.decorHeart1}>💗</span>
            <span className={styles.decorHeart2}>💕</span>
            <span className={styles.decorStar}>✨</span>
          </div>
        </div>
      </div>
    </section>
  );
}
