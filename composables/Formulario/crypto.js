import CryptoJS from "crypto-js";

export function encryptData(data) {
  const config = useRuntimeConfig()
  const key = config.public.SECRET_KEY

  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key
  ).toString()
}

export function decryptData(ciphertext) {
  if (!ciphertext) return null;

  try {
    const config = useRuntimeConfig()
    const key = config.public.SECRET_KEY

    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted || decrypted.length < 2) return null;

    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}
