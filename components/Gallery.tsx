'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Gallery.module.css';

interface Photo {
  src: string;
  filename: string;
  alt: string;
}

const PREVIEW_COUNT = 6;

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch photos from API
  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos || []);
      })
      .catch(() => {
        setPhotos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Only start observing AFTER photos have loaded
  useEffect(() => {
    if (loading || photos.length === 0) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.05 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, photos.length]);

  const previewPhotos = photos.slice(0, PREVIEW_COUNT);
  const remainingCount = Math.max(0, photos.length - PREVIEW_COUNT);

  if (loading) {
    return (
      <section id="gallery" className={styles.section}>
        <div className="section-container">
          <h2 className="section-title">Captured Moments</h2>
          <p className="section-subtitle">setiap foto punya cerita kita 📸</p>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Memuat foto...</p>
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section id="gallery" className={styles.section}>
        <div className="section-container">
          <h2 className="section-title">Captured Moments</h2>
          <p className="section-subtitle">setiap foto punya cerita kita 📸</p>
          <div className={styles.emptyState}>
            <p>✨ Belum ada foto — upload lewat halaman admin!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className={styles.section} ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title">Captured Moments</h2>
        <p className="section-subtitle">setiap foto punya cerita kita 📸</p>

        <div className={styles.previewGrid}>
          {previewPhotos.map((photo, idx) => (
            <div
              key={photo.filename}
              className={`${styles.previewItem} ${isVisible ? styles.visible : ''}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={400}
                  height={500}
                  quality={80}
                  loading="lazy"
                  className={styles.previewImage}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.viewAllWrapper} ${isVisible ? styles.visible : ''}`} style={{ animationDelay: '0.6s' }}>
          <Link href="/gallery" className={styles.viewAllBtn}>
            <span>Lihat Semua Foto</span>
            {remainingCount > 0 && (
              <span className={styles.badge}>+{remainingCount} lainnya</span>
            )}
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
