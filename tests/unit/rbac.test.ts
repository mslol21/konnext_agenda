import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  generateClientMagicLinkToken,
  verifyClientMagicLinkToken,
  hasRolePermission,
} from '@/lib/auth';

describe('Auth & RBAC Security Tests', () => {
  it('deve realizar hash e verificação segura de senhas com bcrypt', async () => {
    const rawPassword = 'SenhaForteKonnexy#2026';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const isValid = await verifyPassword(rawPassword, hash);
    const isInvalid = await verifyPassword('SenhaIncorreta', hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('deve emitir e validar JWT de sessão com tenant e role corretos', () => {
    const session = {
      userId: 'usr-123',
      email: 'gestor@salao.com.br',
      tenantId: 'tenant-abc',
      role: 'owner' as const,
      name: 'Gestor Dono',
    };

    const token = signSessionToken(session);
    expect(token).toBeTypeOf('string');

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('usr-123');
    expect(decoded?.tenantId).toBe('tenant-abc');
    expect(decoded?.role).toBe('owner');
  });

  it('deve gerar Magic Link de acesso para cliente sem senha com expiração', () => {
    const email = 'cliente.vip@gmail.com';
    const tenantId = 'tenant-xyz';

    const magicToken = generateClientMagicLinkToken(email, tenantId);
    expect(magicToken).toBeTypeOf('string');

    const verified = verifyClientMagicLinkToken(magicToken);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe(email);
    expect(verified?.tenantId).toBe(tenantId);
    expect(verified?.type).toBe('magic_link_client');
  });

  it('deve validar permissões de acordo com a hierarquia RBAC', () => {
    // Owner pode acessar tudo
    expect(hasRolePermission('owner', 'admin')).toBe(true);
    expect(hasRolePermission('owner', 'receptionist')).toBe(true);
    expect(hasRolePermission('owner', 'professional')).toBe(true);
    expect(hasRolePermission('owner', 'client')).toBe(true);

    // Admin pode acessar recepção e profissional, mas não owner
    expect(hasRolePermission('admin', 'owner')).toBe(false);
    expect(hasRolePermission('admin', 'receptionist')).toBe(true);

    // Recepção não pode acessar funções de admin
    expect(hasRolePermission('receptionist', 'admin')).toBe(false);

    // Profissional não pode acessar recepção nem admin
    expect(hasRolePermission('professional', 'receptionist')).toBe(false);
    expect(hasRolePermission('professional', 'admin')).toBe(false);

    // Cliente só acessa nível cliente
    expect(hasRolePermission('client', 'professional')).toBe(false);
    expect(hasRolePermission('client', 'client')).toBe(true);
  });
});
