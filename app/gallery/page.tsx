'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './gallery.module.css';

interface Photo {
  src: string;
  filename: string;
  alt: string;
  size: number;
  modified: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos || []);
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, []);

  // Trigger reveal animation after photos load
  useEffect(() => {
    if (!loading && photos.length > 0) {
      const timer = setTimeout(() => setRevealed(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight' && lightbox !== null) {
        setLightbox((prev) => (prev !== null ? (prev + 1) % photos.length : null));
      }
      if (e.key === 'ArrowLeft' && lightbox !== null) {
        setLightbox((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, photos.length]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightbox !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const navigateLightbox = useCallback((direction: number) => {
    setLightbox((prev) => {
      if (prev === null) return null;
      return (prev + direction + photos.length) % photos.length;
    });
  }, [photos.length]);

  // Masonry: distribute into 3 columns (2 on mobile via CSS)
  const columnCount = 3;
  const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
  photos.forEach((photo, idx) => {
    columns[idx % columnCount].push(photo);
  });

  const getGlobalIndex = (colIdx: number, photoIdx: number): number => {
    return photoIdx * columnCount + colIdx;
  };

  return (
    <div className={styles.page}>
      {/* Back navigation */}
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>
          <i className="ri-arrow-left-line"></i>
          <span>Kembali</span>
        </Link>

        <div className={styles.headerCenter}>
          <h1 className={styles.pageTitle}>Our Gallery</h1>
          <p className={styles.pageSubtitle}>semua momen indah kita ✨</p>
        </div>

        <div className={styles.photoCounter}>
          <i className="ri-image-line"></i>
          <span>{photos.length} foto</span>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Memuat semua foto...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="ri-camera-off-line"></i>
          <p>Belum ada foto.</p>
          <Link href="/" className={styles.emptyLink}>← Kembali ke beranda</Link>
        </div>
      ) : (
        <div className={styles.masonryGrid}>
          {columns.map((column, colIdx) => (
            <div key={colIdx} className={styles.masonryColumn}>
              {column.map((photo, photoIdx) => {
                const globalIdx = getGlobalIndex(colIdx, photoIdx);
                return (
                  <div
                    key={photo.filename}
                    className={`${styles.galleryItem} ${revealed ? styles.visible : ''}`}
                    style={{ animationDelay: `${globalIdx * 0.05}s` }}
                    onClick={() => setLightbox(globalIdx)}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={500}
                      height={600}
                      quality={80}
                      loading="lazy"
                      className={styles.galleryImage}
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <div className={styles.itemOverlay}>
                      <i className="ri-zoom-in-line"></i>
                    </div>
                    <div className={styles.itemCaption}>
                      <span>{photo.alt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && lightbox < photos.length && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lbClose} onClick={() => setLightbox(null)} aria-label="Close">
            <i className="ri-close-line"></i>
          </button>

          <button
            className={`${styles.lbNav} ${styles.lbPrev}`}
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            aria-label="Previous"
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>

          <div className={styles.lbContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              width={1000}
              height={1400}
              quality={90}
              className={styles.lbImage}
              priority
            />
            <div className={styles.lbInfo}>
              <p className={styles.lbCaption}>{photos[lightbox].alt}</p>
              <span className={styles.lbCounter}>{lightbox + 1} / {photos.length}</span>
            </div>
          </div>

          <button
            className={`${styles.lbNav} ${styles.lbNext}`}
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            aria-label="Next"
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}
