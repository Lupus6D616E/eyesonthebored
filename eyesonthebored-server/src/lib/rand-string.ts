export function secureRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"; // 36 characters
  const limit = 256 - (256 % chars.length); // 252, reject values above this to avoid bias
  let result = "";

  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (const byte of bytes) {
      if (byte < limit && result.length < length) {
        result += chars[byte % chars.length];
      }
    }
  }
  return result;
}
// hi there this is stupid as fuck lmao