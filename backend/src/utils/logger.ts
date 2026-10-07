import pino from "pino";
import { env } from "../config/env";
import { NODE_ENVS } from "../constants";

const isDev = env.nodeEnv !== NODE_ENVS.PRODUCTION;

export const logger = pino({
  level: process.env["LOG_LEVEL"] ?? (isDev ? "debug" : "info"),
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"],
  ...(isDev && {
    transport: { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } },
  }),
});
