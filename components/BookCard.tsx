
import React from 'react';
import { Book, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  language: Language;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick, language }) => {
  const t = UI_STRINGS[language];
  
  const getLocalizedTitle = () => {
    if (language === 'zh') return book.titleZh;
    if (language === 'kh' && book.titleKh) return book.titleKh;
    return book.title;
  };

  const getLocalizedAuthor = () => {
    if (language === 'zh') return book.authorZh;
    if (language === 'kh' && book.authorKh) return book.authorKh;
    return book.author;
  };

  const getLocalizedCategory = () => {
    if (language === 'zh') return book.categoryZh;
    return book.category;
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'telegram', e: React.MouseEvent) => {
    e.stopPropagation();
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    const baseUrl = isLocal ? 'https://insightsharing.org' : (window.location.origin + window.location.pathname);
    const title = getLocalizedTitle();
    const author = getLocalizedAuthor();
    const text = language === 'zh' 
      ? `在 Insight Sharing 数字图书馆查看 ${author} 的《${title}》`
      : `Check out "${title}" by ${author} on Insight Sharing Digital Library`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div 
      className="group cursor-pointer flex flex-col h-full bg-transparent"
      onClick={() => onClick(book)}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[8px] shadow-lg dark:shadow-black bg-slate-200 dark:bg-slate-800 mb-5 transition-all duration-500 ease-out group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] group-hover:-translate-y-2">
        <img 
          src={book.coverUrl} 
          alt={getLocalizedTitle()}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        
        {/* Shadow/Gradient for readability of view count */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none opacity-80" />
        
        {/* Bottom Left View Count Badge (Exact Replica Style) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/95 text-[11px] font-bold drop-shadow-md z-10 transition-opacity duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
            </svg>
            <span className="font-sans">{(book.views || 0).toLocaleString()}</span>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 pointer-events-none">
             <span className="bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black px-5 py-2.5 rounded-full shadow-2xl tracking-widest uppercase border dark:border-slate-700">
                {t.viewDetails}
             </span>
        </div>
      </div>

      <div className="flex flex-col items-start px-0">
        <div className="mb-1.5">
            <span className={`text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-500 font-black ${language === 'zh' ? 'chinese-text' : ''}`}>
                {getLocalizedCategory()}
            </span>
        </div>
        <h3 className={`font-serif font-bold text-[19px] leading-snug text-slate-900 dark:text-slate-100 group-hover:text-amber-900 dark:group-hover:text-amber-500 transition-colors mb-1 line-clamp-1 ${language === 'zh' ? 'chinese-text' : ''}`}>
          {getLocalizedTitle()}
        </h3>
        <p className={`text-[14px] text-slate-500 dark:text-slate-400 font-medium ${language === 'zh' ? 'chinese-text' : ''}`}>
            {getLocalizedAuthor()}
        </p>
      </div>
    </div>
  );
};
