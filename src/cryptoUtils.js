const FORMAT_VERSION = 1;
const VERSION_LENGTH = 1;

const DEFAULT_PBKDF2_ITERATIONS = 210000;
const MIN_PBKDF2_ITERATIONS = 100000;

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

async function deriveKey(password, salt, iterations = DEFAULT_PBKDF2_ITERATIONS) {
  if (iterations < MIN_PBKDF2_ITERATIONS) {
    throw new Error(`PBKDF2 iterations must be at least ${MIN_PBKDF2_ITERATIONS}`);
  }

  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

function generateRandomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function clearString(str) {
  if (str && typeof str === 'string') {
    str = null;
  }
}

export async function encrypt(plaintext, password, iterations = DEFAULT_PBKDF2_ITERATIONS) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const salt = generateRandomBytes(SALT_LENGTH);
    const iv = generateRandomBytes(IV_LENGTH);

    const key = await deriveKey(password, salt, iterations);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    const versionByte = new Uint8Array([FORMAT_VERSION]);
    const combined = new Uint8Array(
      VERSION_LENGTH + SALT_LENGTH + IV_LENGTH + encryptedData.byteLength
    );
    combined.set(versionByte, 0);
    combined.set(salt, VERSION_LENGTH);
    combined.set(iv, VERSION_LENGTH + SALT_LENGTH);
    combined.set(new Uint8Array(encryptedData), VERSION_LENGTH + SALT_LENGTH + IV_LENGTH);

    const result = arrayBufferToBase64(combined.buffer);

    clearString(password);
    clearString(plaintext);

    return result;
  } catch (error) {
    clearString(password);
    clearString(plaintext);
    throw error;
  }
}

export async function decrypt(encryptedBase64, password, iterations = DEFAULT_PBKDF2_ITERATIONS) {
  let decryptedText = null;
  try {
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));

    const minLength = VERSION_LENGTH + SALT_LENGTH + IV_LENGTH;
    if (combined.length < minLength) {
      throw new Error('Invalid encrypted data format');
    }

    const version = combined[0];
    if (version !== FORMAT_VERSION) {
      throw new Error(`Unsupported format version: ${version}. This app supports version ${FORMAT_VERSION} only.`);
    }

    const salt = combined.slice(VERSION_LENGTH, VERSION_LENGTH + SALT_LENGTH);
    const iv = combined.slice(VERSION_LENGTH + SALT_LENGTH, VERSION_LENGTH + SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(VERSION_LENGTH + SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(password, salt, iterations);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    decryptedText = decoder.decode(decryptedData);

    clearString(password);

    return decryptedText;
  } catch (error) {
    clearString(password);
    if (decryptedText) {
      clearString(decryptedText);
    }

    if (error.name === 'OperationError' || error.message.includes('format')) {
      throw new Error('Decryption failed: incorrect password or tampered data');
    }
    throw error;
  }
}

export function getDefaultIterations() {
  return DEFAULT_PBKDF2_ITERATIONS;
}

export function validateIterations(iterations) {
  return iterations >= MIN_PBKDF2_ITERATIONS && Number.isInteger(iterations);
}
