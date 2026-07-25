'use client';

import React, { useState } from 'react';
import { initialGallery } from '@/lib/mock-data';
import { Sparkles, ZoomIn } from 'lucide-react';

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="galeria" className="py-24 bg-white dark:bg-slate-900 border-t border-rose-100/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5E83]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#8B5E83]" /> Galeria de Trabalhos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nossos Resultados Realizados
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Conheça alguns dos cortes, luzes e penteados produzidos por nossa equipe de profissionais.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item.image_url)}
              className="relative h-72 rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#C08497]">
                  {item.category}
                </span>
                <h4 className="font-bold text-base">{item.title}</h4>
                <p className="text-xs text-slate-300">{item.description}</p>
                <div className="pt-2 flex items-center gap-1 text-xs text-rose-300 font-semibold">
                  <ZoomIn className="w-4 h-4" /> Ampliar foto
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
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={selectedImage}
            alt="Ampliada"
            className="max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border-2 border-white/20 object-contain"
          />
        </div>
      )}
    </section>
  );
}
