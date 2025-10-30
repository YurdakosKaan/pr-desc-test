import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code, details: err.details } });
  }
  // Basic fallback
  const message = err instanceof Error ? err.message : "Unexpected error";
  return res.status(500).json({ error: { message, code: "internal_error" } });
}


