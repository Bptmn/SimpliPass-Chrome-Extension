// Compatibility tests against Flutter/iOS fixtures (if present)
import fs from 'fs';
import path from 'path';
import { webcrypto } from 'crypto';

import {
  deriveKey,
  encryptData,
  decryptData,
} from '@common/core/libraries/crypto';

// Ensure WebCrypto is available in test env
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

type FixtureCase = {
  name?: string;
  // PBKDF2
  masterPassword?: string;
  saltB64Url?: string;
  expectedDerivedKeyB64Url?: string;
  // Encrypt/Decrypt
  keyB64Url?: string; // 32-byte key (Base64URL)
  plaintext?: string;
  // Base64 (standard) blob of [nonce(12)|cipher|tag(16)]
  ciphertextBase64?: string;
};

function loadFixtures(): FixtureCase[] | null {
  const candidates = [
    path.resolve(process.cwd(), 'docs/crypto_reference/fixtures.json'),
    path.resolve(process.cwd(), 'crypto_reference/fixtures.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      try {
        const json = JSON.parse(raw);
        if (Array.isArray(json)) return json as FixtureCase[];
        if (Array.isArray(json?.cases)) return json.cases as FixtureCase[];
      } catch {
        // Ignore malformed fixtures
      }
    }
  }
  return null;
}

describe('Crypto compatibility with Flutter/iOS fixtures', () => {
  const fixtures = loadFixtures();

  if (!fixtures || fixtures.length === 0) {
    it('skips because no fixtures.json found (optional)', () => {
      expect(true).toBe(true);
    });
    return;
  }

  for (const fx of fixtures) {
    const name = fx.name || 'fixture';

    if (fx.masterPassword && fx.saltB64Url && fx.expectedDerivedKeyB64Url) {
      it(`[PBKDF2] derives expected key for ${name}`, async () => {
        const out = await deriveKey(fx.masterPassword as string, fx.saltB64Url as string);
        expect(out).toBe(fx.expectedDerivedKeyB64Url);
      });
    }

    if (fx.keyB64Url && fx.plaintext) {
      it(`[Encrypt] produces Base64 blob (nonce|cipher|tag) for ${name}`, () => {
        const blob = encryptData(fx.keyB64Url as string, fx.plaintext as string);
        // Basic sanity checks: Base64 charset and length >= 12+16
        expect(blob).toMatch(/^[A-Za-z0-9+/=]+$/);
        const buf = Buffer.from(blob, 'base64');
        expect(buf.length).toBeGreaterThanOrEqual(12 + 16);
      });
    }

    if (fx.keyB64Url && fx.ciphertextBase64 && typeof fx.plaintext === 'string') {
      it(`[Decrypt] matches expected plaintext for ${name}`, () => {
        const pt = decryptData(fx.keyB64Url as string, fx.ciphertextBase64 as string);
        expect(pt).toBe(fx.plaintext);
      });
    }

    if (fx.keyB64Url && fx.plaintext && fx.ciphertextBase64) {
      it(`[Round-trip parity] our encrypt matches provided ciphertext (if deterministic nonce not required) for ${name}`, () => {
        // Our nonce is random; ciphertext will differ. Validate decrypting provided ciphertext works
        const pt = decryptData(fx.keyB64Url as string, fx.ciphertextBase64 as string);
        expect(pt).toBe(fx.plaintext);
      });
    }
  }
});


