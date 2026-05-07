import Hero from '@/components/Hero';
import Soundtrack from '@/components/Soundtrack';
import Gallery from '@/components/Gallery';
import LoveLetter from '@/components/LoveLetter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main style={{ position: 'relative', zIndex: 2 }}>
      <Hero />
      <Soundtrack />
      <Gallery />
      <LoveLetter />
      <Footer />
    </main>
  );
}
