import { Router, Request, Response, NextFunction } from "express";
import { createReview, deleteReview, getReviewsByBook, reviewSchema } from "../services/reviewService";
import { AppError } from "../middleware/error";

export const reviewsRouter = Router();

reviewsRouter.get("/book/:bookId", (req: Request, res: Response) => {
  const reviews = getReviewsByBook(req.params.bookId);
  res.json({ reviews });
});

reviewsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const parse = reviewSchema.safeParse(req.body);
  if (!parse.success) {
    return next(new AppError(400, "Invalid request body", "validation_error", parse.error.flatten()));
  }
  try {
    const review = await createReview(parse.data);
    res.status(201).json(review);
  } catch (e) {
    if (String(e).includes("Book not found")) {
      return next(new AppError(404, "Book not found", "not_found"));
    }
    next(e);
  }
});

reviewsRouter.delete("/:id", async (req: Request, res: Response) => {
  const ok = await deleteReview(req.params.id);
  res.json({ ok });
});

