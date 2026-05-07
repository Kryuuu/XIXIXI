'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import styles from './ParticleScene.module.css';

const PARTICLE_COUNT = 6000;
const PARTICLE_SIZE = 3;
const TRANSITION_SPEED = 0.04;

function generateShapes() {
  const shapes: Record<string, number[]> = {
    sphere: [],
    heart: [],
    flower: [],
    infinity: [],
  };

  const radius = 220;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
    const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
    shapes.sphere.push(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    );
  }

  const heartScale = 14;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = (Math.random() - 0.5) * 10;
    shapes.heart.push(
      x * heartScale + (Math.random() - 0.5) * 12,
      y * heartScale + (Math.random() - 0.5) * 12,
      z * heartScale + (Math.random() - 0.5) * 12
    );
  }

  const flowerScale = 160;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const k = 5;
    const r = Math.cos(k * theta) * Math.sin(phi) * flowerScale + Math.random() * 40;
    shapes.flower.push(
      r * Math.cos(theta),
      r * Math.sin(theta),
      r * Math.cos(phi) * 0.5
    );
  }

  // Infinity symbol (lemniscate)
  const infScale = 180;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.abs(Math.cos(2 * t)));
    const noise = (Math.random() - 0.5) * 30;
    shapes.infinity.push(
      r * Math.cos(t) * infScale + noise,
      r * Math.sin(t) * infScale * 0.5 + noise,
      (Math.random() - 0.5) * 60
    );
  }

  return shapes;
}

export default function ParticleScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentShapeRef = useRef('heart');
  const transformRef = useRef<number[]>([]);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  const initScene = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const shapes = generateShapes();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 550;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Start with heart shape (more romantic!)
    transformRef.current = shapes.heart;
    const currentPositions = new Float32Array(shapes.heart);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

    const material = new THREE.PointsMaterial({
      size: PARTICLE_SIZE,
      color: 0xec407a,
      map: sprite,
      alphaTest: 0.5,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.85,
    });
    materialRef.current = material;

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    const halfX = window.innerWidth / 2;
    const halfY = window.innerHeight / 2;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX - halfX;
      mouseY = e.clientY - halfY;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onResize);

    // Shape switching via custom event
    const handleShapeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (shapes[detail]) {
        transformRef.current = shapes[detail];
        currentShapeRef.current = detail;
      }
    };

    const handleColorChange = (e: Event) => {
      const color = (e as CustomEvent).detail;
      if (material) material.color.set(color);
    };

    window.addEventListener('changeShape', handleShapeChange);
    window.addEventListener('changeColor', handleColorChange);

    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const breathing = 0.85 + Math.sin(time * 0.8) * 0.15;
      particles.scale.setScalar(breathing);

      particles.rotation.y += 0.0015;
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      const posAttr = geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      let needsUpdate = false;

      for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const target = transformRef.current[i];
        const diff = target - arr[i];
        if (Math.abs(diff) > 0.01) {
          arr[i] += diff * TRANSITION_SPEED;
          needsUpdate = true;
        }
      }

      if (needsUpdate) posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('changeShape', handleShapeChange);
      window.removeEventListener('changeColor', handleColorChange);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return () => cleanup?.();
  }, [initScene]);

  return <div ref={containerRef} className={styles.container} />;
}
