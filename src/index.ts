import { startServer } from "./server";
import { initializeStorage } from "./services/libraryService";

const portFromEnv = process.env.PORT ? Number(process.env.PORT) : 3000;
const storagePath = process.env.STORAGE_PATH;

(async () => {
  try {
    await initializeStorage(storagePath);
    const { app, server } = await startServer(portFromEnv);
    app.set("x-started-at", new Date().toISOString());
    // Intentionally keep a reference so Bun does not exit immediately
    void server;
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
})();


