import { computeSignature, signaturesMatch } from './signature.js';

describe('WhatsApp signature', () => {
  const secret = 'testsecret';
  const body = Buffer.from('{"hello":"world"}', 'utf8');

  it('computes prefixed sha256 signature', () => {
    const sig = computeSignature(secret, body);
    expect(sig.startsWith('sha256=')).toBe(true);
    expect(sig.length).toBeGreaterThan('sha256='.length);
  });

  it('matches expected and provided signatures safely', () => {
    const expected = computeSignature(secret, body);
    expect(signaturesMatch(expected, expected)).toBe(true);
  });

  it('detects mismatched signatures', () => {
    const expected = computeSignature(secret, body);
    const wrong = computeSignature('wrong', body);
    expect(signaturesMatch(expected, wrong)).toBe(false);
  });
});

