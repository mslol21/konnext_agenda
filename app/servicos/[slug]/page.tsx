import React from 'react';
import { initialServices, initialSalon } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Clock, Calendar, ArrowLeft, CheckCircle2, Star, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = initialServices.find((s) => s.slug === slug);
  if (!service) return { title: 'Serviço não encontrado' };

  return {
    title: `${service.name} - ${initialSalon.name}`,
    description: service.description,
    openGraph: {
      title: `${service.name} em São Paulo - ${initialSalon.name}`,
      description: service.description,
      images: [{ url: service.image_url }],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.name,
      description: service.description,
      images: [service.image_url],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = initialServices.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'HairSalon',
      name: initialSalon.name,
      telephone: initialSalon.phone,
      address: initialSalon.address,
    },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'BRL',
    },
  };

  return (
    <main className="min-h-screen py-12">
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Link
          href="/#servicos"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Cardápio de Procedimentos
        </Link>

        {/* Hero Card */}
        <div className="konnexy-card rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 relative h-72 md:h-auto overflow-hidden">
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#080b14] via-transparent to-transparent opacity-80" />
          </div>

          <div className="md:col-span-6 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full inline-block">
                {service.category_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {service.name}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Duração: {service.duration_minutes} min
                </span>
                <span className="text-2xl font-extrabold text-cyan-400">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <Link
                href="/"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
              >
                <Calendar className="w-4 h-4" /> Agendar Horário Online
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits & Included */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#080b17] border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Produtos de Alta Linha</h3>
            <p className="text-xs text-slate-400">Linha Kérastase, L'Oréal e Olaplex aplicada no procedimento.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080b17] border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-sm text-white">Profissionais Certificados</h3>
            <p className="text-xs text-slate-400">Atendimento personalizado com visagistas experientes.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080b17] border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Horário 100% Garantido</h3>
            <p className="text-xs text-slate-400">Reserva de vaga em tempo real sem atrasos ou filas.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
