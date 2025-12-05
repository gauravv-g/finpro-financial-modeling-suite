
// Native Browser Crypto API (SubtleCrypto) implementation for AES-GCM
// This requires NO external libraries and runs entirely in the browser.

const ENCODING = new TextEncoder();
const DECODING = new TextDecoder();

// 1. Generate a Key from the User's Password (PBKDF2)
const getKeyMaterial = (password: string) => {
  return window.crypto.subtle.importKey(
    "raw",
    ENCODING.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
};

const getKey = (keyMaterial: CryptoKey, salt: Uint8Array) => {
  // DEFINITIVE FIX: Explicitly cast the 'salt' to BufferSource.
  // This resolves the TS2769 error caused by type inference issues in the build environment.
  const pbkdf2Params: Pbkdf2Params = {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000, // High iteration count to slow down brute-force attacks
      hash: "SHA-256"
  };

  return window.crypto.subtle.deriveKey(
    pbkdf2Params,
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
};

// 2. Encrypt Data
export const encryptData = async (data: any, password: string): Promise<string> => {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector for AES-GCM
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);
    
    const jsonString = JSON.stringify(data);
    const encodedData = ENCODING.encode(jsonString);
    
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );

    // Combine Salt + IV + Ciphertext into a single buffer for storage
    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

    // Convert to Base64 for LocalStorage
    return btoa(String.fromCharCode(...buffer));
  } catch (e) {
    console.error("Encryption Failed", e);
    throw new Error("Could not encrypt data.");
  }
};

// 3. Decrypt Data
export const decryptData = async (ciphertextBase64: string, password: string): Promise<any> => {
  try {
    const binaryString = atob(ciphertextBase64);
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }

    // Extract Salt (16 bytes) and IV (12 bytes)
    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);

    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      data
    );

    const decodedString = DECODING.decode(decryptedContent);
    return JSON.parse(decodedString);
  } catch (e) {
    console.error("Decryption Failed", e);
    throw new Error("Incorrect Password or Corrupted Data");
  }
};

// 4. Hash Password (for verification without storing the actual password)
export const hashPassword = async (password: string): Promise<string> => {
  const msgUint8 = ENCODING.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 5. Export Raw Key (Recovery Code)
export const exportRecoveryKey = async (password: string): Promise<string> => {
    return btoa(await hashPassword(password + "_RECOVERY_SALT")); 
};
