import { SignJWT, jwtVerify } from 'jose'

async function secret(): Promise<Uint8Array> {
  const s = process.env.COOKIE_SECRET
  if (!s) throw new Error('COOKIE_SECRET is not set')
  if (s.length < 32) {
    throw new Error('COOKIE_SECRET must be at least 32 characters long')
  }
  return new TextEncoder().encode(s)
}

export async function signGuestToken(): Promise<string> {
  const secretKey = await secret()
  return new SignJWT({ role: 'guest' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey)
}

export async function verifyGuestToken(token: string): Promise<boolean> {
  try {
    const secretKey = await secret()
    await jwtVerify(token, secretKey)
    return true
  } catch {
    return false
  }
}
