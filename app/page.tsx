import Hero from '@/components/Hero';
import SurpriseButton from '@/components/SurpriseButton';
import Soundtrack from '@/components/Soundtrack';
import Gallery from '@/components/Gallery';
import LoveLetter from '@/components/LoveLetter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main style={{ position: 'relative', zIndex: 2 }}>
      <Hero />
      <SurpriseButton />
      <Soundtrack />
      <Gallery />
      <LoveLetter />
      <Footer />
    </main>
  );
}
