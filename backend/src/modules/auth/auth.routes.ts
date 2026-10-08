import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authLimiter } from "../../middleware/rateLimit";
import * as auth from "./auth.controller";

const router = Router();

router.post("/register-ngo", authLimiter, auth.registerNgo);
router.post("/login", authLimiter, auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.post("/forgot-password", authLimiter, auth.forgotPassword);
router.post("/reset-password", authLimiter, auth.resetPassword);
router.post("/verify-email", auth.verifyEmail);

router.get("/me", authenticate, auth.me);
router.post("/logout-all", authenticate, auth.logoutAll);
router.post("/resend-verification", authenticate, authLimiter, auth.resendVerification);

export default router;
