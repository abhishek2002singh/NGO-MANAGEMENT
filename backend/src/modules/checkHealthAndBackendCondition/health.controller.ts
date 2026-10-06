import type { Request, Response } from "express";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { APP_VERSION, HTTP_STATUS, MESSAGES } from "../../constants";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import { formatDateTime, formatUptime } from "../../utils/format";
import { renderPage } from "../../views/layout";

const isDatabaseUp = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

export const getHealth = async (req: Request, res: Response) => {
  const dbUp = await isDatabaseUp();
  const uptime = formatUptime(process.uptime());
  const now = new Date();
  const timestamp = now.toISOString();

  // Browsers get a styled page; API clients (Postman, fetch, curl) get JSON.
  if (req.accepts(["json", "html"]) === "html") {
    res.status(dbUp ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).send(
      renderPage(
        "Health Check",
        dbUp ? MESSAGES.SERVER_HEALTHY : MESSAGES.DATABASE_DISCONNECTED,
        [
          { label: "Server", value: "Running", status: "ok" },
          { label: "Database", value: dbUp ? "Connected" : "Disconnected", status: dbUp ? "ok" : "error" },
          { label: "Uptime", value: uptime },
          { label: "Environment", value: env.nodeEnv },
          { label: "Version", value: APP_VERSION },
          { label: "Checked at", value: formatDateTime(now) },
        ],
        dbUp
      )
    );
    return;
  }

  if (!dbUp) {
    errorResponse(res, MESSAGES.DATABASE_DISCONNECTED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    return;
  }
  successResponse(res, MESSAGES.SERVER_HEALTHY, {
    database: "connected",
    uptime,
    environment: env.nodeEnv,
    version: APP_VERSION,
    timestamp,
  });
};
