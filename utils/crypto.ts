// Import for Node.js/Cloudflare Workers compatibility.
import { TextEncoder, TextDecoder } from 'util';

// --- Helper Functions for Environment Compatibility ---

const subtleCrypto = crypto.subtle;

const base64Encode = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('base64');
};

const base64Decode = (str: string): Uint8Array => {
  return new Uint8Array(Buffer.from(str, 'base64'));
};


// --- Main Crypto Logic ---

const ENCODING = new TextEncoder();
const DECODING = new TextDecoder();

// 1. Generate a Key from the User's Password (PBKDF2)
const getKeyMaterial = (password: string) => {
  return subtleCrypto.importKey(
    "raw",
    ENCODING.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
};

const getKey = (keyMaterial: CryptoKey, salt: Uint8Array) => {
  const pbkdf2Params: Pbkdf2Params = {
      name: "PBKDF2",
      // FIX: Use @ts-ignore to bypass the strict type check.
      // @ts-ignore
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
  };

  return subtleCrypto.deriveKey(
    pbkdf2Params,
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

// 2. Encrypt Data
export const encryptData = async (data: any, password: string): Promise<string> => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);
    
    const jsonString = JSON.stringify(data);
    const encodedData = ENCODING.encode(jsonString);
    
    const encryptedContent = await subtleCrypto.encrypt(
      {
        name: "AES-GCM",
        // FIX: Use @ts-ignore to bypass the strict type check.
        // @ts-ignore
        iv: iv
      },
      key,
      encodedData
    );

    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

    return base64Encode(buffer);
  } catch (e) {
    console.error("Encryption Failed", e);
    throw new Error("Could not encrypt data.");
  }
};

// 3. Decrypt Data
export const decryptData = async (ciphertextBase64: string, password: string): Promise<any> => {
  try {
    const buffer = base64Decode(ciphertextBase64);

    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);

    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);

    const decryptedContent = await subtleCrypto.decrypt(
      {
        name: "AES-GCM",
        // FIX: Use @ts-ignore to bypass the strict type check.
        // @ts-ignore
        iv: iv
      },
      key,
      // FIX: Use @ts-ignore to bypass the strict type check.
      // @ts-ignore
      data
    );

    const decodedString = DECODING.decode(decryptedContent);
    return JSON.parse(decodedString);
  } catch (e) {
    console.error("Decryption Failed", e);
    throw new Error("Incorrect Password or Corrupted Data");
  }
};

// 4. Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const msgUint8 = ENCODING.encode(password);
  const hashBuffer = await subtleCrypto.digest('SHA-256', msgUint8);
  return Buffer.from(hashBuffer).toString('base64');
};

// 5. Export Raw Key (Recovery Code)
export const exportRecoveryKey = async (password: string): Promise<string> => {
    const recoverySalt = ENCODING.encode("_RECOVERY_SALT");
    const keyMaterial = await getKeyMaterial(password);
    const recoveryKeyBuffer = await subtleCrypto.deriveBits(
        {
            name: "PBKDF2",
            // FIX: Use @ts-ignore to bypass the strict type check.
            // @ts-ignore
            salt: recoverySalt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );
    return Buffer.from(recoveryKeyBuffer).toString('base64');
};