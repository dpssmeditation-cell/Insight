import React from 'react';
import { Article, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  language: Language;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, language }) => {
  const t = UI_STRINGS[language];

  const getLocalizedTitle = () => {
    if (language === 'zh') return article.titleZh;
    if (language === 'kh' && article.titleKh) return article.titleKh;
    return article.title;
  };

  const getLocalizedExcerpt = () => {
    if (language === 'zh') return article.excerptZh;
    if (language === 'kh' && article.excerptKh) return article.excerptKh;
    return article.excerpt;
  };

  const getLocalizedAuthor = () => {
    if (language === 'zh') return article.authorZh;
    return article.author;
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'telegram', e: React.MouseEvent) => {
    e.stopPropagation();
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    const baseUrl = isLocal ? 'https://insightsharing.org' : (window.location.origin + window.location.pathname);
    const shareLink = `${baseUrl}?v=articles&id=${article.id}`;
    const title = getLocalizedTitle();
    const text = language === 'zh'
      ? `阅读 Insight Sharing 上的文章：${title}`
      : `Read this article on Insight Sharing: "${title}"`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div
      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onClick={() => onClick(article)}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={article.imageUrl}
          alt={getLocalizedTitle()}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>

        <div className="absolute top-4 left-4">
          <span className="bg-amber-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            {article.category}
          </span>
        </div>

        {/* Share Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={(e) => handleShare('facebook', e)} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </button>
          <button onClick={(e) => handleShare('twitter', e)} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
          </button>
          <button onClick={(e) => handleShare('telegram', e)} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <svg className="w-4 h-4 ml-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.8-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
          </button>
        </div>

        {/* View Count Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-xs font-bold drop-shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          <span>{(article.views || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
          <span>{article.readTime} Read</span>
        </div>

        <h3 className={`text-xl font-serif font-bold text-slate-900 group-hover:text-amber-900 transition-colors mb-3 leading-tight line-clamp-2 ${language === 'zh' ? 'chinese-text' : ''}`}>
          {getLocalizedTitle()}
        </h3>

        <p className={`text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed ${language === 'zh' ? 'chinese-text' : ''}`}>
          {getLocalizedExcerpt()}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
              {getLocalizedAuthor().charAt(0)}
            </div>
            <span className={`text-xs font-bold text-slate-600 ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedAuthor()}</span>
          </div>
          <svg className="w-5 h-5 text-amber-900 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
