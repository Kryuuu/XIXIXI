'use client';

import { useState } from 'react';
import styles from './ParticleControls.module.css';

const shapes = [
  { id: 'heart', label: 'Heart', icon: '❤️' },
  { id: 'sphere', label: 'Cloud', icon: '☁️' },
  { id: 'flower', label: 'Flower', icon: '🌸' },
  { id: 'infinity', label: 'Infinity', icon: '♾️' },
];

export default function ParticleControls() {
  const [activeShape, setActiveShape] = useState('heart');
  const [isMinimized, setIsMinimized] = useState(true);
  const [color, setColor] = useState('#ec407a');

  const changeShape = (shapeId: string) => {
    setActiveShape(shapeId);
    window.dispatchEvent(new CustomEvent('changeShape', { detail: shapeId }));
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    window.dispatchEvent(new CustomEvent('changeColor', { detail: newColor }));
  };

  return (
    <div className={`${styles.panel} ${isMinimized ? styles.minimized : ''}`}>
      <button
        className={styles.toggleBtn}
        onClick={() => setIsMinimized(!isMinimized)}
        title={isMinimized ? 'Show Controls' : 'Hide Controls'}
      >
        <i className={`ri-arrow-${isMinimized ? 'right' : 'left'}-s-line`}></i>
      </button>

      <div className={styles.content}>
        {shapes.map((shape) => (
          <button
            key={shape.id}
            className={`${styles.shapeBtn} ${activeShape === shape.id ? styles.active : ''}`}
            onClick={() => changeShape(shape.id)}
          >
            <span className={styles.shapeIcon}>{shape.icon}</span>
            <span className={styles.shapeLabel}>{shape.label}</span>
          </button>
        ))}

        <div className={styles.divider}></div>

        <input
          type="color"
          value={color}
          onChange={(e) => changeColor(e.target.value)}
          className={styles.colorPicker}
          title="Change particle color"
        />
      </div>
    </div>
  );
}
