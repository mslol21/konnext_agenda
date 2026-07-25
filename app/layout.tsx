import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BookingWizardModal } from '@/components/BookingWizardModal';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Konnexy Agenda - Agendamento Online 100% Automático',
  description: 'Agende seu horário online em menos de 1 minuto. Escolha o serviço, profissional e horário sem fila no WhatsApp.',
  keywords: ['agendamento online', 'salão de beleza', 'mechas', 'corte feminino', 'manicure', 'estética', 'Konnexy Agenda'],
  authors: [{ name: 'Konnexy Agenda' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Konnexy Agenda - Agendamento Online',
    description: 'Agende seu horário online em menos de 1 minuto sem precisar enviar mensagem no WhatsApp.',
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
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-[#C08497] selection:text-white">
        <AppProvider>
          {/* Top Demo Role Switcher */}
          <RoleSwitcher />
          
          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Page */}
          <div className="flex-1">{children}</div>

          {/* Online Booking Wizard Modal */}
          <BookingWizardModal />

          {/* Footer */}
          <Footer />

          {/* Hot Toast Alerts */}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </AppProvider>
      </body>
    </html>
  );
}
