'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './admin.module.css';

interface Photo {
  src: string;
  filename: string;
  alt: string;
  size: number;
  modified: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {
      setMessage({ text: 'Gagal memuat foto', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load photos after auth
  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
  }, [isAuthenticated, fetchPhotos]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Test password by making a dummy request
    try {
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: {
          'x-admin-password': password,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: '__test_auth__' }),
      });

      // 401 = wrong password, 404 = password correct but file not found (expected)
      if (res.status === 401) {
        setAuthError('Password salah! 🔒');
        return;
      }

      setIsAuthenticated(true);
    } catch {
      setAuthError('Gagal terhubung ke server');
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Mengupload ${files.length} foto...`);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: `✅ ${data.uploaded?.length || 0} foto berhasil diupload!${
            data.errors?.length ? ` (${data.errors.length} gagal)` : ''
          }`,
          type: 'success',
        });
        fetchPhotos();
      } else {
        setMessage({ text: data.error || 'Upload gagal', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Upload gagal — periksa koneksi', type: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const deletePhoto = async (filename: string) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: {
          'x-admin-password': password,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (res.ok) {
        setMessage({ text: `🗑️ ${filename} dihapus`, type: 'success' });
        setPhotos((prev) => prev.filter((p) => p.filename !== filename));
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Gagal menghapus', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Gagal menghapus foto', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ==================== LOGIN SCREEN ====================
  if (!isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginEmoji}>🔐</div>
          <h1 className={styles.loginTitle}>Admin Gallery</h1>
          <p className={styles.loginSubtitle}>Masukkan password untuk mengelola foto</p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputWrapper}>
              <i className="ri-lock-line"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password..."
                className={styles.passwordInput}
                autoFocus
              />
            </div>
            {authError && <p className={styles.authError}>{authError}</p>}
            <button type="submit" className={styles.loginBtn}>
              <i className="ri-login-box-line"></i>
              Masuk
            </button>
          </form>

          <button className={styles.backLink} onClick={() => window.location.href = '/'}>
            <i className="ri-arrow-left-line"></i> Kembali ke beranda
          </button>
        </div>
      </div>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  return (
    <div className={styles.adminPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>
            <span className={styles.headerEmoji}>📸</span>
            Gallery Manager
          </h1>
          <span className={styles.photoCount}>{photos.length} foto</span>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.refreshBtn} onClick={fetchPhotos} disabled={loading}>
            <i className={`ri-refresh-line ${loading ? styles.spinning : ''}`}></i>
          </button>
          <button className={styles.homeBtn} onClick={() => window.location.href = '/'}>
            <i className="ri-home-heart-line"></i>
            <span>Beranda</span>
          </button>
        </div>
      </header>

      {/* Toast message */}
      {message && (
        <div className={`${styles.toast} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Upload zone */}
      <div
        className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${uploading ? styles.uploading : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className={styles.fileInput}
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        {uploading ? (
          <div className={styles.uploadingState}>
            <div className={styles.uploadSpinner}></div>
            <p>{uploadProgress}</p>
          </div>
        ) : isDragging ? (
          <div className={styles.dragState}>
            <i className="ri-download-cloud-2-line"></i>
            <p>Lepaskan foto di sini! 💕</p>
          </div>
        ) : (
          <div className={styles.idleState}>
            <i className="ri-image-add-line"></i>
            <p className={styles.uploadTitle}>Drag & drop foto di sini</p>
            <p className={styles.uploadSub}>atau klik untuk pilih file</p>
            <span className={styles.uploadHint}>JPG, PNG, WebP • Maks 15MB per foto</span>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.uploadSpinner}></div>
          <p>Memuat foto...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="ri-image-line"></i>
          <p>Belum ada foto. Upload foto pertama kalian! 💗</p>
        </div>
      ) : (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div key={photo.filename} className={styles.photoCard}>
              <div className={styles.photoPreview}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={300}
                  height={300}
                  quality={75}
                  className={styles.photoImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Delete overlay */}
                <div className={styles.photoOverlay}>
                  {deleteConfirm === photo.filename ? (
                    <div className={styles.confirmDelete}>
                      <p>Hapus foto ini?</p>
                      <div className={styles.confirmBtns}>
                        <button
                          className={styles.confirmYes}
                          onClick={(e) => { e.stopPropagation(); deletePhoto(photo.filename); }}
                        >
                          Ya, Hapus
                        </button>
                        <button
                          className={styles.confirmNo}
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(photo.filename); }}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.photoInfo}>
                <span className={styles.photoName} title={photo.filename}>
                  {photo.filename}
                </span>
                <span className={styles.photoSize}>{formatSize(photo.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
