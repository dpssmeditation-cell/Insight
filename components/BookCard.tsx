
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

        {/* Share Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button onClick={(e) => handleShare('facebook', e)} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </button>
          <button onClick={(e) => handleShare('twitter', e)} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
          </button>
          <button onClick={(e) => handleShare('telegram', e)} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <svg className="w-4 h-4 ml-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
          </button>
        </div>

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
