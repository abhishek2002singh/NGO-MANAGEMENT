// Safe to run more than once: everything is upserted.
// npm run prisma:seed
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { ENV_FILES, NODE_ENVS } from "../src/constants";
import { ROLE_KEYS, SYSTEM_ROLES } from "../src/constants/roles";
import { DEFAULT_PLANS } from "../src/constants/plans";
import { hashPassword } from "../src/utils/password";

dotenv.config({
  path: process.env["NODE_ENV"] === NODE_ENVS.PRODUCTION ? ENV_FILES.PRODUCTION : ENV_FILES.DEVELOPMENT,
  quiet: true,
});

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"] }) });

const PLATFORM_SLUG = "platform";

async function seedRoles() {
  for (const role of SYSTEM_ROLES) {
    // organizationId is null for system roles, and NULLs don't collide in the unique index,
    // so look it up by hand instead of using upsert
    const existing = await prisma.role.findFirst({ where: { organizationId: null, key: role.key } });
    const data = { name: role.name, scope: role.scope, permissions: role.permissions, isSystem: true };
    if (existing) await prisma.role.update({ where: { id: existing.id }, data });
    else await prisma.role.create({ data: { ...data, key: role.key } });
  }
  console.log(`roles: ${SYSTEM_ROLES.length}`);
}

async function seedPlans() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({ where: { code: plan.code }, update: plan, create: plan });
  }
  console.log(`plans: ${DEFAULT_PLANS.length}`);
}

async function seedPlatform() {
  const org = await prisma.organization.upsert({
    where: { slug: PLATFORM_SLUG },
    update: {},
    create: { type: "PLATFORM", name: "NGO Management Platform", slug: PLATFORM_SLUG, status: "ACTIVE", verifiedAt: new Date() },
  });

  const email = process.env["SEED_SUPER_ADMIN_EMAIL"];
  const password = process.env["SEED_SUPER_ADMIN_PASSWORD"];
  if (!email || !password) {
    console.log("SEED_SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD not set, skipping super admin");
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: {
      name: "Super Admin",
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      emailVerifiedAt: new Date(),
    },
  });

  const member = await prisma.organizationMember.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: { userId: user.id, organizationId: org.id, status: "ACTIVE", joinedAt: new Date() },
  });

  const role = await prisma.role.findFirstOrThrow({ where: { organizationId: null, key: ROLE_KEYS.SUPER_ADMIN } });
  await prisma.memberRole.upsert({
    where: { memberId_roleId: { memberId: member.id, roleId: role.id } },
    update: {},
    create: { memberId: member.id, roleId: role.id },
  });
  console.log(`super admin: ${user.email}`);
}

async function main() {
  await seedRoles();
  await seedPlans();
  await seedPlatform();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
