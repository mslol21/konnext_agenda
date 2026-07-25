import React from 'react';
import { initialServices, initialSalon } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Clock, Calendar, ArrowLeft, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Link
          href="/#servicos"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8B5E83] dark:text-rose-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Todos os Serviços
        </Link>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-rose-100 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 relative h-72 md:h-auto">
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-6 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#C08497] bg-rose-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                {service.category_name}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {service.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C08497]" />
                  Duração aproximada: {service.duration_minutes} min
                </span>
                <span className="text-2xl font-extrabold text-[#8B5E83] dark:text-rose-300">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <Link
                href="/#servicos"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 dark:shadow-none hover:opacity-95 transition-opacity"
              >
                <Calendar className="w-5 h-5" /> Agendar {service.name} Online
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits & Included */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Produtos de Alta Linha</h3>
            <p className="text-xs text-slate-500">Linha Kérastase, L'Oréal e Olaplex aplicada no atendimento.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Profissionais Certificados</h3>
            <p className="text-xs text-slate-500">Atendimento personalizado com visagistas experientes.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#8B5E83]" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Horário 100% Garantido</h3>
            <p className="text-xs text-slate-500">Reserva de vaga em tempo real sem fila de espera.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
