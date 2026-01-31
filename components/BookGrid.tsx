import React from 'react';
import { Book, Language } from '../types';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  language: Language;
}

export const BookGrid: React.FC<BookGridProps> = ({ books, onBookClick, language }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-slate-500 font-serif">{language === 'zh' ? '该栏目下暂无书籍。' : 'No books found in this section.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={onBookClick} language={language} />
      ))}
    </div>
  );
};