import React, { useState, useEffect } from 'react';
import { Article, Language } from '../types';
import { UI_STRINGS, CATEGORIES } from '../constants';
import { ArticleCard } from './ArticleCard';
import { Pagination } from './Pagination';
import { ArticleModal } from './ArticleModal';
import { firebaseService } from '../services/firebaseService';
import { SearchBar } from './SearchBar';
import { AdvancedFilters } from './AdvancedSearchModal';
import { evaluateQuery } from '../utils/searchUtils';

interface ArticlesPageProps {
  language: Language;
  articles: Article[];
  onArticleClick?: (article: Article) => void;
  initialId?: string | null;
}

const ARTICLES_PER_PAGE = 6;

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ language, articles, onArticleClick, initialId }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const t = UI_STRINGS[language];

  const filteredArticles = articles.filter(a => {
    // 1. Matches Category
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;

    // 2. Matches Advanced Filters
    let matchesAdvanced = true;
    if (Object.keys(advancedFilters).length > 0) {
      if (advancedFilters.category && advancedFilters.category !== 'All' && a.category !== advancedFilters.category) {
        matchesAdvanced = false;
      }
      if (advancedFilters.author && !a.author.toLowerCase().includes(advancedFilters.author.toLowerCase()) && !a.authorZh.includes(advancedFilters.author)) {
        matchesAdvanced = false;
      }
      // Check year from date string (YYYY-MM-DD)
      const year = a.date ? parseInt(a.date.split('-')[0]) : 0;
      if (advancedFilters.yearFrom && year < parseInt(advancedFilters.yearFrom)) {
        matchesAdvanced = false;
      }
      if (advancedFilters.yearTo && year > parseInt(advancedFilters.yearTo)) {
        matchesAdvanced = false;
      }
      if (advancedFilters.query && !evaluateQuery(a, advancedFilters.query, ['title', 'titleZh', 'author', 'authorZh', 'excerpt', 'excerptZh'])) {
        matchesAdvanced = false;
      }
    }

    // 3. Simple Search
    let matchesSearch = true;
    if (!advancedFilters.query && searchQuery) {
      matchesSearch = evaluateQuery(a, searchQuery, ['title', 'titleZh', 'author', 'authorZh']);
    }

    return matchesCategory && matchesAdvanced && matchesSearch;
  });

  // Sync state to URL and handle initial ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedArticle) {
      params.set('id', selectedArticle.id);
    } else {
      params.delete('id');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [selectedArticle]);

  useEffect(() => {
    if (initialId && articles.length > 0) {
      const article = articles.find(a => a.id === initialId);
      if (article) setSelectedArticle(article);
    }
  }, [initialId, articles.length]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const displayedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  // Reset to first page when category/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, advancedFilters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className={`text-4xl md:text-5xl font-bold text-slate-900 mb-3 font-serif tracking-tight ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}>
            {t.articles}
          </h1>
          <p className={`text-slate-500 font-serif italic text-lg max-w-2xl ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}>
            {language === 'zh' ? '深入浅出的文化见解、历史研究和当代反思。' : 'Deep insights into culture, historical research, and contemporary reflections.'}
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-3">
          <SearchBar
            language={language}
            type="articles"
            onSearch={(q) => { setSearchQuery(q); setAdvancedFilters({}); }}
            onAdvancedSearch={(filters) => { setAdvancedFilters(filters); setSearchQuery(''); if (filters.category) setSelectedCategory(filters.category); }}
          />
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full h-fit w-fit">
            <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            <span>{filteredArticles.length} {t.articles}</span>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-2 mb-10 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-900 hover:text-amber-900'
              } ${language === 'zh' ? 'chinese-text' : ''}`}
          >
            {cat === 'All' ? t.all : (language === 'zh' ? cat : cat)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {displayedArticles.map((article, index) => (
          <div key={article.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}>
            <ArticleCard
              article={article}
              language={language}
              onClick={(article) => {
                firebaseService.incrementView('articles', article.id);
                setSelectedArticle(article);
                if (onArticleClick) onArticleClick(article);
              }}
            />
          </div>
        ))}
        {filteredArticles.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-serif italic">No articles found in this category.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          language={language}
        />
      )}
    </div>
  );
};
