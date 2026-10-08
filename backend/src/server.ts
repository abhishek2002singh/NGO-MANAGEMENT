import express from "express";
import cookieParser from "cookie-parser";
import "./types/express";
import { corsMiddleware } from "./middleware/cors";
import { securityHeaders } from "./middleware/security";
import { requestLogger } from "./middleware/requestLogger";
import { limiter } from "./middleware/rateLimit";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { getHome } from "./modules/checkHealthAndBackendCondition/home.controller";
import apiRoutes from "./routes";
import { API_PREFIX, JSON_BODY_LIMIT, ROUTES } from "./constants";

const app = express();

app.disable("x-powered-by");
// behind a proxy (nginx, render, etc.) so req.ip is the real client ip
app.set("trust proxy", 1);

app.use(requestLogger);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
app.use(cookieParser());
app.use(limiter);

app.get(ROUTES.HOME, getHome);
app.use(API_PREFIX, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
