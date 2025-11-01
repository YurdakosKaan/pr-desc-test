import { Author, Book, LibrarySnapshot } from "../models";
import { computeAuthorStats, computeLibraryStats } from "../utils/stats";
import { z } from "zod";
import { FileStorage } from "../storage/fileStorage";

// File-backed storage. Loaded on initialization.
let storage: FileStorage;
let authors: Author[] = [];
let books: Book[] = [];

export async function initializeStorage(path?: string): Promise<void> {
  storage = new FileStorage(path);
  const snapshot = await storage.load();
  authors = snapshot.authors;
  books = snapshot.books;
}

async function persist(): Promise<void> {
  if (!storage) return;
  await storage.save({ authors: [...authors], books: [...books] });
}

export const authorSchema = z.object({
  name: z.string().min(2),
  country: z.string().optional()
});

export const bookSchema = z.object({
  title: z.string().min(1),
  authorId: z.string().min(1),
  year: z.number().int().min(0).max(new Date().getFullYear()).optional(),
  genres: z.array(z.string()).default([]),
  rating: z.number().min(1).max(5).optional()
});

export async function createAuthor(input: z.infer<typeof authorSchema>): Promise<Author> {
  const id = crypto.randomUUID();
  const author: Author = { id, ...input };
  authors.push(author);
  await persist();
  return author;
}

export function listAuthors(): Author[] {
  return [...authors];
}

export function getAuthor(id: string): Author | undefined {
  return authors.find(a => a.id === id);
}

export async function createBook(input: z.infer<typeof bookSchema>): Promise<Book> {
  if (!getAuthor(input.authorId)) {
    throw new Error("Author not found");
  }
  const id = crypto.randomUUID();
  const book: Book = { id, ...input, genres: input.genres ?? [] };
  books.push(book);
  await persist();
  return book;
}

export function listBooks(): Book[] {
  return [...books];
}

export type BookSearchParams = {
  q?: string;
  genre?: string;
  limit?: number;
  offset?: number;
  sort?: "title" | "year" | "rating";
  order?: "asc" | "desc";
};

export function searchBooks(params: BookSearchParams): { items: Book[]; total: number } {
  const { q, genre, limit = 20, offset = 0, sort = "title", order = "asc" } = params;

  let result = listBooks();
  if (q && q.trim() !== "") {
    const needle = q.toLowerCase();
    result = result.filter(b => b.title.toLowerCase().includes(needle));
  }
  if (genre && genre.trim() !== "") {
    result = result.filter(b => b.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  }

  const dir = order === "desc" ? -1 : 1;
  result = result.sort((a, b) => {
    const av = (a as any)[sort] ?? 0;
    const bv = (b as any)[sort] ?? 0;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  const total = result.length;
  const items = result.slice(offset, offset + limit);
  return { items, total };
}

export async function updateBook(id: string, update: Partial<Book>): Promise<Book> {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) throw new Error("Book not found");
  const updated: Book = { ...books[idx], ...update };
  books[idx] = updated;
  await persist();
  return updated;
}

export async function removeBook(id: string): Promise<boolean> {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return false;
  books.splice(idx, 1);
  await persist();
  return true;
}

export function snapshot(): LibrarySnapshot {
  return { authors: listAuthors(), books: listBooks() };
}

export function stats() {
  return computeLibraryStats(snapshot());
}

export function authorStats(authorId: string) {
  const author = getAuthor(authorId);
  if (!author) throw new Error("Author not found");
  return computeAuthorStats(author, books.filter(b => b.authorId === authorId));
}


