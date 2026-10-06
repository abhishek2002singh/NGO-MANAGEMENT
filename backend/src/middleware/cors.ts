import cors from "cors";
import { env } from "../config/env";
import { CORS_CONFIG } from "../constants";

export const corsMiddleware = cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: [...CORS_CONFIG.METHODS],
  allowedHeaders: [...CORS_CONFIG.ALLOWED_HEADERS],
});
