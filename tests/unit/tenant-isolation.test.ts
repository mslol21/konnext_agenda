import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTenantDb, prisma } from '@/lib/db';

describe('Multi-Tenancy Security & Isolation Tests', () => {
  const tenantAId = 'tenant-uuid-aaaa-1111';
  const tenantBId = 'tenant-uuid-bbbb-2222';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exigir obrigatoriamente um tenantId válido na camada de banco', () => {
    expect(() => getTenantDb('')).toThrowError(/MultiTenantSecurityException/);
    expect(() => getTenantDb(null as any)).toThrowError(/MultiTenantSecurityException/);
  });

  it('deve injetar automaticamente o tenantId em consultas findMany de serviços', async () => {
    const mockFindMany = vi.spyOn(prisma.service, 'findMany').mockResolvedValue([] as any);

    const dbA = getTenantDb(tenantAId);
    await dbA.services.findMany({ where: { isActive: true } });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        tenantId: tenantAId, // Injeção obrigatória de isolamento
      },
    });
  });

  it('deve injetar automaticamente o tenantId na criação de novos recursos', async () => {
    const mockCreate = vi.spyOn(prisma.service, 'create').mockResolvedValue({ id: 'srv-1' } as any);

    const dbB = getTenantDb(tenantBId);
    await dbB.services.create({
      data: {
        name: 'Corte Masculino',
        slug: 'corte-masculino',
        price: 80,
      },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: 'Corte Masculino',
        slug: 'corte-masculino',
        price: 80,
        tenantId: tenantBId, // Garante que pertence exclusivamente ao tenant B
      },
    });
  });

  it('deve bloquear e lançar erro caso o Tenant A tente alterar um recurso do Tenant B', async () => {
    // Simula que o serviço "srv-999" existe, mas pertence ao Tenant B
    vi.spyOn(prisma.service, 'findFirst').mockResolvedValue(null);

    const dbA = getTenantDb(tenantAId);

    await expect(
      dbA.services.update({
        where: { id: 'srv-999' },
        data: { price: 10 },
      })
    ).rejects.toThrowError(/Acesso negado: registro não pertence a este tenant/);
  });

  it('deve bloquear a exclusão de recursos pertencentes a outro tenant', async () => {
    vi.spyOn(prisma.service, 'findFirst').mockResolvedValue(null); // Não encontrado no tenant A

    const dbA = getTenantDb(tenantAId);

    await expect(
      dbA.services.delete({
        where: { id: 'srv-do-tenant-b' },
      })
    ).rejects.toThrowError(/Acesso negado: registro não pertence a este tenant/);
  });
});
