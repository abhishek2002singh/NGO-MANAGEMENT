import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string | undefined;
  organizationId?: string | null | undefined;
  actorUserId?: string | null | undefined;
  before?: unknown;
  after?: unknown;
}

const toJson = (value: unknown) => (value === undefined ? undefined : (value as Prisma.InputJsonValue));

// Audit failures are logged but never break the request that triggered them.
export const audit = async (req: Request, entry: AuditEntry): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        organizationId: entry.organizationId ?? null,
        actorUserId: entry.actorUserId ?? req.user?.id ?? null,
        before: toJson(entry.before),
        after: toJson(entry.after),
        ip: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
      },
    });
  } catch (err) {
    req.log.error({ err, entry }, "Failed to write audit log");
  }
};
