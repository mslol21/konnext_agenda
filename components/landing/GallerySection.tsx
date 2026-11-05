'use client';

import React, { useState } from 'react';
import { initialGallery } from '@/lib/mock-data';
import { Sparkles, ZoomIn, X } from 'lucide-react';

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="galeria" className="py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portfólio & Resultados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Galeria de Demonstração
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Imagens ilustrativas para demonstrar a apresentação de procedimentos e resultados.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialGallery.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`Ampliar ${item.title}`}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedImage(item.image_url); } }}
              onClick={() => setSelectedImage(item.image_url)}
              className="relative h-72 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-lg hover:border-cyan-500/40 transition-all duration-300"
            >
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03050d] via-[#03050d]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">
                  {item.category}
                </span>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Ampliar fotografia</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-[#03050d]/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-cyan-400 flex items-center gap-1 text-xs font-semibold"
            >
              <X className="w-5 h-5" /> Fechar
            </button>
            <img
              src={selectedImage}
              alt="Ampliada"
              className="rounded-2xl shadow-2xl border border-cyan-500/30 object-contain max-h-[80vh] w-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
}
