'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  ArrowUpRight, Bot, Building2, CalendarDays, ChevronRight, CircleHelp,
  CreditCard, LayoutDashboard, Menu, Plus, Scissors,
  ShieldCheck, Sparkles, UserRound, Users, X,
} from 'lucide-react';

const managementLinks = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/calendario', label: 'Agenda', icon: CalendarDays },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/financeiro', label: 'Financeiro', icon: CreditCard },
  { href: '/admin/profissionais', label: 'Equipe', icon: UserRound },
  { href: '/admin/servicos', label: 'Serviços', icon: Scissors },
  { href: '/admin/whatsapp', label: 'WhatsApp e IA', icon: Bot },
];
const portalLinks = [
  { href: '/recepcao', label: 'Recepção', icon: Building2 },
  { href: '/profissional', label: 'Área do profissional', icon: Scissors },
  { href: '/cliente', label: 'Área do cliente', icon: UserRound },
];
const allLinks = [...managementLinks, ...portalLinks];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { salon, setBookingModalOpen } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const current = allLinks.find(link => link.href === pathname);
  const section = pathname.startsWith('/admin') ? 'Gestão' : 'Atendimento';
  const profile = pathname.startsWith('/admin') ? 'Administrador' : pathname === '/recepcao' ? 'Recepção' : pathname === '/profissional' ? 'Profissional' : 'Cliente';

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const handleResize = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener('change', handleResize);
    return () => media.removeEventListener('change', handleResize);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); }
      if (event.key !== 'Tab') return;
      const items = Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary') || [])
        .filter(element => element.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKey);
      if (previous?.isConnected) previous.focus();
    };
  }, [menuOpen]);

  const openBooking = () => { setMenuOpen(false); setBookingModalOpen(true); };
  const navLink = (link: typeof allLinks[number]) => {
    const Icon = link.icon;
    const active = pathname === link.href;
    return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined}
      onClick={() => setMenuOpen(false)} className={`workspace-link ${active ? 'workspace-link-active' : ''}`}>
      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
      <span>{link.label}</span>
      {active && <span className="workspace-active-dot" aria-hidden="true" />}
    </Link>;
  };

  return (
    <div className="workspace-shell">
      <a href="#workspace-content" className="workspace-skip">Ir para o conteúdo</a>
      {menuOpen && <button className="workspace-backdrop" aria-label="Fechar menu lateral" onClick={() => setMenuOpen(false)} />}
      <aside ref={sidebarRef} id="workspace-sidebar" className={`workspace-sidebar ${menuOpen ? 'is-open' : ''}`}
        aria-label="Menu do sistema" role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen ? true : undefined}>
        <div className="workspace-brand-row">
          <Link href="/admin" className="workspace-brand" onClick={() => setMenuOpen(false)} aria-label="Konnexy Agenda — visão geral">
            <span className="workspace-brand-icon"><Sparkles size={21} /></span>
            <span>Konnexy<span className="workspace-brand-accent"> Agenda</span><small>WORKSPACE</small></span>
          </Link>
          <button className="workspace-close" aria-label="Fechar navegação" onClick={() => setMenuOpen(false)}><X size={19} /></button>
        </div>
        <div className="workspace-business">
          <span className="workspace-business-icon"><Building2 size={18} /></span>
          <div><span className="workspace-business-name">{salon.name}</span><small>Espaço de trabalho</small></div>
        </div>
        <div className="workspace-sidebar-scroll">
          <nav aria-label="Gestão do negócio" className="workspace-nav-group">
            <p className="workspace-nav-label">Gestão do negócio</p>
            {managementLinks.map(navLink)}
          </nav>
          <nav aria-label="Áreas de atendimento" className="workspace-nav-group">
            <p className="workspace-nav-label">Áreas de atendimento</p>
            {portalLinks.map(navLink)}
          </nav>
        </div>
        <div className="workspace-sidebar-footer">
          <details className="workspace-demo-note">
            <summary><ShieldCheck size={15} /><span>Ambiente de demonstração</span><CircleHelp size={14} /></summary>
            <p>Dados locais neste navegador. A troca de área é demonstrativa e não representa login ou permissões de acesso.</p>
          </details>
          <Link href="/" className="workspace-public-link">Ver site público<ArrowUpRight size={16} /></Link>
        </div>
      </aside>

      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="workspace-topbar-start">
            <button className="workspace-menu-toggle" aria-label="Abrir navegação do sistema"
              aria-expanded={menuOpen} aria-controls="workspace-sidebar" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
            <div className="workspace-breadcrumb"><span>{section}</span><ChevronRight size={14} /><strong>{current?.label || 'Painel'}</strong></div>
          </div>
          <div className="workspace-topbar-actions">
            <span className="workspace-demo-badge">Demo</span>
            <button className="workspace-create-button" aria-label="Novo agendamento" onClick={openBooking}><Plus size={17} /><span>Novo agendamento</span></button>
            <div className="workspace-account" title={`${profile} — perfil demonstrativo`}><span>{profile.slice(0, 2).toUpperCase()}</span><div><strong>{profile}</strong><small>Perfil demonstrativo</small></div></div>
          </div>
        </header>
        <main id="workspace-content" tabIndex={-1} className="workspace-content">{children}</main>
        <footer className="workspace-footer"><span>Konnexy Agenda</span><span>Gestão e atendimento em um só lugar</span></footer>
      </div>

      <nav className="workspace-mobile-nav" aria-label="Atalhos do sistema">
        {managementLinks.slice(0, 3).map(link => {
          const Icon = link.icon;
          return <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}><Icon size={19} /><span>{link.label === 'Visão geral' ? 'Início' : link.label}</span></Link>;
        })}
        <button onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="workspace-sidebar"><Menu size={20} /><span>Mais</span></button>
      </nav>
    </div>
  );
}
