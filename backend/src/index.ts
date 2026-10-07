import { env } from "./config/env";
import { MESSAGES } from "./constants";
import { connectDatabase, disconnectDatabase } from "./config/database";
import app from "./server";
import { logger } from "./utils/logger";

async function main(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch(async (err) => {
  logger.fatal({ err }, MESSAGES.SERVER_START_FAILED);
  await disconnectDatabase();
  process.exit(1);
});
