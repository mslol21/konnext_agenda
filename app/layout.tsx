import type { Metadata } from 'next';
import './globals.css';
import { ApplicationFrame } from '@/components/ApplicationFrame';
import { AppProvider } from '@/contexts/AppContext';
import { BookingWizardModal } from '@/components/BookingWizardModal';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Konnexy Agenda - Agendamento Inteligente & Gestão de Alta Performance',
  description: 'Sistema completo de agendamento online e gestão operacional do ecossistema Konnexy. Agendamento sem atrito no WhatsApp e automação via IA.',
  keywords: ['agendamento online', 'Konnexy Agenda', 'ecossistema Konnexy', 'gestão de salão', 'estética', 'FullCalendar', 'WhatsApp Cloud API'],
  authors: [{ name: 'Konnexy Ecosystem' }],
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Konnexy Agenda - Agendamento Inteligente',
    description: 'Agende seu horário online em menos de 1 minuto sem precisar de troca de mensagens manuais no WhatsApp.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Konnexy Agenda',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#03050d] text-slate-100 antialiased selection:bg-cyan-400 selection:text-slate-950 konnexy-bg-ambient">
        <AppProvider>
          <ApplicationFrame>{children}</ApplicationFrame>

          {/* Online Booking Wizard Modal */}
          <BookingWizardModal />

          {/* Hot Toast Alerts */}
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 4000,
              style: {
                background: '#0d1122',
                color: '#f8fafc',
                border: '1px solid rgba(34, 211, 238, 0.25)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                borderRadius: '1rem',
                fontSize: '0.875rem'
              }
            }} 
          />
        </AppProvider>
      </body>
    </html>
  );
}
