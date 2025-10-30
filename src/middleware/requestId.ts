import { NextFunction, Request, Response } from "express";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers["x-request-id"] as string | undefined;
  const id = incoming && incoming.length > 0 ? incoming : crypto.randomUUID();
  (req as any).requestId = id;
  res.setHeader("x-request-id", id);
  next();
}


