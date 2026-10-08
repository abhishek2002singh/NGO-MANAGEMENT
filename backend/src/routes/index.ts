import { Router } from "express";
import { ROUTES } from "../constants";
import healthRoutes from "../modules/checkHealthAndBackendCondition/health.routes";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.use(ROUTES.HEALTH, healthRoutes);
router.use(ROUTES.AUTH, authRoutes);

export default router;
