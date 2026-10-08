import { randomUUID } from "node:crypto";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AUTH, AUTH_MESSAGES } from "../../constants";
import { DEFAULT_PLAN_CODE } from "../../constants/plans";
import { ROLE_KEYS } from "../../constants/roles";
import { AppError } from "../../utils/appError";
import { signAccessToken } from "../../utils/jwt";
import { logger } from "../../utils/logger";
import { hashPassword, verifyPassword } from "../../utils/password";
import { durationToMs, generateToken, hashToken, slugify } from "../../utils/token";
import type { LoginInput, RegisterNgoInput } from "./auth.validation";

export interface ClientInfo {
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

const DAY_MS = 86_400_000;

// ---------- sessions ----------

const createSession = async (
  user: { id: string; tokenVersion: number },
  client: ClientInfo,
  familyId: string = randomUUID()
): Promise<AuthTokens & { sessionId: string }> => {
  const refreshToken = generateToken();
  const refreshExpiresAt = new Date(Date.now() + durationToMs(env.jwt.refreshTtl));

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      familyId,
      ip: client.ip ?? null,
      userAgent: client.userAgent ?? null,
      expiresAt: refreshExpiresAt,
    },
  });

  return {
    sessionId: session.id,
    accessToken: signAccessToken({ sub: user.id, tv: user.tokenVersion }),
    refreshToken,
    refreshExpiresAt,
  };
};

export const refreshSession = async (refreshToken: string, client: ClientInfo): Promise<AuthTokens> => {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: { select: { id: true, tokenVersion: true, status: true, deletedAt: true } } },
  });
  if (!session) throw AppError.unauthorized(AUTH_MESSAGES.SESSION_INVALID);

  // A revoked token being used again means it was stolen (or replayed) - kill the whole chain.
  if (session.revokedAt) {
    await prisma.session.updateMany({
      where: { familyId: session.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    logger.warn({ userId: session.userId, familyId: session.familyId }, "Refresh token reuse detected");
    throw AppError.unauthorized(AUTH_MESSAGES.SESSION_INVALID);
  }

  const { user } = session;
  if (session.expiresAt < new Date() || user.deletedAt || user.status === "DISABLED") {
    throw AppError.unauthorized(AUTH_MESSAGES.SESSION_INVALID);
  }

  const next = await createSession(user, client, session.familyId);
  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date(), replacedBy: next.sessionId },
  });

  return next;
};

export const logout = async (refreshToken: string | undefined): Promise<void> => {
  if (!refreshToken) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const logoutAll = async (userId: string): Promise<void> => {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }),
    prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
};

// ---------- register / login ----------

const uniqueSlug = async (name: string): Promise<string> => {
  const base = slugify(name) || "ngo";
  const taken = await prisma.organization.findUnique({ where: { slug: base }, select: { id: true } });
  return taken ? `${base}-${generateToken(4).toLowerCase().replace(/[^a-z0-9]/g, "")}` : base;
};

export const registerNgo = async (input: RegisterNgoInput, client: ClientInfo) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw AppError.conflict(AUTH_MESSAGES.EMAIL_TAKEN);

  const [plan, ownerRole] = await Promise.all([
    prisma.plan.findFirst({ where: { code: input.planCode ?? DEFAULT_PLAN_CODE, isActive: true } }),
    prisma.role.findFirst({ where: { organizationId: null, key: ROLE_KEYS.NGO_OWNER } }),
  ]);
  if (!plan) throw AppError.badRequest("Selected plan is not available");
  // missing system data means the seed was never run
  if (!ownerRole) throw new Error("System role ngo_owner not found, run `npm run prisma:seed`");

  const passwordHash = await hashPassword(input.password);
  const slug = await uniqueSlug(input.organizationName);
  const now = new Date();
  const trialEnd = new Date(now.getTime() + plan.trialDays * DAY_MS);

  const { user, organization } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.name, email: input.email, phone: input.phone ?? null, passwordHash },
    });
    const organization = await tx.organization.create({
      data: {
        type: "NGO",
        name: input.organizationName,
        slug,
        entityType: input.entityType ?? null,
        email: input.email,
        phone: input.phone ?? null,
        status: "TRIAL",
      },
    });
    await tx.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        status: "ACTIVE",
        joinedAt: now,
        roles: { create: { roleId: ownerRole.id } },
      },
    });
    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        planId: plan.id,
        status: "TRIALING",
        trialEndsAt: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
      },
    });
    return { user, organization };
  });

  await sendEmailVerification(user.id, user.email);
  const tokens = await createSession(user, client);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    organization: { id: organization.id, name: organization.name, slug: organization.slug },
    tokens,
  };
};

