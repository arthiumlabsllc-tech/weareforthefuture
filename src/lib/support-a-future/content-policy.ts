// Detection patterns only, never display copy. This file is excluded from the
// source-language scanner, like its own pattern list, and covered by tests.
const bannedPublicCopy = [
  /\bunderprivileged\b/i, /\bless privileged\b/i, /\bpoor children\b/i,
  /\bneedy\b/i, /\bless fortunate\b/i, /\bthird world\b/i, /\bdeveloping world\b/i,
  /\bsaviou?r\b/i, /\bhelpless\b/i, /\bhandout\b/i, /\bevery dollar\b/i,
  /90%\s*(?:to|goes to|of every)\b/i,
];

export function hasBannedPublicCopy(value: string) {
  return bannedPublicCopy.some((pattern) => pattern.test(value));
}
