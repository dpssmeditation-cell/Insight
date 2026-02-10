import React, { useState } from 'react';
import { UI_STRINGS, CATEGORIES, AUDIO_CATEGORIES, VIDEO_CATEGORIES } from '../constants';
import { Language, Category } from '../types';

interface AdvancedSearchModalProps {
    onClose: () => void;
    onSearch: (filters: AdvancedFilters) => void;
    language: Language;
    type: 'books' | 'articles' | 'multimedia' | 'audio';
}

export interface AdvancedFilters {
    query?: string;
    category?: string;
    author?: string; // or artist/presenter
    yearFrom?: string;
    yearTo?: string;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({ onClose, onSearch, language, type }) => {
    const t = UI_STRINGS[language];
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [author, setAuthor] = useState('');
    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');

    const getCategories = () => {
        switch (type) {
            case 'books': return CATEGORIES;
            case 'articles': return CATEGORIES;
            case 'multimedia': return VIDEO_CATEGORIES;
            case 'audio': return AUDIO_CATEGORIES;
            default: return ['All'];
        }
    };

    const categories = getCategories();

    const handleApply = () => {
        onSearch({
            query,
            category,
            author,
            yearFrom,
            yearTo
        });
        onClose();
    };

    const getAuthorLabel = () => {
        switch (type) {
            case 'books': return language === 'zh' ? '作者' : 'Author';
            case 'articles': return language === 'zh' ? '作者' : 'Author';
            case 'audio': return language === 'zh' ? '艺术家/作曲家' : 'Artist/Composer';
            case 'multimedia': return language === 'zh' ? '主讲人' : 'Presenter';
            default: return 'Author';
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 glass animate-fade-in" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className={`text-lg font-bold font-serif text-slate-800 dark:text-white ${language === 'zh' ? 'chinese-text' : ''}`}>
                        {language === 'zh' ? '高级搜索' : 'Advanced Search'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* General Query with Tooltip */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {language === 'zh' ? '关键词 (支持 AND, OR, NOT)' : 'Keywords (Supports AND, OR, NOT)'}
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white"
                            placeholder="e.g. history AND china"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5">
                            {language === 'zh' ? '示例: history AND (china OR asia) NOT war' : 'Example: history AND (china OR asia) NOT war'}
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {language === 'zh' ? '类别' : 'Category'}
                        </label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white appearance-none"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{language === 'zh' ? (cat === 'All' ? '全部' : cat) : cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Author/Artist */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {getAuthorLabel()}
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                        />
                    </div>

                    {/* Date Range (Year) */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {language === 'zh' ? '年份范围' : 'Year Range'}
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                placeholder="From"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white"
                                value={yearFrom}
                                onChange={e => setYearFrom(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="To"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white"
                                value={yearTo}
                                onChange={e => setYearTo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                        {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-amber-900 hover:bg-amber-800 shadow-lg shadow-amber-900/20 rounded-xl transition-all active:scale-95"
                    >
                        {language === 'zh' ? '搜索' : 'Search'}
                    </button>
                </div>
            </div>
        </div>
    );
};
