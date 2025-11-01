import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { calculateAverageRating, createReview, deleteReview, getReviewsByBook } from "../src/services/reviewService";
import { createAuthor, createBook, initializeStorage } from "../src/services/libraryService";
import { rm } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("review service", () => {
  const testStoragePath = "data/test-reviews-library.json";

  beforeAll(async () => {
    await initializeStorage(testStoragePath);
  });

  afterAll(async () => {
    if (existsSync(testStoragePath)) {
      await rm(testStoragePath, { force: true });
    }
  });

  it("creates review for existing book", async () => {
    const author = await createAuthor({ name: "Test Author" });
    const book = await createBook({ title: "Test Book", authorId: author.id, genres: ["fiction"] });
    
    const review = await createReview({
      bookId: book.id,
      reviewerName: "John Doe",
      rating: 5,
      comment: "Great book!",
    });

    expect(review.id).toBeTruthy();
    expect(review.reviewerName).toBe("John Doe");
    expect(review.rating).toBe(5);
    expect(review.createdAt).toBeTruthy();
  });

  it("rejects review for non-existent book", async () => {
    await expect(createReview({
      bookId: "non-existent-id",
      reviewerName: "Jane Doe",
      rating: 3,
      comment: "Test",
    })).rejects.toThrow("Book not found");
  });

  it("gets reviews by book", async () => {
    const author = await createAuthor({ name: "Author 2" });
    const book = await createBook({ title: "Book 2", authorId: author.id, genres: ["sci-fi"] });

    const r1 = await createReview({
      bookId: book.id,
      reviewerName: "Reviewer 1",
      rating: 4,
      comment: "First review",
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const r2 = await createReview({
      bookId: book.id,
      reviewerName: "Reviewer 2",
      rating: 5,
      comment: "Second review",
    });

    const reviews = getReviewsByBook(book.id);
    expect(reviews.length).toBe(2);
    expect(reviews[0].id).toBe(r2.id); // Most recent first
    expect(new Date(reviews[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(reviews[1].createdAt).getTime());
  });

  it("calculates average rating", async () => {
    const author = await createAuthor({ name: "Author 3" });
    const book = await createBook({ title: "Book 3", authorId: author.id, genres: ["mystery"] });

    await createReview({
      bookId: book.id,
      reviewerName: "R1",
      rating: 4,
      comment: "Good",
    });

    await createReview({
      bookId: book.id,
      reviewerName: "R2",
      rating: 5,
      comment: "Great",
    });

    await createReview({
      bookId: book.id,
      reviewerName: "R3",
      rating: 3,
      comment: "Okay",
    });

    const avg = calculateAverageRating(book.id);
    expect(avg).toBe(4); // (4+5+3)/3 = 4
  });

  it("deletes review", async () => {
    const author = await createAuthor({ name: "Author 4" });
    const book = await createBook({ title: "Book 4", authorId: author.id, genres: ["thriller"] });

    const review = await createReview({
      bookId: book.id,
      reviewerName: "Delete Me",
      rating: 2,
      comment: "Will be deleted",
    });

    const deleted = await deleteReview(review.id);
    expect(deleted).toBe(true);

    const reviews = getReviewsByBook(book.id);
    expect(reviews.find(r => r.id === review.id)).toBeUndefined();
  });
});

