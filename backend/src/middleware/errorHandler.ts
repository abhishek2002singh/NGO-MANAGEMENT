import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/apiResponse";
import { HTTP_STATUS, MESSAGES } from "../constants";

export const notFoundHandler = (_req: Request, res: Response) => {
  errorResponse(res, MESSAGES.ROUTE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
