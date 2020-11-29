import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import actions from "../../http/actions";
import {AppThunk} from "../store";
import { createErrorToast, createSuccessToast } from '../toasts/toastsSlice';
import {Book} from "../../types";
interface BooksState {
    isLoading: boolean;
    isSearching: boolean;
    searchTerm: string;
    currentPage: number;
    selectedTitle: string;
    books: Book[];
    booksByID: Record<number, Book>;
    error: string|null;
    recommendations: Record<string, Book[]>;
    isLoadingRecommendations: Record<string, boolean>;
    isCreating: boolean;
    isRating: boolean;
}

const booksInitialState: BooksState = {
    isLoading: false,
    isSearching: false,
    searchTerm: '',
    selectedTitle: '',
    currentPage: 0,
    books: [],
    booksByID: {},
    error: null,
    recommendations: {},
    isLoadingRecommendations: {},
    isCreating: false,
    isRating: false
};

function startCreatingBook(state: BooksState) {
  state.isCreating = true;
}

function creatingBookFailed(state: BooksState, action: PayloadAction<{error: string}>) {
  state.isCreating = false;
  state.error = action.payload.error;
}

function startRatingBook(state: BooksState) {
  state.isRating = true;
}

function ratingBookFailed(state: BooksState, action: PayloadAction<{error: string}>) {
  state.isRating = false;
  state.error = action.payload.error;
}

function startLoadingBooks(state: BooksState) {
  state.isLoading = true;
}

function startLoadingRecommendations(state: BooksState, action: PayloadAction<{title: string}>) {
  state.isLoadingRecommendations[action.payload.title] = true;
  state.selectedTitle = action.payload.title;
}

function loadingRecommendationsFailed(state: BooksState, action: PayloadAction<{title: string, error: string}>) {
  state.isLoadingRecommendations[action.payload.title] = false;
  state.error = action.payload.error;
  state.selectedTitle = '';
}

function startSearchingBooks(state: BooksState) {
  state.isSearching = true;
  state.currentPage = 0;
  state.books = [];
  state.booksByID = {};
}

function loadingBooksFailed(state: BooksState, action: PayloadAction<{error: string}>) {
    state.isLoading = false;
    state.error = action.payload.error
}

function searchingBooksFailed(state: BooksState, action: PayloadAction<{error: string}>) {
  state.isLoading = false;
  state.error = action.payload.error;
}

const books = createSlice({
    initialState: booksInitialState,
    name: 'books',
    reducers: {
        setCurrentPage(state: BooksState, {payload}: PayloadAction<number>) {
          state.currentPage = payload;
        },
        setSearchTerm(state: BooksState, {payload}: PayloadAction<string>) {
          state.searchTerm = payload;
          if (payload === '') {
            state.books = [];
            state.booksByID = {};
          }
        },
        clearSelectedTitle(state: BooksState) {
          state.selectedTitle = '';
        },
        loadRecommendationsStart: startLoadingRecommendations,
        loadRecommendationsFailure: loadingRecommendationsFailed,
        loadRecommendationsSuccess(state: BooksState, {payload}: PayloadAction<{title: string, books: Book[]}>) {
          state.error = null;
          state.isLoadingRecommendations[payload.title] = false;
          state.recommendations[payload.title] = payload.books;
        },
        getBooksStart: startLoadingBooks,
        getBooksFailure: loadingBooksFailed,
        getBooksSuccess(state: BooksState, {payload}: PayloadAction<{books: Book[], page: number}>) {
            state.error = null;
            state.isLoading = false;
            const allBooks = [...state.books];
            payload.books.forEach((book) => {
              if (!state.booksByID[book.id]) {
                allBooks.push(book);
              }
            })
            state.books = allBooks;
            state.booksByID = state.books.reduce((carry, book) => {
              carry[book.id] = book;
              return carry;
            }, state.booksByID);
            if (payload.page > state.currentPage) {
              state.currentPage = payload.page;
            }
        },
        createBookStart: startCreatingBook,
        createBookFailure: creatingBookFailed,
        createBookSuccess(state: BooksState, {payload}: PayloadAction<{book: Book}>) {
          state.error = null;
          state.isCreating = false;
          const allBooks = [...state.books];
          allBooks.push(payload.book);
          state.books = allBooks;
          state.booksByID = state.books.reduce((carry, book) => {
            carry[book.id] = book;
            return carry;
          }, state.booksByID);
        },
        rateBookStart: startRatingBook,
        rateBookFailure: ratingBookFailed,
        rateBookSuccess(state: BooksState, {payload}: PayloadAction<{book_id: number, rating: number}>) {
          state.error = null;
          state.isRating = false;
        },
        searchBooksStart: startSearchingBooks,
        searchBooksFailure: searchingBooksFailed,
        searchBooksSuccess(state: BooksState, {payload}: PayloadAction<{books: Book[], page: number}>) {
          state.error = null;
          state.isSearching = false;
          const allBooks = [...state.books];
          payload.books.forEach((book) => {
            if (!state.booksByID[book.id]) {
              allBooks.push(book);
            }
          })
          state.books = allBooks;
          state.booksByID = state.books.reduce((carry, book) => {
            carry[book.id] = book;
            return carry;
          }, state.booksByID);
          if (payload.page > state.currentPage) {
            state.currentPage = payload.page;
          }
      },
    }
});

