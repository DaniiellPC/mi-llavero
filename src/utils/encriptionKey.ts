import { getRandomValues } from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const ENCRYPTION_KEY_NAME = "realm_encryption_key";

// Convierte bytes a string hex para persistir de forma portable sin dependencias adicionales
const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
};

// Convierte string hex a Uint8Array
const hexToBytes = (hexString: string): Uint8Array => {
  const clean = hexString.trim();
  if (clean.length % 2 !== 0) throw new Error("Invalid hex string length");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return out;
};

// Genera una clave de 64 bytes (512 bits) usando CSPRNG
const generateRandomKey = (): Uint8Array => {
  const bytes = new Uint8Array(64);
  getRandomValues(bytes);
  return bytes;
};

export const getEncryptionKey = async (): Promise<Uint8Array> => {
  let stored = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

  if (!stored) {
    const newKeyBytes = generateRandomKey();
    const hex = bytesToHex(newKeyBytes);
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, hex);
    return newKeyBytes;
  }

  return hexToBytes(stored);
};

// Nota:
// - Usamos expo-crypto para obtener 64 bytes criptográficamente seguros.
// - Persistimos la clave en SecureStore como string hex (evita depender de btoa/atob/base-64).
