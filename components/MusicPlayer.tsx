'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './MusicPlayer.module.css';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log('Autoplay prevented:', err);
      });
    }
  };

  // Auto-play on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      const audio = audioRef.current;
      if (audio && !isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => { /* silent fail */ });
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [isPlaying]);

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source
          src="https://cdn.pixabay.com/audio/2025/11/04/audio_4d1bf9ad93.mp3"
          type="audio/mpeg"
        />
      </audio>

      <button
        className={`${styles.musicBtn} ${isPlaying ? styles.playing : ''}`}
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <div className={styles.iconWrapper}>
          <i className={`ri-${isPlaying ? 'pause' : 'music-2'}-line`}></i>
        </div>
        <span className={styles.label}>
          {isPlaying ? 'Pause' : 'Play'}
        </span>
        
        {isPlaying && (
          <div className={styles.visualizer}>
            <span></span><span></span><span></span>
          </div>
        )}
      </button>
    </>
  );
}
