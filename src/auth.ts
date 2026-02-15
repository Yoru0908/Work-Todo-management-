import { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { users, User } from './schema'

export interface JwtPayload {
  sub: string
  username: string
  role: string
  iat: number
  exp: number
}

// Simple base64 encoding/decoding for JWT
function base64Encode(str: string): string {
  return btoa(str)
}

function base64Decode(str: string): string {
  return atob(str)
}

function createToken(payload: JwtPayload, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64Encode(JSON.stringify(header))
  const encodedPayload = base64Encode(JSON.stringify(payload))
  const signature = base64Encode(secret + '.' + encodedHeader + '.' + encodedPayload)
  return encodedHeader + '.' + encodedPayload + '.' + signature
}

function verifyToken(token: string, secret: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(base64Decode(parts[1])) as JwtPayload
    return payload
  } catch {
    return null
  }
}

const getSecretKey = (env: string | undefined): string => {
  return env || 'your-secret-key-change-in-production'
}

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'session_token')
  const secret = getSecretKey(c.env.JWT_SECRET)

  if (!token) {
    c.set('user', null)
    return next()
  }

  try {
    const payload = verifyToken(token, secret)
    if (!payload) {
      c.set('user', null)
      return next()
    }

    const db = drizzle(c.env.DB)
    const result = await db.select().from(users).where(eq(users.id, parseInt(payload.sub))).limit(1)

    if (result.length > 0) {
      c.set('user', result[0])
    } else {
      c.set('user', null)
    }
  } catch {
    c.set('user', null)
  }

  await next()
}

export async function generateToken(user: User, env: string | undefined): Promise<string> {
  const secret = getSecretKey(env)
  const payload: JwtPayload = {
    sub: user.id.toString(),
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }
  return createToken(payload, secret)
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, 'session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, 'session_token', { path: '/' })
}

export function requireAuth(c: Context): User | null {
  return c.get('user') as User | null
}

export function requireAdmin(c: Context): User | null {
  const user = c.get('user') as User | null
  if (!user || user.role !== 'admin') return null
  return user
}
