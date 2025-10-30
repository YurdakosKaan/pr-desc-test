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

export type LibrarySnapshot = {
  authors: Author[];
  books: Book[];
};


