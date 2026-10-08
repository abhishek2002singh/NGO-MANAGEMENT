import { createHash, randomBytes } from "node:crypto";

// Opaque tokens (refresh, reset, invite) are sent raw to the client and stored only as a hash.
export const generateToken = (bytes = 32): string => randomBytes(bytes).toString("base64url");

export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

// "15m" / "7d" / "12h" / "30s" -> milliseconds
export const durationToMs = (value: string): number => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "s" | "m" | "h" | "d"];
  return Number(match[1]) * unit;
};
