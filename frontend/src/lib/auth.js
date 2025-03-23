import { SignJWT } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const encoder = new TextEncoder();
const JWT_SECRET = encoder.encode(process.env.JWT_SECRET);

export async function sign(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}