export const login = async (input: LoginInput, client: ClientInfo) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || user.deletedAt) {
    // still burn time on a hash so response time doesn't reveal whether the email exists
    await hashPassword(input.password);
    throw AppError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }
  if (user.status === "DISABLED") throw AppError.forbidden(AUTH_MESSAGES.ACCOUNT_DISABLED);
  if (user.lockUntil && user.lockUntil > new Date()) throw AppError.forbidden(AUTH_MESSAGES.ACCOUNT_LOCKED);

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lock = attempts >= AUTH.MAX_FAILED_LOGINS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lock ? 0 : attempts,
        lockUntil: lock ? new Date(Date.now() + AUTH.LOCK_MINUTES * 60_000) : null,
      },
    });
    throw lock ? AppError.forbidden(AUTH_MESSAGES.ACCOUNT_LOCKED) : AppError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
  });

  const tokens = await createSession(user, client);
  return { user: { id: user.id, name: user.name, email: user.email }, tokens };
};

// ---------- me ----------

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerifiedAt: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      memberships: {
        where: { status: "ACTIVE", deletedAt: null, organization: { deletedAt: null } },
        select: {
          id: true,
          organization: { select: { id: true, name: true, slug: true, type: true, status: true, logoUrl: true } },
          roles: { select: { role: { select: { key: true, name: true } } } },
        },
      },
    },
  });

  return {
    ...user,
    memberships: user.memberships.map((m) => ({
      memberId: m.id,
      organization: m.organization,
      roles: m.roles.map((r) => r.role),
    })),
  };
};

// ---------- email verification / password reset ----------

const issueToken = async (userId: string, purpose: "EMAIL_VERIFY" | "PASSWORD_RESET", ttlMs: number) => {
  const token = generateToken();
  await prisma.$transaction([
    // only the latest link of each kind stays valid
    prisma.verificationToken.updateMany({ where: { userId, purpose, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.verificationToken.create({
      data: { userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + ttlMs) },
    }),
  ]);
  return token;
};

const consumeToken = async (token: string, purpose: "EMAIL_VERIFY" | "PASSWORD_RESET") => {
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.purpose !== purpose || record.usedAt || record.expiresAt < new Date()) {
    throw AppError.badRequest(AUTH_MESSAGES.LINK_INVALID);
  }
  await prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.userId;
};

// TODO: send through the email queue once the mailer is set up (Step 10)
const deliverLink = (email: string, subject: string, url: string) => {
  logger.info({ to: email, subject, url }, "Email link (mailer not configured yet)");
};

export const sendEmailVerification = async (userId: string, email: string) => {
  const token = await issueToken(userId, "EMAIL_VERIFY", AUTH.EMAIL_VERIFY_TTL_HOURS * 3_600_000);
  deliverLink(email, "Verify your email", `${env.appUrl}/verify-email?token=${token}`);
};

export const resendEmailVerification = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.emailVerifiedAt) throw AppError.badRequest(AUTH_MESSAGES.ALREADY_VERIFIED);
  await sendEmailVerification(user.id, user.email);
};

export const verifyEmail = async (token: string) => {
  const userId = await consumeToken(token, "EMAIL_VERIFY");
  await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // same response whether or not the account exists
  if (!user || user.deletedAt || user.status === "DISABLED") return;
  const token = await issueToken(user.id, "PASSWORD_RESET", AUTH.PASSWORD_RESET_TTL_MINUTES * 60_000);
  deliverLink(user.email, "Reset your password", `${env.appUrl}/reset-password?token=${token}`);
};

export const resetPassword = async (token: string, password: string) => {
  const userId = await consumeToken(token, "PASSWORD_RESET");
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 }, failedLoginAttempts: 0, lockUntil: null },
    }),
    prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  return userId;
};
