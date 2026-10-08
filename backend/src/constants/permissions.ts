// Permission strings are "module:action". Code checks these, never role names.
// Wildcards: "donor:*" covers every donor action, "*" covers everything.

const crud = <M extends string>(m: M) =>
  ({
    READ: `${m}:read`,
    CREATE: `${m}:create`,
    UPDATE: `${m}:update`,
    DELETE: `${m}:delete`,
  }) as const;

export const PERMISSIONS = {
  ALL: "*",

  // ----- tenant (NGO) -----
  ORG: { READ: "org:read", UPDATE: "org:update" },
  MEMBER: { ...crud("member"), INVITE: "member:invite" },
  ROLE: crud("role"),
  DEPARTMENT: crud("department"),
  BRANCH: crud("branch"),
  BILLING: { READ: "billing:read", MANAGE: "billing:manage" },
  AUDIT: { READ: "audit:read" },

  DONOR: { ...crud("donor"), EXPORT: "donor:export" },
  DONATION: { ...crud("donation"), REFUND: "donation:refund" },
  RECEIPT: { READ: "receipt:read", ISSUE: "receipt:issue", CANCEL: "receipt:cancel" },
  CAMPAIGN: crud("campaign"),
  PROJECT: crud("project"),
  BENEFICIARY: crud("beneficiary"),
  VOLUNTEER: { ...crud("volunteer"), APPROVE: "volunteer:approve" },
  EVENT: crud("event"),
  FINANCE: { READ: "finance:read", WRITE: "finance:write", APPROVE: "finance:approve" },
  GRANT: crud("grant"),
  EMPLOYEE: crud("employee"),
  PAYROLL: { READ: "payroll:read", RUN: "payroll:run" },
  INVENTORY: crud("inventory"),
  REPORT: { READ: "report:read", EXPORT: "report:export" },

  // ----- platform (our company) -----
  PLATFORM: {
    DASHBOARD: "platform:dashboard",
    NGO_READ: "platform:ngo:read",
    NGO_MANAGE: "platform:ngo:manage",
    PLAN_MANAGE: "platform:plan:manage",
    SUBSCRIPTION_MANAGE: "platform:subscription:manage",
    BILLING_READ: "platform:billing:read",
    STAFF_MANAGE: "platform:staff:manage",
    SUPPORT: "platform:support",
    AUDIT_READ: "platform:audit:read",
    SETTINGS: "platform:settings",
  },
} as const;

type Leaves<T> = T extends string ? T : { [K in keyof T]: Leaves<T[K]> }[keyof T];
export type Permission = Leaves<typeof PERMISSIONS>;

export const hasPermission = (granted: Iterable<string>, required: string): boolean => {
  for (const p of granted) {
    if (p === "*" || p === required) return true;
    if (p.endsWith(":*") && required.startsWith(p.slice(0, -1))) return true;
  }
  return false;
};
