import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AUTH_MESSAGES } from "../constants";
import { AppError } from "../utils/appError";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw AppError.unauthorized(AUTH_MESSAGES.TOKEN_MISSING);

  const payload = verifyAccessToken(header.slice(7));
  if (!payload) throw AppError.unauthorized(AUTH_MESSAGES.TOKEN_INVALID);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, status: true, tokenVersion: true, deletedAt: true },
  });
  if (!user || user.deletedAt || user.tokenVersion !== payload.tv) {
    throw AppError.unauthorized(AUTH_MESSAGES.TOKEN_INVALID);
  }
  if (user.status === "DISABLED") throw AppError.forbidden(AUTH_MESSAGES.ACCOUNT_DISABLED);

  req.user = { id: user.id, email: user.email, name: user.name };
  req.log = req.log.child({ userId: user.id });
  next();
};
