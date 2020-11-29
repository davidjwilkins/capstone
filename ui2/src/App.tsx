import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Nav from './components/nav';
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from './app/rootReducer'
import {fetchBooks, setPage, setSearchTerm, search, fetchRecommendations, clearSelection} from './app/books/booksSlice';
import './App.css';
import BooksList from './components/book/list';
import Login from './components/login';
import PCA from './components/charts/pca';
import Dashboard from './components/dashboard';
import { login, register } from './app/users/usersSlice';

function App() {
  const dispatch = useDispatch();
  const { books, currentPage, isLoading, isSearching, searchTerm, recommendations, selectedTitle } = useSelector((state: RootState) => {
    console.log({state});
    return state.booksReducer
  });
  const { isLoggedIn, isLoggingIn, isRegistering } = useSelector((state: RootState) => state.usersReducer);

  useEffect(() => {
    if (searchTerm === '') {
      dispatch(fetchBooks(currentPage))
    } else {
      dispatch(search(searchTerm, 0))
    }
  }, [currentPage, searchTerm])
  return (
    <Router>
      <Nav/>
      <div className="app-content">
      <Switch>
        <Route path="/" exact>
          <BooksList
            searching={isSearching}
            loading={isLoading}
            page={currentPage}
            setPage={(page: number) => dispatch(setPage(page))}
            books={books}
            search={searchTerm}
            setSearch={(term: string) => dispatch(setSearchTerm(term))}
            fetchRecommendations={(title: string) => dispatch(fetchRecommendations(title))}
            recommendations={recommendations}
            selectedTitle={selectedTitle}
            clearSelection={() => dispatch(clearSelection())}
          />
        </Route>
        <Route path="/login" exact>
          <Login
            onLogin={(username, password) => dispatch(login(username, password))}
            onRegister={(username, password) => dispatch(register(username, password))}
            isLoggingIn={isLoggingIn}
            isRegistering={isRegistering}
          />
        </Route>
        <Route path="/pca" exact>
          <PCA />
        </Route>
        <Route path="/dashboard" exact>
          <Dashboard />
        </Route>
        <Redirect to='/' />
      </Switch>
      </div>
    </Router>
  );
}

export default App;
