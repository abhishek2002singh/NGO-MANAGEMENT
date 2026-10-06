

export const NODE_ENVS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export const ENV_FILES = {
  DEVELOPMENT: ".env.dev",
  PRODUCTION: ".env.prod",
} as const;

export const DEFAULT_PORT = 5000;

export const API_PREFIX = "/api";

export const APP_NAME = "NGO Management API";
export const APP_VERSION = "1.0.0";

export const DATE_LOCALE = "en-IN";
export const TIME_ZONE = "Asia/Kolkata";

export const ROUTES = {
  HOME: "/",
  HEALTH: "/health",
} as const;

export const CORS_CONFIG = {
  METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  ALLOWED_HEADERS: ["Content-Type", "Authorization"],
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const MESSAGES = {
  WELCOME: "Namaste! NGO Management API is live",
  SERVER_HEALTHY:"Server is healthy",
  DATABASE_CONNECTED: "Database connected",
  DATABASE_DISCONNECTED: "Database disconnected",
  ROUTE_NOT_FOUND: "Route not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  TOO_MANY_REQUESTS: "Too many requests, please try again later",
  SERVER_START_FAILED: "Failed to start server:",
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_REQUESTS: 100,
  IPV6_SUBNET: 56,
} as const;
