import React, { useState } from 'react';
import { Language } from '../types';
import { UI_STRINGS } from '../constants';
import { AdvancedSearchModal, AdvancedFilters } from './AdvancedSearchModal';

interface SearchBarProps {
    language: Language;
    onSearch: (query: string) => void;
    onAdvancedSearch: (filters: AdvancedFilters) => void;
    type: 'books' | 'articles' | 'multimedia' | 'audio';
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ language, onSearch, onAdvancedSearch, type, placeholder }) => {
    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const t = UI_STRINGS[language];

    const handleManualSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    };

    return (
        <>
            <div className="relative w-full md:w-96 group flex items-center gap-2">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder={placeholder || t.searchPlaceholder}
                        value={query}
                        onChange={handleManualSearch}
                        className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/20 focus:border-amber-900 dark:focus:border-amber-500 text-sm transition-all shadow-sm group-hover:border-slate-300 dark:text-white dark:placeholder-slate-500 ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}
                    />
                    <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-2.5 transition-colors group-hover:text-amber-800 dark:group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-900 dark:hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                    title={language === 'zh' ? '高级搜索' : 'Advanced Search'}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </button>
            </div>

            {isModalOpen && (
                <AdvancedSearchModal
                    onClose={() => setIsModalOpen(false)}
                    onSearch={onAdvancedSearch}
                    language={language}
                    type={type}
                />
            )}
        </>
    );
};
