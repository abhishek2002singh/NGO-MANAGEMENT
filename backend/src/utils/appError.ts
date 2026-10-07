import { HTTP_STATUS } from "../constants";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string | undefined;
  readonly details: unknown;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, "BAD_REQUEST", details);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
  }

  static forbidden(message: string = "Forbidden") {
    return new AppError(message, HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
  }

  static notFound(message: string = "Not found") {
    return new AppError(message, HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new AppError(message, HTTP_STATUS.CONFLICT, "CONFLICT");
  }
}
