import type { Request, Response } from "express";
import { env } from "../../config/env";
import { API_PREFIX, APP_NAME, APP_VERSION, MESSAGES, ROUTES } from "../../constants";
import { renderPage } from "../../views/layout";

export const getHome = (_req: Request, res: Response) => {
  const healthUrl = `${API_PREFIX}${ROUTES.HEALTH}`;

  res.send(
    renderPage(APP_NAME, MESSAGES.WELCOME, [
      { label: "Version", value: APP_VERSION },
      { label: "Environment", value: env.nodeEnv },
      { label: "Health check", value: `<a href="${healthUrl}">${healthUrl}</a>` },
    ])
  );
};
