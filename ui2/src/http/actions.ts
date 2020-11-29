import axios from 'axios';
import { Book, User } from "../types";

export default {
    async login(username: string, password: string): Promise<any> {
        const result = await axios.post<any>(`/login`, { username, password });
        return true;
    },
    async register(username: string, password: string): Promise<any> {
        const result = await axios.post<any>(`/register`, { username, password });
        return true;
    },
    async getBooks(page: number): Promise<Book[]> {
        const result = await axios.get<Book[]>(`/books.json?page=${page}`);
        return result.data;
    },
    async searchBooks(q: string, page: number): Promise<Book[]> {
        const result = await axios.get<Book[]>(`/books.json?page=${page}${q ? `&q=${q}` : ''}`);
        return result.data;
    },
    async createBook(book: Omit<Book, 'id'>): Promise<Book> {
        const result = await axios.post<Book>(`/books`, book);
        return result.data;
    },
    async getRecommendations(title: string): Promise<Book[]> {
        const result = await axios.get<Book[]>(`/book?title=${encodeURIComponent(title)}`);
        return result.data;
    },
    async createRating(rating: { book_id: number, rating: number, user_id?: number }): Promise<{ book_id: number, user_id: number, rating: number }> {
        const result = await axios.post<{ book_id: number, user_id: number, rating: number }>(`/ratings`, rating);
        return result.data;
    },
    async loadUsers(): Promise<User[]> {
        const result = await axios.get<User[]>(`/admin/users`);
        return result.data;
    },
}
