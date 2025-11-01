import { Review } from "../models";
import { z } from "zod";
import { getBook, persistReviews } from "./libraryService";

// In-memory store (will be persisted via libraryService's storage)
let reviews: Review[] = [];

export const reviewSchema = z.object({
  bookId: z.string().min(1),
  reviewerName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export async function createReview(input: z.infer<typeof reviewSchema>): Promise<Review> {
  if (!getBook(input.bookId)) {
    throw new Error("Book not found");
  }

  const id = crypto.randomUUID();
  const review: Review = {
    id,
    ...input,
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  await persistReviews();
  return review;
}

export function getReviewsByBook(bookId: string): Review[] {
  return reviews.filter((r) => r.bookId === bookId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAllReviews(): Review[] {
  return [...reviews];
}

export function getReview(id: string): Review | undefined {
  return reviews.find((r) => r.id === id);
}

export async function deleteReview(id: string): Promise<boolean> {
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  reviews.splice(idx, 1);
  await persistReviews();
  return true;
}

export function getReviewsSnapshot(): Review[] {
  return [...reviews];
}

export function setReviewsSnapshot(reviewsSnapshot: Review[]): void {
  reviews = [...reviewsSnapshot];
}

export function calculateAverageRating(bookId: string): number | undefined {
  const bookReviews = getReviewsByBook(bookId);
  if (bookReviews.length === 0) return undefined;
  
  const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / bookReviews.length) * 100) / 100;
}

