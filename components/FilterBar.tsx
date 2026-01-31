import React from 'react';
import { CATEGORIES, UI_STRINGS } from '../constants';
import { Category, Language } from '../types';

interface FilterBarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  language: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({ selectedCategory, onSelectCategory, language }) => {
  const getLocalizedLabel = (cat: Category) => {
    const t = UI_STRINGS[language];
    switch (cat) {
      case 'All': return t.all;
      case 'History': return t.history;
      case 'Philosophy': return t.philosophy;
      case 'Culture': return t.culture;
      case 'Arts': return t.arts;
      case 'Biography': return t.biography;
      default: return cat;
    }
  };

  return (
    <div className="flex overflow-x-auto pb-1 gap-1 scrollbar-hide mask-fade-right">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`
            whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${
              selectedCategory === category
                ? 'bg-amber-900 dark:bg-amber-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }
            ${language === 'zh' ? 'chinese-text' : ''}
          `}
        >
          {getLocalizedLabel(category)}
        </button>
      ))}
    </div>
  );
};