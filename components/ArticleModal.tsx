
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-fade-in"
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
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?article=${article.id}`;
                  const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                }}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 transition-all"
                title="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?article=${article.id}`;
                  const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                }}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                title="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?article=${article.id}`;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                }}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0A66C2] hover:bg-blue-50 transition-all"
                title="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?article=${article.id}`;
                  const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()} - ${url}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:bg-green-50 transition-all"
                title="Share on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?article=${article.id}`;
                  navigator.clipboard.writeText(url).then(() => {
                    const btn = event?.currentTarget as HTMLButtonElement;
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
                    btn.classList.add('text-green-600');
                    setTimeout(() => {
                      btn.innerHTML = originalHTML;
                      btn.classList.remove('text-green-600');
                    }, 2000);
                  });
                }}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="Copy link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
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
