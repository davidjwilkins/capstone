import React, { useState, useEffect } from 'react';
import { Book, User } from '../../types';
import './style.scss';
import { Button, Card, FormGroup, InputGroup, Menu, MenuItem } from "@blueprintjs/core";
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from '../../app/rootReducer'
import {createBook, rateBook} from '../../app/books/booksSlice';
import {loadUsers} from '../../app/users/usersSlice';
import { ItemListRenderer, Select } from "@blueprintjs/select";

function className(c?: string) {
  return `components-dashboard${c ? `__${c}` : ''}`
}

function Dashboard() {
  const dispatch = useDispatch();
  const { error, isCreating, users, isLoading, isLoaded } = useSelector((state: RootState) => {
    return {error: state.usersReducer.error, isCreating: state.booksReducer.isCreating, users: state.usersReducer.users, isLoading: state.usersReducer.isLoading, isLoaded: state.usersReducer.isLoaded}
  });
  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>({
    title: '',
    originalTitle: '',
    authors: [],
    averageRating: 0,
    imageUrl: '',
    publicationYear: 0
  });
  const [newRating, setNewRating] = useState<{user_id?: number, book_id?: number, rating?: number}>({});
  const isValid = newBook.title && newBook.originalTitle && newBook.authors.length && newBook.imageUrl && newBook.publicationYear && newBook.averageRating >= 0 && newBook.averageRating <= 5.0;
  useEffect(() => {
    if (!error && !isLoaded && !isLoading) {
      dispatch(loadUsers());
    }
  }, [isLoaded, isLoading, loadUsers]);

  const UsersSelect = Select.ofType<User>();
  const renderMenu: ItemListRenderer<User> = ({ items, itemsParentRef, query, renderItem }) => {
    const renderedItems = items.map(renderItem).filter(item => item != null);
    return (
        <Menu ulRef={itemsParentRef}>
            <MenuItem
                disabled={true}
                text={`Found ${renderedItems.length} items matching "${query}"`}
            />
            {renderedItems}
        </Menu>
    );
  };
  return (
    <div className={className()}>
      <Card interactive={true}>
        <h5><a href="#">Create Book</a></h5>
        <FormGroup
          helperText="The title of the book"
          label="Title"
          labelFor="book-title"
          labelInfo="(required)"
        >
          <InputGroup
            id="book-title"
            placeholder="Title"
            value={newBook.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({
              ...newBook,
              title: e.target.value
            })}
          />
        </FormGroup>
        <FormGroup
          helperText="The original title of the book"
          label="Original Title"
          labelFor="book-original-title"
          labelInfo="(required)"
        >
          <InputGroup
            id="book-original-title"
            placeholder="Original Title"
            value={newBook.originalTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({
              ...newBook,
              originalTitle: e.target.value
            })}
          />
        </FormGroup>
        <FormGroup
          helperText="The authors of the book, comma separated"
          label="Authors"
          labelFor="book-authors"
          labelInfo="(required)"
        >
          <InputGroup
            id="book-authors"
            placeholder="Authors"
            value={newBook.authors.join(', ')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({
              ...newBook,
              authors: e.target.value.split(', ')
            })}
          />
        </FormGroup>
        <FormGroup
          helperText="The publication year of the book"
          label="Publication Year"
          labelFor="book-year"
          labelInfo="(required)"
        >
          <InputGroup
            id="book-year"
            placeholder="Year"
            type="number"
            value={'' + (newBook.publicationYear || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({
              ...newBook,
              publicationYear: parseInt(e.target.value)
            })}
          />
        </FormGroup>
        <FormGroup
          helperText="The image url of the book"
          label="Image URL"
          labelFor="book-image"
          labelInfo="(required)"
        >
          <InputGroup
            id="book-image"
            placeholder="Imange"
            type="url"
            value={newBook.imageUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({
              ...newBook,
              imageUrl: e.target.value
            })}
          />
        </FormGroup>
        <FormGroup
          helperText="The average rating of the book"
          label="Average Rating"
          labelFor="book-rating"
          labelInfo="(required)"
        >
          <InputGroup
            id="book-rating"
            placeholder="Average Rating"
            type="number"
            value={'' + (newBook.averageRating)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({
              ...newBook,
              averageRating: parseFloat(e.target.value)
            })}
          />
        </FormGroup>
        <Button
          onClick={() => dispatch(createBook(newBook))}
          disabled={!isValid || isCreating}
          loading={isCreating}
        >
          Submit
        </Button>
      </Card>
      <Card interactive={true}>
        <h5><a href="#">Create Rating</a></h5>
        <FormGroup
          helperText="The id of the book"
          label="Book ID"
          labelFor="rating-book"
          labelInfo="(required)"
        >
           <InputGroup
            id="rating-book"
            placeholder="Book ID"
            type="number"
            value={'' + (newRating.book_id || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRating({
              ...newRating,
              book_id: parseInt(e.target.value)
            })}
          />
        </FormGroup>
        <FormGroup
          helperText="The user who gave the rating"
          label="User"
          labelFor="rating-user"
          labelInfo="(required)"
        >
          <UsersSelect
            items={users}
            noResults={<MenuItem disabled={true} text="No results." />}
            className={isLoading ? 'bp3-skeleton' : ''}
            itemRenderer={(item) => {
              return <MenuItem
                  active={item.id === newRating.user_id}
                  key={item.id}
                  label={item.username}
                  onClick={() => setNewRating({
                    ...newRating,
                    user_id: item.id
                  })}
                  text={item.username}
              />
            }}
            onItemSelect={(item) => {
              setNewRating({
                ...newRating,
                user_id: item.id
              })
            }}
          >
            <Button text={users.find((u) => u.id === newRating.user_id) || 'Select a user'} rightIcon="double-caret-vertical" />
          </UsersSelect>
        </FormGroup>
        <FormGroup
          helperText="The rating of the book"
          label="Book Rating"
          labelFor="rating-rating"
          labelInfo="(required)"
        >
           <InputGroup
            id="rating-rating"
            placeholder="Book Rating"
            type="number"
            value={'' + (newRating.rating || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRating({
              ...newRating,
              rating: parseInt(e.target.value)
            })}
          />
        </FormGroup>
        <Button
          onClick={() => dispatch(rateBook(newRating.book_id!, newRating.rating!, newRating.user_id!))}
          disabled={!isValid || isCreating}
          loading={isCreating}
        >
          Submit
        </Button>
      </Card>
    </div>
    
  );
}

export default Dashboard;
