import express, { Express, Request, Response } from "express";
import { booksRouter } from "./routes/books";
import { authorsRouter } from "./routes/authors";
import { requestLogger } from "./middleware/logger";
import { errorMiddleware } from "./middleware/error";
import { cors } from "./middleware/cors";
import { requestId } from "./middleware/requestId";
import { rateLimit } from "./middleware/rateLimit";

export async function startServer(port: number): Promise<{ app: Express; server: ReturnType<Express["listen"]>; port: number }>
{
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(requestId);
  app.use(cors());
  
  const rateLimitMax = process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100;
  const rateLimitWindow = process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : 60000;
  app.use(rateLimit({ maxRequests: rateLimitMax, windowMs: rateLimitWindow }));
  
  app.use(requestLogger);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true, service: "pr-desc-test-service" });
  });

  app.use("/api/books", booksRouter);
  app.use("/api/authors", authorsRouter);

  const server = await new Promise<ReturnType<Express["listen"]>>((resolve) => {
    const s = app.listen(port, () => resolve(s));
  });

  // Error middleware should be last
  app.use(errorMiddleware);

  const address = server.address();
  const actualPort = typeof address === "string" || !address ? port : address.port;
  console.log(`[server] listening on http://localhost:${actualPort}`);
  return { app, server, port: actualPort };
}


