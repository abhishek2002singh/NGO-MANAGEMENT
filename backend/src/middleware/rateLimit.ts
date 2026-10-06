import { rateLimit } from "express-rate-limit";
import { HTTP_STATUS, MESSAGES, RATE_LIMIT } from "../constants";

export const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: RATE_LIMIT.IPV6_SUBNET,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: { success: false, message: MESSAGES.TOO_MANY_REQUESTS },
});
