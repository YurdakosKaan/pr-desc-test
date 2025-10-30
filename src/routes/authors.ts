import { Router, Request, Response } from "express";
import { authorSchema, createAuthor, getAuthor, listAuthors } from "../services/libraryService";

export const authorsRouter = Router();

authorsRouter.get("/", (_req: Request, res: Response) => {
  res.json({ authors: listAuthors() });
});

authorsRouter.get("/:id", (req: Request, res: Response) => {
  const author = getAuthor(req.params.id);
  if (!author) return res.status(404).json({ error: "not found" });
  res.json(author);
});

authorsRouter.post("/", (req: Request, res: Response) => {
  const parse = authorSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const author = createAuthor(parse.data);
  res.status(201).json(author);
});


