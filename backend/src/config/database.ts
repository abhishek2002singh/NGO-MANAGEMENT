import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { MESSAGES } from "../constants";
import { logger } from "../utils/logger";

const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = new PrismaClient({ adapter });

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  logger.info(MESSAGES.DATABASE_CONNECTED);
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
