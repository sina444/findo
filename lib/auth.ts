import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-dev-secret-change-me'
);

const COOKIE_NAME = 'admin_token';
const TOKEN_TTL = '7d';

export interface AdminPayload {
  id: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as string, username: payload.username as string };
  } catch {
    return null;
  }
}

export function getCookieName(): string {
  return COOKIE_NAME;
}
