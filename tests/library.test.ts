import { describe, expect, it } from "bun:test";
import { average, topN } from "../src/utils/stats";
import { createAuthor, createBook, searchBooks, stats } from "../src/services/libraryService";

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
  it("creates authors, books and computes stats", () => {
    const a1 = createAuthor({ name: "Alice" });
    const a2 = createAuthor({ name: "Bob" });
    createBook({ title: "A", authorId: a1.id, genres: ["sci-fi"], rating: 5 });
    createBook({ title: "B", authorId: a1.id, genres: ["sci-fi"], rating: 4, year: 2020 });
    createBook({ title: "C", authorId: a2.id, genres: ["fantasy"], rating: 3, year: 2019 });

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
});


