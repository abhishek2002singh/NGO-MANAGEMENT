

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
  AUTH: "/auth",
} as const;

export const CORS_CONFIG = {
  METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  ALLOWED_HEADERS: ["Content-Type", "Authorization", "x-org-id", "x-request-id"],
  EXPOSED_HEADERS: ["x-request-id"],
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
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
  SERVER_START_FAILED: "Failed to start server",
  VALIDATION_FAILED: "Validation failed",
  DUPLICATE_RECORD: "Record already exists",
  RECORD_NOT_FOUND: "Record not found",
  INVALID_JSON: "Invalid JSON in request body",
} as const;

export const REQUEST_ID_HEADER = "x-request-id";
export const ORG_ID_HEADER = "x-org-id";

export const JSON_BODY_LIMIT = "1mb";

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 20,
  IPV6_SUBNET: 56,
} as const;

export const AUTH = {
  REFRESH_COOKIE: "refresh_token",
  REFRESH_COOKIE_PATH: "/api/auth",
  MAX_FAILED_LOGINS: 5,
  LOCK_MINUTES: 15,
  EMAIL_VERIFY_TTL_HOURS: 24,
  PASSWORD_RESET_TTL_MINUTES: 30,
} as const;

export const AUTH_MESSAGES = {
  REGISTERED: "NGO registered successfully",
  LOGGED_IN: "Logged in",
  LOGGED_OUT: "Logged out",
  LOGGED_OUT_ALL: "Logged out from all devices",
  TOKEN_REFRESHED: "Token refreshed",
  PROFILE: "Current user",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_LOCKED: "Account locked due to too many failed attempts. Try again later",
  ACCOUNT_DISABLED: "Account is disabled",
  EMAIL_TAKEN: "Email is already registered",
  TOKEN_MISSING: "Authentication required",
  TOKEN_INVALID: "Invalid or expired token",
  SESSION_INVALID: "Session expired, please log in again",
  RESET_LINK_SENT: "If that email exists, a reset link has been sent",
  PASSWORD_RESET: "Password has been reset, please log in",
  VERIFY_LINK_SENT: "Verification email sent",
  EMAIL_VERIFIED: "Email verified",
  ALREADY_VERIFIED: "Email is already verified",
  LINK_INVALID: "Link is invalid or has expired",
} as const;
