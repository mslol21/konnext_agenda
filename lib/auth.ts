import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET deve ter pelo menos 32 caracteres.');
  }
  return secret;
}

export interface UserSessionPayload {
  userId: string;
  email: string;
  tenantId?: string;
  role?: Role;
  name?: string;
}

export interface MagicLinkPayload {
  email: string;
  tenantId: string;
  type: 'magic_link_client';
}

/**
 * Hash de senha com bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Comparação segura de senha
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Assina um JWT de sessão de usuário
 */
export function signSessionToken(payload: UserSessionPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

/**
 * Valida e decodifica um JWT de sessão
 */
export function verifySessionToken(token: string): UserSessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || decoded.type || typeof decoded.userId !== 'string' || typeof decoded.email !== 'string') return null;
    return decoded as UserSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Gera um Magic Link token para cliente acessar sem senha (expira em 15 minutos)
 */
export function generateClientMagicLinkToken(email: string, tenantId: string): string {
  const payload: MagicLinkPayload = {
    email,
    tenantId,
    type: 'magic_link_client',
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
}

/**
 * Valida o Magic Link token do cliente
 */
export function verifyClientMagicLinkToken(token: string): MagicLinkPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as MagicLinkPayload;
    if (decoded.type !== 'magic_link_client') return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Hierarquia RBAC:
 * owner > admin > receptionist > professional > client
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 5,
  admin: 4,
  receptionist: 3,
  professional: 2,
  client: 1,
};

/**
 * Valida se o papel do usuário satisfaz o papel mínimo exigido
 */
export function hasRolePermission(userRole: Role, minimumRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 99;
  return userLevel >= requiredLevel;
}
