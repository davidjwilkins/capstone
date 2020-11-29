import {combineReducers} from '@reduxjs/toolkit';
import booksReducer from './books/booksSlice';
import toastsReducer from './toasts/toastsSlice';
import usersReducer from './users/usersSlice';
const rootReducer = combineReducers({
    booksReducer,
    toastsReducer,
    usersReducer
});
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;