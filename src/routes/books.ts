import { Router, Request, Response, NextFunction } from "express";
import { authorStats, bookSchema, createBook, listBooks, removeBook, searchBooks, stats, updateBook } from "../services/libraryService";
import { AppError } from "../middleware/error";

export const booksRouter = Router();

booksRouter.get("/", (req: Request, res: Response) => {
  const { q, genre } = req.query as Record<string, string | undefined>;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const sort = (req.query.sort as any) as "title" | "year" | "rating" | undefined;
  const order = (req.query.order as any) as "asc" | "desc" | undefined;

  if (q || genre || limit !== undefined || offset !== undefined || sort || order) {
    const { items, total } = searchBooks({ q: q ?? undefined, genre: genre ?? undefined, limit, offset, sort, order });
    return res.json({ total, items });
  }
  res.json({ books: listBooks() });
});

booksRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  const parse = bookSchema.safeParse(req.body);
  if (!parse.success) {
    return next(new AppError(400, "Invalid request body", "validation_error", parse.error.flatten()));
  }
  try {
    const book = createBook(parse.data);
    res.status(201).json(book);
  } catch (e) {
    if (String(e).includes("Author not found")) return next(new AppError(404, "Author not found", "not_found"));
    next(e);
  }
});

booksRouter.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = updateBook(req.params.id, req.body ?? {});
    res.json(updated);
  } catch (e) {
    next(new AppError(404, "Book not found", "not_found"));
  }
});

booksRouter.delete("/:id", (req: Request, res: Response) => {
  const ok = removeBook(req.params.id);
  res.json({ ok });
});

booksRouter.get("/stats/library", (_req: Request, res: Response) => {
  res.json(stats());
});

booksRouter.get("/stats/author/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(authorStats(req.params.id));
  } catch (e) {
    next(new AppError(404, "Author not found", "not_found"));
  }
});


