import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env";
import { AUTH, AUTH_MESSAGES, HTTP_STATUS, NODE_ENVS } from "../../constants";
import { successResponse } from "../../utils/apiResponse";
import { AppError } from "../../utils/appError";
import { audit } from "../audit/audit.service";
import * as authService from "./auth.service";
import {
  forgotPasswordSchema,
  loginSchema,
  registerNgoSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation";

const cookieOptions = (expires?: Date): CookieOptions => ({
  httpOnly: true,
  secure: env.nodeEnv === NODE_ENVS.PRODUCTION,
  sameSite: "lax",
  path: AUTH.REFRESH_COOKIE_PATH,
  ...(expires && { expires }),
});

const clientInfo = (req: Request): authService.ClientInfo => ({ ip: req.ip, userAgent: req.get("user-agent") });

const readRefreshCookie = (req: Request): string | undefined => {
  const value: unknown = req.cookies?.[AUTH.REFRESH_COOKIE];
  return typeof value === "string" && value ? value : undefined;
};

// Refresh token only ever travels in the httpOnly cookie; the body gets the access token.
const sendTokens = (res: Response, tokens: authService.AuthTokens) => {
  res.cookie(AUTH.REFRESH_COOKIE, tokens.refreshToken, cookieOptions(tokens.refreshExpiresAt));
  return { accessToken: tokens.accessToken };
};

export const registerNgo = async (req: Request, res: Response) => {
  const input = registerNgoSchema.parse(req.body);
  const result = await authService.registerNgo(input, clientInfo(req));

  await audit(req, {
    action: "ngo.register",
    entity: "Organization",
    entityId: result.organization.id,
    organizationId: result.organization.id,
    actorUserId: result.user.id,
  });

  successResponse(
    res,
    AUTH_MESSAGES.REGISTERED,
    { user: result.user, organization: result.organization, ...sendTokens(res, result.tokens) },
    HTTP_STATUS.CREATED
  );
};

export const login = async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input, clientInfo(req));

  await audit(req, { action: "auth.login", entity: "User", entityId: result.user.id, actorUserId: result.user.id });
  successResponse(res, AUTH_MESSAGES.LOGGED_IN, { user: result.user, ...sendTokens(res, result.tokens) });
};

export const refresh = async (req: Request, res: Response) => {
  const token = readRefreshCookie(req);
  if (!token) throw AppError.unauthorized(AUTH_MESSAGES.SESSION_INVALID);

  try {
    const tokens = await authService.refreshSession(token, clientInfo(req));
    successResponse(res, AUTH_MESSAGES.TOKEN_REFRESHED, sendTokens(res, tokens));
  } catch (err) {
    res.clearCookie(AUTH.REFRESH_COOKIE, cookieOptions());
    throw err;
  }
};

export const logout = async (req: Request, res: Response) => {
  await authService.logout(readRefreshCookie(req));
  res.clearCookie(AUTH.REFRESH_COOKIE, cookieOptions());
  successResponse(res, AUTH_MESSAGES.LOGGED_OUT);
};

export const logoutAll = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await authService.logoutAll(userId);
  await audit(req, { action: "auth.logout_all", entity: "User", entityId: userId });
  res.clearCookie(AUTH.REFRESH_COOKIE, cookieOptions());
  successResponse(res, AUTH_MESSAGES.LOGGED_OUT_ALL);
};

export const me = async (req: Request, res: Response) => {
  successResponse(res, AUTH_MESSAGES.PROFILE, await authService.getMe(req.user!.id));
};

export const resendVerification = async (req: Request, res: Response) => {
  await authService.resendEmailVerification(req.user!.id);
  successResponse(res, AUTH_MESSAGES.VERIFY_LINK_SENT);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.body);
  await authService.verifyEmail(token);
  successResponse(res, AUTH_MESSAGES.EMAIL_VERIFIED);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  successResponse(res, AUTH_MESSAGES.RESET_LINK_SENT);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  const userId = await authService.resetPassword(token, password);
  await audit(req, { action: "auth.password_reset", entity: "User", entityId: userId, actorUserId: userId });
  res.clearCookie(AUTH.REFRESH_COOKIE, cookieOptions());
  successResponse(res, AUTH_MESSAGES.PASSWORD_RESET);
};
