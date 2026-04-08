import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log full error internally — never sent to client
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  const status = err.status || 500;
  const message = err.status
    ? err.message                          // Known operational error — safe to expose
    : 'An unexpected error occurred';      // Unknown error — hide internals

  res.status(status).json({ message });
}