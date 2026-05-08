'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './birthday.module.css';

/* Each photo paired with a romantic caption */
const memories = [
  { src: '/pict/IMG_1452.jpg', caption: 'Senyummu yang selalu bikin aku jatuh hati 💫' },
  { src: '/pict/IMG_2462.jpg', caption: 'Momen yang nggak akan pernah aku lupakan 🤍' },
  { src: '/pict/IMG_2615.jpg', caption: 'Setiap detik bersamamu sangat berharga' },
  { src: '/pict/IMG_2618.jpg', caption: 'Di sampingmu, aku merasa lengkap ✨' },
  { src: '/pict/IMG_2737.jpg', caption: 'Cinta kita lebih indah dari apapun 💕' },
  { src: '/pict/IMG_2749.jpg', caption: 'Kamu selalu jadi alasan aku tersenyum' },
  { src: '/pict/IMG_2751.jpg', caption: 'Bersamamu adalah kebahagiaan terbesar 🌙' },
  { src: '/pict/IMG_2758.jpg', caption: 'Setiap tatapanmu menghangatkan hatiku' },
  { src: '/pict/IMG_3060.jpg', caption: 'Kita, sampai selamanya... ∞' },
];

const loveMessages = [
  { text: "Di hari yang paling spesial ini...", style: "soft" },
  { text: "Aku ingin kamu tahu betapa berartinya kamu bagiku 🤍", style: "soft" },
  { text: "Kamu bukan hanya kekasihku — kamu adalah rumahku, tempatku pulang", style: "warm" },
  { text: "Setiap hari bersamamu terasa seperti hadiah yang tak ternilai", style: "soft" },
  { text: "Tapi hari ini... kamu yang paling bersinar ✨", style: "glow" },
  { text: "Aku berdoa, semoga Tuhan selalu menjagamu dan mengabulkan semua mimpimu 🤲", style: "soft" },
  { text: "Semoga kebahagiaan selalu memelukmu erat seperti aku memelukmu 💫", style: "warm" },
  { text: "Dan aku berjanji... di setiap langkahmu, aku akan selalu ada 🤍", style: "promise" },
];

interface Sparkle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; hue: number;
  rotation: number; rotSpeed: number;
  type: 'circle' | 'star' | 'petal' | 'heart';
}

interface Star {
  x: number; y: number; size: number;
  twinkleSpeed: number; twinkleOffset: number; brightness: number;
}

interface ConfettiPiece {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; rotation: number;
  rotSpeed: number; opacity: number; life: number;
}

