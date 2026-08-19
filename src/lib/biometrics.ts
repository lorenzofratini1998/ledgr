/**
 * WebAuthn / Biometrics (Face ID, Touch ID, Windows Hello) integration utilities
 */

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const CREDENTIAL_STORAGE_KEY = 'ledgr_biometric_credential_id';
const USER_EMAIL_STORAGE_KEY = 'ledgr_biometric_user_email';

/**
 * Checks whether the device and browser support WebAuthn with a platform authenticator (Face ID / Touch ID)
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !window.PublicKeyCredential ||
    !navigator.credentials
  ) {
    return false;
  }

  try {
    const isPlatformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return isPlatformAvailable;
  } catch {
    return false;
  }
}

/**
 * Registers the current device by creating a local WebAuthn platform credential
 */
export async function registerBiometric(userId: string, userEmail: string): Promise<string> {
  if (!window.PublicKeyCredential || !navigator.credentials) {
    throw new Error('WebAuthn is not supported on this device/browser.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const createOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Ledgr PWA',
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(userId),
      name: userEmail || 'user@ledgr.local',
      displayName: userEmail || 'Ledgr User',
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Enforce Face ID / Touch ID / Windows Hello
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = (await navigator.credentials.create({
    publicKey: createOptions,
  })) as PublicKeyCredential;

  if (!credential) {
    throw new Error('No credential returned by the device.');
  }

  const rawIdBase64 = bufferToBase64Url(credential.rawId);
  localStorage.setItem(CREDENTIAL_STORAGE_KEY, rawIdBase64);
  if (userEmail) {
    localStorage.setItem(USER_EMAIL_STORAGE_KEY, userEmail);
  }
  return rawIdBase64;
}

/**
 * Executes biometric unlock verification (Face ID / Touch ID)
 */
export async function authenticateBiometric(): Promise<boolean> {
  if (!window.PublicKeyCredential || !navigator.credentials) {
    return false;
  }

  const storedCredentialId = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    rpId: window.location.hostname,
    ...(storedCredentialId
      ? {
          allowCredentials: [
            {
              id: base64UrlToBuffer(storedCredentialId).buffer as ArrayBuffer,
              type: 'public-key',
            },
          ],
        }
      : {}),
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: getOptions,
    });
    return !!assertion;
  } catch (error: any) {
    console.warn('Biometric authentication attempt failed:', error);
    return false;
  }
}

/**
 * Clears the stored biometric credential from local storage
 */
export function clearBiometricCredential(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
    localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
  }
}

/**
 * Checks whether a local biometric credential ID is stored on this device
 */
export function hasLocalBiometricCredential(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(CREDENTIAL_STORAGE_KEY);
}

/**
 * Retrieves the stored biometric user email
 */
export function getBiometricUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_EMAIL_STORAGE_KEY);
}

/**
 * Retrieves the stored biometric credential ID
 */
export function getBiometricCredentialId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CREDENTIAL_STORAGE_KEY);
}

const SESSION_UNLOCKED_KEY = 'ledgr_session_unlocked';
const LAST_ACTIVE_KEY = 'ledgr_last_active_timestamp';

/**
 * Marks the current browser session as unlocked with a timestamp
 */
export function markSessionUnlocked(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
    sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }
}

/**
 * Marks the current browser session as locked
 */
export function markSessionLocked(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
  }
}

/**
 * Checks whether the current session is validly unlocked within the timeout
 */
export function isSessionUnlocked(timeoutSeconds: number): boolean {
  if (typeof window === 'undefined') return false;
  const isUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
  if (!isUnlocked) return false;

  const lastActiveStr = sessionStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActiveStr) return false;

  if (timeoutSeconds > 0) {
    const elapsedSeconds = (Date.now() - parseInt(lastActiveStr, 10)) / 1000;
    return elapsedSeconds < timeoutSeconds;
  }

  return true;
}