export const {
    loadRecommendationsStart,
    loadRecommendationsFailure,
    loadRecommendationsSuccess,
    getBooksStart,
    getBooksFailure,
    getBooksSuccess,
    setCurrentPage,
    setSearchTerm,
    searchBooksStart,
    searchBooksSuccess,
    searchBooksFailure,
    clearSelectedTitle,
    createBookStart,
    createBookFailure,
    createBookSuccess,
    rateBookStart,
    rateBookFailure,
    rateBookSuccess
} =  books.actions;

export default books.reducer;

export const fetchBooks = (page: number = 0): AppThunk => async dispatch => {
  console.log('fetchBooks');
  console.log({page});
    try {
        dispatch(getBooksStart());
        const books = await actions.getBooks(page);
        return dispatch(getBooksSuccess({books, page}));
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not fetch books"
        }));
        return dispatch(getBooksFailure({error: err.toString()}))
    }
};

export const clearSelection = (): AppThunk => async dispatch => {
  dispatch(clearSelectedTitle());
}
export const fetchRecommendations = (title: string): AppThunk => async (dispatch, state) => {
  console.log('fetchRecommendations: ' + title);
    try {
        dispatch(loadRecommendationsStart({title}));
        if (!state().booksReducer.recommendations[title]) {
          const books = await actions.getRecommendations(title);
          return dispatch(loadRecommendationsSuccess({title, books}));
        }
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not fetch recommendations"
        }));
        return dispatch(loadRecommendationsFailure({title, error: err.toString()}))
    }
};

export const setPage = (page: number = 0): AppThunk => async dispatch => {
  console.log('setPage');
  console.log({page});
  dispatch(setCurrentPage(page));
};

let searchDebounce: NodeJS.Timeout;
export const search = (searchTerm: string, page: number = 0): AppThunk => async dispatch => {
  console.log('search');
  console.log({searchTerm});
  dispatch(setSearchTerm(searchTerm));
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(async () => {
    try {
      dispatch(searchBooksStart())
      const books = await actions.searchBooks(searchTerm, page);
      return dispatch(searchBooksSuccess({books, page}))
    } catch (err) {
      dispatch(createErrorToast({
          message: err.toString() || "Could not fetch books"
      }));
      return dispatch(getBooksFailure({error: err.toString()}))
  }
  }, 750);
};

export const rateBook = (book_id: number, rating: number, user_id?: number): AppThunk => async dispatch => {
  console.log('rateBook');
  console.log({book_id, rating, user_id});
    try {
        dispatch(rateBookStart());
        const books = await actions.createRating({book_id, rating, user_id});
        return dispatch(rateBookSuccess({book_id, rating}));
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not rate book"
        }));
        return dispatch(rateBookFailure({error: err.toString()}))
    }
};

export const createBook = (newBook: Omit<Book, 'id'>): AppThunk => async dispatch => {
  console.log('createBook');
  console.log({book: newBook});
    try {
        dispatch(createBookStart());
        const book = await actions.createBook(newBook);
        return dispatch(createBookSuccess({book}));
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not create book"
        }));
        return dispatch(createBookFailure({error: err.toString()}))
    }
};