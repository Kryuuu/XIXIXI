'use client';

import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className={styles.logoHeart}>❤</span>
        <span className={styles.logoText}>Kimilatte</span>
      </div>

      <div className={styles.navLinks}>
        <button className={styles.navLink} onClick={() => scrollToSection('soundtrack')}>
          <i className="ri-music-2-line"></i>
          <span>Songs</span>
        </button>
        <button className={styles.navLink} onClick={() => scrollToSection('gallery')}>
          <i className="ri-camera-line"></i>
          <span>Gallery</span>
        </button>
        <button className={styles.navLink} onClick={() => scrollToSection('love-letter')}>
          <i className="ri-heart-3-line"></i>
          <span>Letter</span>
        </button>
      </div>
    </nav>
  );
}
