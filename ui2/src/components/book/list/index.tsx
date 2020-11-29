import React, { useState } from 'react';
import { Book } from '../../../types';
import './style.scss';
import BookCard from '../card';
import { Tooltip, InputGroup, Spinner, ButtonGroup, Button, Card, Overlay, H3 } from '@blueprintjs/core';

function className(c?: string) {
  return `components-book-list${c ? `__${c}` : ''}`
}

function BooksList({
  books,
  page,
  loading,
  searching,
  setPage,
  search,
  setSearch,
  fetchRecommendations,
  recommendations,
  selectedTitle,
  clearSelection
}: {
  books: Book[],
  loading: boolean,
  searching: boolean,
  page: number,
  setPage: (page: number) => any,
  setSearch: (term: string) => any,
  search: string,
  fetchRecommendations: (title: string) => any,
  recommendations: Record<string, Book[]>,
  selectedTitle: string,
  clearSelection: () => any
  }) {
  const maybeSpinner = searching ? <Spinner size={Spinner.SIZE_SMALL}/> : undefined;
  return (
    <div className={className()}>
      <Tooltip content="Filter by title or author">
          <InputGroup
              large
              leftIcon="filter"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Filter books..."
              rightElement={maybeSpinner}
              value={search}
          />
      </Tooltip>
      {!search.length && (
        <Tooltip content="Change page">
          <ButtonGroup large className={className('pageButtons')}>
            <Button icon="arrow-left" onClick={() => setPage(page - 1 >= 0 ? page - 1 : 0)} />
            <Button icon="arrow-right" onClick={() => setPage(page + 1)}/>
          </ButtonGroup>
        </Tooltip>
      )}
      {loading ? <Spinner /> : (
      <div
        className={className('list')}
      >
        {loading ? books.slice(0, 24).map((book, index) => 
          <BookCard
            key={index}
            className="bp3-skeleton"
            book={book}
            fetchRecommendations={(title) => {
              fetchRecommendations(title)
            }}
          />
        ) : books.slice(page * 24, (page + 1) * 24).map(book => <BookCard key={book.id} className={searching ? "bp3-skeleton" : ""} book={book} fetchRecommendations={fetchRecommendations}/>)}
      </div>
      )}
      <Overlay
        isOpen={selectedTitle !== ''}
        onClose={() => {
          console.log('closing...')
          clearSelection()
        }}
      >
         <div className={className('modal')}>
           <Card>
             <H3>Recommendations</H3>
            {(recommendations[selectedTitle] || []).map(book => <BookCard key={book.id} className={searching ? "bp3-skeleton" : ""} book={book} fetchRecommendations={fetchRecommendations}/>)}
          </Card>
        </div>
      </Overlay>
    </div>
    
  );
}

export default BooksList;
