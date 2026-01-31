import React from 'react';
import { Article, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  language: Language;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, language }) => {
  const t = UI_STRINGS[language];

  const getLocalizedTitle = () => {
    if (language === 'zh') return article.titleZh;
    if (language === 'kh' && article.titleKh) return article.titleKh;
    return article.title;
  };

  const getLocalizedAuthor = () => {
    if (language === 'zh') return article.authorZh;
    return article.author;
  };

  const getLocalizedExcerpt = () => {
    if (language === 'zh') return article.excerptZh;
    if (language === 'kh' && article.excerptKh) return article.excerptKh;
    return article.excerpt;
  };

  const getLocalizedContent = () => {
    if (language === 'zh') return article.contentZh || article.content;
    if (language === 'kh') return article.contentKh || article.content;
    return article.content;
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'telegram') => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    const baseUrl = isLocal ? 'https://insightsharing.org' : (window.location.origin + window.location.pathname);
    const title = getLocalizedTitle();
    const text = language === 'zh' 
      ? `阅读 Insight Sharing 上的文章：${title}`
      : `Read this article on Insight Sharing: "${title}"`;
    
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

  const content = getLocalizedContent();

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-fade-in-up flex flex-col">
        
        {/* Hero Image Section */}
        <div className="relative w-full aspect-[21/9] overflow-hidden bg-slate-200 shrink-0">
          <img 
            src={article.imageUrl} 
            alt={getLocalizedTitle()} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-8 left-8 right-24">
             <span className="bg-amber-700 text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest mb-3 inline-block">
                {article.category}
             </span>
             <h1 className={`text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight ${language === 'zh' ? 'chinese-text' : ''}`}>
                {getLocalizedTitle()}
             </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-10 md:px-12">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border-2 border-slate-50 shadow-sm">
                {getLocalizedAuthor().charAt(0)}
              </div>
              <div>
                <p className={`text-base font-bold text-slate-900 ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedAuthor()}</p>
                <p className="text-xs text-slate-400 font-medium">{new Date(article.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>

            <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{article.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span>{(article.views || 0).toLocaleString()}</span>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
               <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
               </button>
               <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"/></svg>
               </button>
               <button onClick={() => handleShare('telegram')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-50 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.27783 11.8596L20.7259 4.39006C21.626 3.99961 22.5855 4.88147 22.148 5.76023L18.8872 19.9575C18.6433 21.0856 17.2274 21.464 16.4277 20.6158L12.126 16.2731L9.62319 18.6657C9.28821 18.9859 8.73602 18.7485 8.73602 18.2853V14.4705L17.7801 6.54585C17.9624 6.38604 17.7289 6.10444 17.5256 6.22998L7.00918 12.723L3.43572 11.4587C2.46824 11.1165 2.40428 11.8398 2.27783 11.8596Z"/></svg>
               </button>
            </div>
          </div>

          {/* Article Text */}
          <div className={`prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-serif ${language === 'zh' ? 'chinese-text' : ''}`}>
             <p className="text-xl font-medium text-slate-900 mb-10 italic border-l-4 border-amber-800 pl-6 bg-amber-50/30 py-6 rounded-r-xl">
                {getLocalizedExcerpt()}
             </p>
             
             {content ? (
               <div dangerouslySetInnerHTML={{ __html: content }} />
             ) : (
               <div className="space-y-6 opacity-60 italic">
                 <p>{language === 'zh' ? '暂无正文内容。' : 'No article body content available.'}</p>
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                 <div className="h-4 bg-slate-100 rounded w-4/6"></div>
               </div>
             )}
          </div>
          
          <div className="mt-16 pt-10 border-t border-slate-100 flex justify-center">
            <button 
                onClick={onClose}
                className="px-12 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-amber-900 transition-all shadow-xl hover:shadow-amber-900/20 active:scale-95 transform"
            >
              {language === 'zh' ? '完成阅读' : 'Finish Reading'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};