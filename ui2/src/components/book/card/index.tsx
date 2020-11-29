import React from 'react';

import {
  Card,
  H5,
  Icon,
  Intent,
  Tooltip
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import Rating from 'react-rating';
import { Book } from '../../../types';
import './style.scss';

function style(c?: string) {
  return `components-book-card${c ? `__${c}` : ''}`
}

function BookCard({book, className, fetchRecommendations}: {book: Book, className?: string, fetchRecommendations: (title: string) => any}) {
  return (
    <div className={className}>
    <Card
      className={[style(), className].join(' ')}
      interactive
      title={book.originalTitle}
    >
      <img className={style('image')} src={book.imageUrl} />
      <div className={style('contnet')}>
        <H5><a href="#" onClick={() => fetchRecommendations(book.title)}>{book.title}</a></H5>
        <p className="bp3-text-muted">
          {book.authors.slice(0,3).join(', ')}&nbsp;
          {book.authors.length > 3 ? <Tooltip content={book.authors.slice(3).join(', ')}><abbr>et al</abbr></Tooltip> : null}</p>
        <p>{book.publicationYear}</p>
        <Rating
          readonly
          initialRating={book.averageRating}
          emptySymbol={<Icon icon={IconNames.STAR_EMPTY} color="#FFC940"/>}
          fullSymbol={<Icon icon={IconNames.STAR} color="#FFC940"/>}
        />
      </div>
    </Card>
    </div>
  );
}

export default BookCard;
