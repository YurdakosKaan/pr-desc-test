import { startServer } from "./server";

const portFromEnv = process.env.PORT ? Number(process.env.PORT) : 3000;

startServer(portFromEnv).then(({ app, server }) => {
  app.set("x-started-at", new Date().toISOString());
  // Intentionally keep a reference so Bun does not exit immediately
  void server;
}).catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});


