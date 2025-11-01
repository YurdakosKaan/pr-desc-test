export type Author = {
  id: string;
  name: string;
  country?: string;
};

export type Book = {
  id: string;
  title: string;
  authorId: string;
  year?: number;
  genres: string[];
  rating?: number; // 1..5
};

export type Review = {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string; // ISO timestamp
};

export type LibrarySnapshot = {
  authors: Author[];
  books: Book[];
  reviews: Review[];
};


