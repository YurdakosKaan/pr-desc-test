import { LibrarySnapshot } from "../models";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { readFile, writeFile } from "node:fs/promises";

const DEFAULT_PATH = "data/library.json";

export class FileStorage {
  private path: string;
  private snapshot: LibrarySnapshot;

  constructor(path: string = DEFAULT_PATH) {
    this.path = path;
    this.snapshot = { authors: [], books: [] };
  }

  async load(): Promise<LibrarySnapshot> {
    try {
      if (!existsSync(this.path)) {
        await this.ensureDirectory();
        await this.save(this.snapshot);
        return this.snapshot;
      }
      const content = await readFile(this.path, "utf-8");
      this.snapshot = JSON.parse(content) as LibrarySnapshot;
      return this.snapshot;
    } catch (err) {
      console.warn(`[storage] failed to load ${this.path}, using empty snapshot:`, err);
      return this.snapshot;
    }
  }

  async save(snapshot: LibrarySnapshot): Promise<void> {
    try {
      await this.ensureDirectory();
      await writeFile(this.path, JSON.stringify(snapshot, null, 2), "utf-8");
      this.snapshot = snapshot;
    } catch (err) {
      console.error(`[storage] failed to save ${this.path}:`, err);
      throw err;
    }
  }

  getSnapshot(): LibrarySnapshot {
    return { ...this.snapshot };
  }

  private async ensureDirectory(): Promise<void> {
    const dir = this.path.substring(0, this.path.lastIndexOf("/"));
    if (dir && !existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

