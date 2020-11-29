export interface Book {
  id: number;
  authors: string[];
  publicationYear: number;
  title: string;
  originalTitle: string;
  averageRating: number;
  imageUrl: string;
}

export interface User {
  id: number;
  username: string;
}