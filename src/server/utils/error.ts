/**
 * Domain error codes used across the JuruScope backend.
 * Route handlers translate these into HTTP responses.
 */
export type DomainErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "PLAN_NOT_FOUND"
  | "PLAN_NOT_READY"
  | "PLAN_DATA_INCOMPLETE"
  | "ORDER_NOT_FOUND"
  | "PAYMENT_NOT_PAID"
  | "PDF_NOT_READY"
  | "INVALID_SIGNATURE"
  | "INVALID_PACKAGE"
  | "INVALID_TEMPLATE"
  | "INNGEST_NOT_CONFIGURED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  code: DomainErrorCode;
  status: number;
  details?: unknown;

  constructor(
    code: DomainErrorCode,
    message?: string,
    status = 500,
    details?: unknown
  ) {
    super(message ?? code);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function statusFromErrorMessage(msg: string): number {
  switch (msg) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "RATE_LIMITED":
      return 429;
    case "VALIDATION_ERROR":
      return 422;
    case "NOT_FOUND":
    case "PLAN_NOT_FOUND":
    case "ORDER_NOT_FOUND":
    case "PDF_NOT_READY":
      return 404;
    case "INVALID_SIGNATURE":
      return 401;
    case "PLAN_NOT_READY":
    case "PLAN_DATA_INCOMPLETE":
    case "INVALID_PACKAGE":
    case "INVALID_TEMPLATE":
    case "PAYMENT_NOT_PAID":
      return 400;
    default:
      return 500;
  }
}
