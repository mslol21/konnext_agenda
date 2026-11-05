'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SiteAIChatWidget } from '@/components/SiteAIChatWidget';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export function ApplicationFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const workspace = ['/admin', '/recepcao', '/profissional', '/cliente'].some(route => pathname === route || pathname.startsWith(`${route}/`));
  if (workspace) return <WorkspaceShell>{children}</WorkspaceShell>;
  return <><Navbar /><div className="flex-1">{children}</div><SiteAIChatWidget /><Footer /></>;
}
