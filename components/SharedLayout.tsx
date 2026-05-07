'use client';

import dynamic from 'next/dynamic';

const ParticleScene = dynamic(() => import('@/components/ParticleScene'), { ssr: false });
const ParticleControls = dynamic(() => import('@/components/ParticleControls'), { ssr: false });
const FloatingHearts = dynamic(() => import('@/components/FloatingHearts'), { ssr: false });
import MusicPlayer from '@/components/MusicPlayer';
import Navbar from '@/components/Navbar';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Background layers — persist across all pages */}
      <ParticleScene />
      <FloatingHearts />

      {/* Navigation */}
      <Navbar />

      {/* Page content */}
      {children}

      {/* Fixed UI Controls */}
      <ParticleControls />
      <MusicPlayer />
    </>
  );
}