export default function BirthdayPage() {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [showMemories, setShowMemories] = useState(false);
  const [showRevealBtn, setShowRevealBtn] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [photoAutoplay, setPhotoAutoplay] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const sparklesRef = useRef<Sparkle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const confettiRef = useRef<ConfettiPiece[]>([]);

  const fullTitle = "Selamat Ulang Tahun, Sayangku!";

  const createSparkle = useCallback((scattered = true): Sparkle => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080;
    let x: number, y: number;
    if (scattered) {
      x = Math.random() * w; y = Math.random() * h;
    } else {
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { x = Math.random() * w; y = -40; }
      else if (side === 1) { x = w + 40; y = Math.random() * h; }
      else if (side === 2) { x = Math.random() * w; y = h + 40; }
      else { x = -40; y = Math.random() * h; }
    }
    const types: Array<'circle' | 'star' | 'petal' | 'heart'> = ['circle', 'circle', 'star', 'petal', 'heart', 'heart'];
    return {
      x, y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2 - 0.3,
      size: Math.random() * 20 + 6,
      opacity: Math.random() * 0.4 + 0.15,
      hue: [43, 340, 350, 320, 30, 0, 355][Math.floor(Math.random() * 7)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      type: types[Math.floor(Math.random() * types.length)],
    };
  }, []);

  // Canvas: stars + sparkles + hearts + confetti
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars: Star[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.3, twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinkleOffset: Math.random() * Math.PI * 2, brightness: Math.random() * 0.5 + 0.2,
      });
    }
    starsRef.current = stars;

    // Sparkles
    const sparkles: Sparkle[] = [];
    for (let i = 0; i < 55; i++) sparkles.push(createSparkle(true));
    sparklesRef.current = sparkles;

    const drawHeart = (cx: number, cy: number, sz: number, color: string, rot: number, op: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.globalAlpha = op;
      const s = sz / 28;
      ctx.beginPath();
      ctx.moveTo(0, -s * 6);
      ctx.bezierCurveTo(s * 14, -s * 24, s * 28, -s * 4, 0, s * 14);
      ctx.bezierCurveTo(-s * 28, -s * 4, -s * 14, -s * 24, 0, -s * 6);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    };

    const drawSparkle = (p: Sparkle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.type === 'heart') {
        ctx.restore();
        const hsl = p.hue > 100 ? `hsla(${p.hue}, 70%, 65%, ${p.opacity})` : `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        drawHeart(p.x, p.y, p.size, hsl, p.rotation, p.opacity);
        return;
      }
      if (p.type === 'circle') {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 78%, 0.8)`);
        grad.addColorStop(0.5, `hsla(${p.hue}, 80%, 60%, 0.25)`);
        grad.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillStyle = `hsla(${p.hue}, 100%, 82%, 0.7)`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 72%, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * p.size, Math.sin(a) * p.size);
          const a2 = a + (2 * Math.PI) / 10;
          ctx.lineTo(Math.cos(a2) * p.size * 0.4, Math.sin(a2) * p.size * 0.4);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = `hsla(${p.hue}, 55%, 78%, 0.45)`;
        ctx.shadowColor = `hsla(${p.hue}, 55%, 72%, 0.25)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      for (const s of starsRef.current) {
        const twinkle = s.brightness + Math.sin(now * s.twinkleSpeed + s.twinkleOffset) * 0.3;
        ctx.save();
        ctx.globalAlpha = Math.max(0.05, twinkle);
        ctx.fillStyle = '#fffbe6';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = s.size * 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = 0; i < sparklesRef.current.length; i++) {
        const p = sparklesRef.current[i];
        p.vx += (Math.random() - 0.5) * 0.06;
        p.vy += (Math.random() - 0.5) * 0.06;
        p.vx *= 0.995; p.vy *= 0.995;
        const spd = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        if (spd > 1.2) { p.vx = (p.vx / spd) * 1.2; p.vy = (p.vy / spd) * 1.2; }
        p.x += p.vx + Math.cos(now * 0.0006 + i) * 0.15;
        p.y += p.vy + Math.sin(now * 0.0008 + i * 0.5) * 0.2;
        p.rotation += p.rotSpeed;
        const m = 60;
        if (p.x < -m) p.x = canvas.width + m;
        if (p.x > canvas.width + m) p.x = -m;
        if (p.y < -m) p.y = canvas.height + m;
        if (p.y > canvas.height + m) p.y = -m;
        p.opacity = (p.opacity * 0.97) + (Math.random() * 0.4 + 0.15) * 0.03;
        drawSparkle(p);
      }

      const conf = confettiRef.current;
      for (let i = conf.length - 1; i >= 0; i--) {
        const c = conf[i];
        c.vy += 0.12; c.vx *= 0.99;
        c.x += c.vx; c.y += c.vy;
        c.rotation += c.rotSpeed; c.life--;
        c.opacity = Math.max(0, c.life / 120);
        if (c.life <= 0 || c.y > canvas.height + 50) { conf.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color; ctx.shadowBlur = 6;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    const addInt = setInterval(() => {
      if (sparklesRef.current.length < 70) sparklesRef.current.push(createSparkle(false));
    }, 1000);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
      clearInterval(addInt);
    };
  }, [createSparkle]);

  // Confetti burst
  const spawnConfetti = () => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const colors = ['#ffd700', '#ff6b8a', '#f4c542', '#e8a0bf', '#fdf6e3', '#ff4d6d', '#ce93d8', '#ffca28'];
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      pieces.push({
        x: cx + (Math.random() - 0.5) * 40, y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 6,
        size: Math.random() * 10 + 5, color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 15,
        opacity: 1, life: Math.floor(Math.random() * 60 + 100),
      });
    }
    confettiRef.current = pieces;
  };

  // Typewriter
  useEffect(() => {
    if (!started || stage < 1) return;
    let idx = 0;
    setTypedTitle('');
    const interval = setInterval(() => {
      idx++;
      setTypedTitle(fullTitle.slice(0, idx));
      if (idx >= fullTitle.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [started, stage >= 1]);

  // Photo carousel auto-advance
  useEffect(() => {
    if (!showMemories || !photoAutoplay) return;
    const interval = setInterval(() => {
      setActivePhoto(prev => (prev + 1) % memories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showMemories, photoAutoplay]);

  const startExperience = () => {
    if (started) return;
    setStarted(true);
    const audio = audioRef.current;
    if (audio) { audio.volume = 0.65; audio.play().catch(() => {}); }
    spawnConfetti();
    setStage(1);

    let cur = 1;
    const interval = setInterval(() => {
      cur++;
      if (cur <= loveMessages.length + 1) setStage(cur);
      // After all messages done → show reveal button
      if (cur === loveMessages.length + 2) {
        clearInterval(interval);
        setTimeout(() => setShowRevealBtn(true), 1200);
      }
    }, 3800);
  };

  const goToPhoto = (idx: number) => {
    setPhotoAutoplay(false);
    setActivePhoto(idx);
    setTimeout(() => setPhotoAutoplay(true), 8000);
  };

  return (
    <div className={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />

      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.ambientOrbs}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={`${styles.orb} ${styles.orb4}`} />
      </div>

      <audio ref={audioRef} loop preload="auto">
        <source src="https://cdn.pixabay.com/audio/2025/11/04/audio_4d1bf9ad93.mp3" type="audio/mpeg" />
      </audio>

      {/* ===== START SCREEN ===== */}
      {!started && (
        <div className={styles.startScreen} onClick={startExperience}>
          <div className={styles.startContent}>
            <div className={styles.candleGroup}>
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`${styles.candle} ${i === 2 ? styles.candleTall : ''}`}>
                  <div className={styles.flame}><div className={styles.flameInner} /></div>
                  <div className={styles.candleBody} />
                </div>
              ))}
            </div>
            <h2 className={styles.startTitle}>Ada Sesuatu Untukmu...</h2>
            <p className={styles.startHint}>sentuh untuk membuka 🌟</p>
            <div className={styles.startRing}><div className={styles.ringInner} /></div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      {started && (
        <div className={styles.mainContent}>
          {/* Typewriter Title */}
          <div className={`${styles.titleSection} ${stage >= 1 ? styles.show : ''}`}>
            <div className={styles.titleDecor}>🎂</div>
            <h1 className={styles.mainTitle}>
              {typedTitle}<span className={styles.cursor}>|</span>
            </h1>
            <div className={styles.titleLine} />
          </div>

          {/* Love Messages — one at a time */}
          <div className={styles.messages}>
            {loveMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.msgCard} ${styles[`msg_${msg.style}`]} ${stage === idx + 2 ? styles.msgActive : ''}`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* ===== REVEAL BUTTON ===== */}
          {showRevealBtn && !showMemories && (
            <div className={styles.revealSection}>
              <p className={styles.revealText}>Aku punya sesuatu yang spesial untukmu... 🌙</p>
              <button
                className={styles.revealBtn}
                onClick={() => {
                  setShowRevealBtn(false);
                  setShowMemories(true);
                  setTimeout(() => setShowFinale(true), 10000);
                }}
              >
                <i className="ri-image-line" />
                <span>Buka Kenangan Kita</span>
                <i className="ri-heart-3-fill" />
              </button>
            </div>
          )}

          {/* ===== ROMANTIC PHOTO CAROUSEL ===== */}
          {showMemories && (
            <div className={styles.memoriesSection}>
              <h2 className={styles.memoriesTitle}>Cerita Kita Berdua</h2>
              <p className={styles.memoriesSubtitle}>setiap foto punya sejuta kenangan 🌙</p>

              <div className={styles.carousel}>
                {/* Photo Frame */}
                <div className={styles.carouselFrame}>
                  <div className={styles.frameGlow} />
                  {memories.map((mem, idx) => (
                    <div
                      key={idx}
                      className={`${styles.carouselSlide} ${idx === activePhoto ? styles.slideActive : ''}`}
                    >
                      <Image
                        src={mem.src}
                        alt={mem.caption}
                        width={600}
                        height={750}
                        quality={85}
                        priority={idx < 2}
                        loading={idx < 2 ? undefined : 'lazy'}
                        className={styles.carouselImg}
                      />
                    </div>
                  ))}
                  {/* Caption Overlay */}
                  <div className={styles.captionOverlay}>
                    <p key={activePhoto} className={styles.captionText}>
                      {memories[activePhoto].caption}
                    </p>
                  </div>
                  {/* Nav Arrows */}
                  <button className={`${styles.navArrow} ${styles.navLeft}`} onClick={() => goToPhoto((activePhoto - 1 + memories.length) % memories.length)}>
                    <i className="ri-arrow-left-s-line" />
                  </button>
                  <button className={`${styles.navArrow} ${styles.navRight}`} onClick={() => goToPhoto((activePhoto + 1) % memories.length)}>
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </div>

                {/* Dots */}
                <div className={styles.dots}>
                  {memories.map((_, idx) => (
                    <button
                      key={idx}
                      className={`${styles.dot} ${idx === activePhoto ? styles.dotActive : ''}`}
                      onClick={() => goToPhoto(idx)}
                    />
                  ))}
                </div>


              </div>
            </div>
          )}

          {/* ===== FINALE ===== */}
          {showFinale && (
            <div className={styles.finale}>
              <div className={styles.finaleGlow} />
              <div className={styles.loveQuote}>
                <span className={styles.quoteOpen}>"</span>
                <p>Kamu bukan hanya orang yang aku cintai,<br/>kamu adalah alasan aku percaya pada cinta itu sendiri</p>
                <span className={styles.quoteClose}>"</span>
              </div>
              <div className={styles.finaleHearts}>
                <span>❤️</span>
                <span className={styles.infinitySym}>∞</span>
                <span>❤️</span>
              </div>
              <p className={styles.finaleText}>
                Aku sayang kamu, sekarang dan selamanya
              </p>
              <p className={styles.finaleScript}>
                — with all my love, forever yours 💕
              </p>
              <a href="/" className={styles.backLink}>
                <i className="ri-arrow-left-line" />
                <span>Kembali ke Beranda</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
