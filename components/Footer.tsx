'use client';

import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.heartLine}>
        <span>💗</span>
        <div className={styles.line}></div>
        <span>💗</span>
      </div>
      
      <p className={styles.message}>Forever & Always</p>
      <p className={styles.sub}>made with ❤️ just for you</p>
      
      <div className={styles.infinity}>∞</div>
    </footer>
  );
}
