const SERIAL_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateSerialRaw(length = 16) {
  let result = "";

  const cryptoObject = globalThis.crypto;
  const values = new Uint32Array(length);
  cryptoObject.getRandomValues(values);

  for (let i = 0; i < length; i += 1) {
    result += SERIAL_CHARS[values[i] % SERIAL_CHARS.length];
  }

  return result;
}

export function formatSerialKey(raw: string) {
  const clean = raw.replaceAll("-", "");
  return clean.match(/.{1,4}/g)?.join("-") ?? clean;
}

export function normalizeSerialInput(input: string) {
  return input.trim().replaceAll("-", "");
}

export function isValidSerialFormat(input: string) {
  const raw = normalizeSerialInput(input);
  return /^[A-Za-z0-9]{16}$/.test(raw);
}
