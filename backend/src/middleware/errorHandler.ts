import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/appError";
import { errorResponse } from "../utils/apiResponse";
import { HTTP_STATUS, MESSAGES } from "../constants";

export const notFoundHandler = (_req: Request, res: Response) => {
  errorResponse(res, MESSAGES.ROUTE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
    return errorResponse(res, MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, details);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return errorResponse(res, MESSAGES.DUPLICATE_RECORD, HTTP_STATUS.CONFLICT);
    if (err.code === "P2025") return errorResponse(res, MESSAGES.RECORD_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  // malformed JSON body from express.json()
  if (err instanceof SyntaxError && "body" in err) {
    return errorResponse(res, MESSAGES.INVALID_JSON, HTTP_STATUS.BAD_REQUEST);
  }

  // errors from express/body-parser (e.g. 413 payload too large) carry their own 4xx status
  const status = (err as { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    return errorResponse(res, err.message, status);
  }

  req.log.error({ err }, "Unhandled error");
  errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
