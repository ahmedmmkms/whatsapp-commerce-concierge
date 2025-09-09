import { createHmac, timingSafeEqual } from 'node:crypto';

export function computeSignature(secret: string, rawBody: Buffer): string {
  const mac = createHmac('sha256', secret).update(rawBody).digest('hex');
  return `sha256=${mac}`;
}

export function signaturesMatch(expected: string, got: string): boolean {
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(got);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

