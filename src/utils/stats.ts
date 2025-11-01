import { Author, Book, LibrarySnapshot } from "../models";

export function average(numbers: number[]): number | undefined {
  if (numbers.length === 0) return undefined;
  const total = numbers.reduce((a, b) => a + b, 0);
  return Math.round((total / numbers.length) * 100) / 100;
}

export function topN<T>(arr: T[], n: number, score: (t: T) => number): T[] {
  return [...arr].sort((a, b) => score(b) - score(a)).slice(0, n);
}

export function computeAuthorStats(author: Author, books: Book[]) {
  const ratings = books.map(b => b.rating ?? 0).filter(r => r > 0);
  const avgRating = average(ratings);
  return {
    author,
    booksCount: books.length,
    averageRating: avgRating,
    genres: Array.from(new Set(books.flatMap(b => b.genres))).sort()
  };
}

export function computeLibraryStats(snapshot: LibrarySnapshot) {
  const { authors, books } = snapshot;
  const byAuthor: Record<string, Book[]> = {};
  for (const book of books) {
    byAuthor[book.authorId] ??= [];
    byAuthor[book.authorId].push(book);
  }

  const authorStats = authors.map(a => computeAuthorStats(a, byAuthor[a.id] ?? []));
  const topAuthors = topN(authorStats, 3, s => s.averageRating ?? 0);

  const genreCounts = new Map<string, number>();
  for (const g of books.flatMap(b => b.genres)) {
    genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
  }

  return {
    totals: { 
      authors: authors.length, 
      books: books.length,
      reviews: snapshot.reviews?.length ?? 0
    },
    topAuthors,
    genres: Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({ genre, count }))
  };
}

export function computeBookStats(book: Book, reviews: any[]) {
  const bookReviews = reviews.filter(r => r.bookId === book.id);
  const avgRating = average(bookReviews.map(r => r.rating));
  return {
    book,
    reviewCount: bookReviews.length,
    averageRating: avgRating,
  };
}


