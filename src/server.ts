import express, { Express, Request, Response } from "express";
import { booksRouter } from "./routes/books";
import { authorsRouter } from "./routes/authors";

export async function startServer(port: number): Promise<{ app: Express; server: ReturnType<Express["listen"]> }>
{
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true, service: "pr-desc-test-service" });
  });

  app.use("/api/books", booksRouter);
  app.use("/api/authors", authorsRouter);

  const server = app.listen(port, () => {
    console.log(`[server] listening on http://localhost:${port}`);
  });

  return { app, server };
}


