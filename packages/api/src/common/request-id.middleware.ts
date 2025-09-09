import type { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  let reqId = req.headers['x-request-id'] as string | undefined;
  if (!reqId) {
    try {
      reqId = (global as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    } catch {
      reqId = `${Date.now()}-${Math.random()}`;
    }
    req.headers['x-request-id'] = reqId;
  }
  res.setHeader('x-request-id', reqId as string);
  (req as any).requestId = reqId;
  next();
}
