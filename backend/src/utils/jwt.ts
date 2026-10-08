import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  // tokenVersion; bumping it on the user kills every outstanding access token
  tv: number;
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl as SignOptions["expiresIn"] });

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded["tv"] !== "number") return null;
    return { sub: decoded.sub, tv: decoded["tv"] };
  } catch {
    return null;
  }
};
