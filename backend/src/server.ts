import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { limiter } from "./middleware/rateLimit";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { getHome } from "./modules/checkHealthAndBackendCondition/home.controller";
import apiRoutes from "./routes";
import { API_PREFIX, ROUTES } from "./constants";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(limiter);

app.get(ROUTES.HOME, getHome);
app.use(API_PREFIX, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
