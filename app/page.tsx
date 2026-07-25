import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { TeamSection } from '@/components/landing/TeamSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { MapContactSection } from '@/components/landing/MapContactSection';
import { FAQSection } from '@/components/landing/FAQSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Quem Somos */}
      <AboutSection />

      {/* 3. Serviços */}
      <ServicesSection />

      {/* 4. Equipe de Profissionais */}
      <TeamSection />

      {/* 5. Depoimentos */}
      <TestimonialsSection />

      {/* 6. Galeria */}
      <GallerySection />

      {/* 7. Contato e Mapa */}
      <MapContactSection />

      {/* 8. FAQ Accordion */}
      <FAQSection />
    </main>
  );
}
