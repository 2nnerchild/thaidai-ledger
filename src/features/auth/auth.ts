const PASSWORD_KEY = 'thaidai_auth_password';
const SESSION_KEY = 'thaidai_auth_session';
const ITERATIONS = 120_000;

interface StoredPassword {
  salt: string;
  hash: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function derivePasswordHash(password: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  return bytesToBase64(new Uint8Array(bits));
}

function getStoredPassword(): StoredPassword | null {
  const raw = localStorage.getItem(PASSWORD_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredPassword;
  } catch {
    return null;
  }
}

export function hasPassword(): boolean {
  return getStoredPassword() !== null;
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'Y';
}

export async function setPassword(password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  localStorage.setItem(PASSWORD_KEY, JSON.stringify({ salt: bytesToBase64(salt), hash }));
  sessionStorage.setItem(SESSION_KEY, 'Y');
}

export async function verifyPassword(password: string): Promise<boolean> {
  const stored = getStoredPassword();
  if (!stored) return false;

  const hash = await derivePasswordHash(password, base64ToBytes(stored.salt));
  const ok = hash === stored.hash;
  if (ok) sessionStorage.setItem(SESSION_KEY, 'Y');
  return ok;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
