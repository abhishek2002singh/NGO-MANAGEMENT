import { Router } from "express";
import { ROUTES } from "../constants";
import healthRoutes from "../modules/checkHealthAndBackendCondition/health.routes";

const router = Router();

router.use(ROUTES.HEALTH, healthRoutes);

export default router;
