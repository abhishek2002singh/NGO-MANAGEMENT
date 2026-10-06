import { env } from "./config/env";
import { MESSAGES } from "./constants";
import { connectDatabase, disconnectDatabase } from "./config/database";
import app from "./server";

async function main(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
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
  console.error(MESSAGES.SERVER_START_FAILED, err);
  await disconnectDatabase();
  process.exit(1);
});
