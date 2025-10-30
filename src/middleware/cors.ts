import { NextFunction, Request, Response } from "express";

export function cors(options: { origin?: string | RegExp | ((o?: string) => boolean) } = {}) {
  return function corsMiddleware(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin ?? "*";
    const allow = (() => {
      if (!options.origin) return true;
      if (typeof options.origin === "string") return origin === options.origin;
      if (options.origin instanceof RegExp) return options.origin.test(String(origin));
      if (typeof options.origin === "function") return options.origin(String(origin));
      return false;
    })();

    if (allow) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] ?? "content-type");
      res.setHeader("Access-Control-Allow-Methods", req.headers["access-control-request-method"] ?? "GET,POST,PATCH,DELETE");
    }

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };
}


