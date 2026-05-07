'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Soundtrack.module.css';

const tracks = [
  {
    id: '3xpMytpniCnjXCgy7TcFDw',
    title: 'Bawalah Cintaku',
    artist: 'Afgan',
    emoji: '💗',
  },
  {
    id: '4rcuS31IcZynp91dqvmhmA',
    title: 'Semua Aku Dirayakan',
    artist: 'Nadin Amizah',
    emoji: '🌸',
  },
  {
    id: '6VjeuA1GAK1jxk8Ic2N3tq',
    title: 'Jatuh Hati',
    artist: 'Raisa',
    emoji: '💕',
  },
];

export default function Soundtrack() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="soundtrack" className={styles.section} ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title">Our Soundtrack</h2>
        <p className="section-subtitle">lagu-lagu yang mengingatkanku padamu 🎵</p>

        <div className={styles.tracksGrid}>
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`${styles.trackCard} ${isVisible ? styles.visible : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.trackHeader}>
                <span className={styles.trackEmoji}>{track.emoji}</span>
                <div className={styles.trackInfo}>
                  <span className={styles.trackTitle}>{track.title}</span>
                  <span className={styles.trackArtist}>{track.artist}</span>
                </div>
                <div className={styles.soundBars}>
                  <span></span><span></span><span></span><span></span>
                </div>
              </div>
              <div className={styles.iframeWrapper}>
                <iframe
                  style={{ borderRadius: '12px' }}
                  src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
