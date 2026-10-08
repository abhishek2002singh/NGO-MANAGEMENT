import path from "node:path";
import dotenv from "dotenv";
import { DEFAULT_PORT, ENV_FILES, NODE_ENVS } from "../constants";

const nodeEnv = process.env["NODE_ENV"] ?? NODE_ENVS.DEVELOPMENT;
const envFile = nodeEnv === NODE_ENVS.PRODUCTION ? ENV_FILES.PRODUCTION : ENV_FILES.DEVELOPMENT;

dotenv.config({ path: path.resolve(process.cwd(), envFile), quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (checked ${envFile})`);
  }
  return value;
}

export const env = {
  nodeEnv,
  port: Number(process.env["PORT"] ?? DEFAULT_PORT),
  databaseUrl: required("DATABASE_URL"),
  frontendUrl: process.env["FRONTEND_URL"],
  // base url used in emailed links (verify email, reset password, invites)
  appUrl: process.env["APP_URL"] ?? process.env["FRONTEND_URL"] ?? "http://localhost:5173",
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessTtl: process.env["JWT_ACCESS_TTL"] ?? "15m",
    refreshTtl: process.env["JWT_REFRESH_TTL"] ?? "7d",
  },
};
