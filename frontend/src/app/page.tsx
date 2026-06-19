import CtaSection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1600px] overflow-hidden px-6">
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>

      <Footer />
    </>
  );
}