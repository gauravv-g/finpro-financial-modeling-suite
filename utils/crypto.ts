import CryptoJS from 'crypto-js';

// --- ROBUST, UNIVERSAL CRYPTO IMPLEMENTATION ---
// Uses crypto-js to ensure compatibility across Browser, Node, and Cloudflare Workers.
// Eliminates TypeScript buffer type mismatches and 'util' module errors.

/**
 * Encrypts a JSON object or string using AES-256.
 * @param data The data to encrypt (object or string)
 * @param password The master password
 * @returns The encrypted ciphertext string
 */
export const encryptData = async (data: any, password: string): Promise<string> => {
  try {
    // Ensure data is a string
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Encrypt using AES
    // CryptoJS automatically handles Salt and IV generation internally
    const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
    
    return encrypted;
  } catch (e) {
    console.error("Encryption Failed", e);
    throw new Error("Could not encrypt data.");
  }
};

/**
 * Decrypts a ciphertext string using AES-256.
 * @param ciphertext The encrypted string
 * @param password The master password
 * @returns The original data object
 */
export const decryptData = async (ciphertext: string, password: string): Promise<any> => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error("Malformed data or wrong password");
    }

    return JSON.parse(originalText);
  } catch (e) {
    console.error("Decryption Failed", e);
    // Throw a generic error to the UI
    throw new Error("Incorrect Password or Corrupted Data");
  }
};

/**
 * Hashes a password for verification (SHA-256).
 * Used to verify the password without storing it.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

/**
 * Generates a recovery key based on the password.
 * This is a deterministic hash of the password + a salt.
 */
export const exportRecoveryKey = async (password: string): Promise<string> => {
  const recoverySalt = "_RECOVERY_SALT_V2_";
  // We use a slow hash (PBKDF2) for the recovery key to make it harder to reverse
  const key = CryptoJS.PBKDF2(password, recoverySalt, {
    keySize: 256 / 32,
    iterations: 1000
  });
  return key.toString(CryptoJS.enc.Base64);
};