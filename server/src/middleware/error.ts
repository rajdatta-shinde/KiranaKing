import type { Request, Response, NextFunction } from "express";

/** 404 for unmatched routes. */
export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Not found - ${req.originalUrl}` });
}

/** Central error handler — keep it last in the middleware chain. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.statusCode || err.status || 500;
  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
}

/** Wrap an async handler so thrown/rejected errors reach errorHandler. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
