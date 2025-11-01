import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { average, topN } from "../src/utils/stats";
import { createAuthor, createBook, initializeStorage, searchBooks, stats } from "../src/services/libraryService";
import { rm } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("utils/stats", () => {
  it("computes average with rounding", () => {
    expect(average([1, 2, 3])).toBe(2);
    expect(average([4, 5])).toBe(4.5);
    expect(average([])).toBeUndefined();
  });

  it("topN sorts and slices", () => {
    const items = [{ v: 1 }, { v: 3 }, { v: 2 }];
    const top = topN(items, 2, i => i.v);
    expect(top.map(i => i.v)).toEqual([3, 2]);
  });
});

describe("library service", () => {
  const testStoragePath = "data/test-library.json";

  beforeAll(async () => {
    await initializeStorage(testStoragePath);
  });

  afterAll(async () => {
    if (existsSync(testStoragePath)) {
      await rm(testStoragePath, { force: true });
    }
  });

  it("creates authors, books and computes stats", async () => {
    const a1 = await createAuthor({ name: "Alice" });
    const a2 = await createAuthor({ name: "Bob" });
    await createBook({ title: "A", authorId: a1.id, genres: ["sci-fi"], rating: 5 });
    await createBook({ title: "B", authorId: a1.id, genres: ["sci-fi"], rating: 4, year: 2020 });
    await createBook({ title: "C", authorId: a2.id, genres: ["fantasy"], rating: 3, year: 2019 });

    const s = stats();
    expect(s.totals.books).toBe(3);
    expect(s.totals.authors).toBe(2);
    expect(s.genres[0].genre).toBe("sci-fi");
  });

  it("searches by title, filters by genre, paginates and sorts", () => {
    const byQ = searchBooks({ q: "b" });
    expect(byQ.items.length).toBe(1);
    expect(byQ.items[0].title).toBe("B");

    const byGenre = searchBooks({ genre: "fantasy" });
    expect(byGenre.items.length).toBe(1);
    expect(byGenre.items[0].title).toBe("C");

    const sorted = searchBooks({ sort: "year", order: "desc" });
    expect(sorted.items[0].title).toBe("B");

    const paged = searchBooks({ limit: 1, offset: 1, sort: "title" });
    expect(paged.total).toBeGreaterThanOrEqual(3);
    expect(paged.items.length).toBe(1);
  });

  it("persists data across storage reloads", async () => {
    const a = await createAuthor({ name: "Test Author" });
    const b = await createBook({ title: "Test Book", authorId: a.id, genres: ["test"] });
    expect(b.title).toBe("Test Book");

    // Reload storage
    await initializeStorage(testStoragePath);
    const authors = stats().totals.authors;
    const books = stats().totals.books;
    expect(authors).toBeGreaterThanOrEqual(1);
    expect(books).toBeGreaterThanOrEqual(1);
  });
});


