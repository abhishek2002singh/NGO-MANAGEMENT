import dotenv from "dotenv";
import { defineConfig } from "prisma/config";
import { ENV_FILES, NODE_ENVS } from "./src/constants";

dotenv.config({
  path: process.env["NODE_ENV"] === NODE_ENVS.PRODUCTION ? ENV_FILES.PRODUCTION : ENV_FILES.DEVELOPMENT,
  quiet: true,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
