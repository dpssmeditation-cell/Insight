import React, { useState } from 'react';
import { Language, ViewState, User } from '../types';
import { UI_STRINGS } from '../constants';

interface HeaderProps {
  onLoginClick: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoginClick,
  onNavigate,
  currentView,
  language,
  onLanguageChange,
  currentUser,
  onLogout,
  isDarkMode,
  toggleDarkMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const t = UI_STRINGS[language];

  const navItems = [
    { label: t.home, view: 'books' as const },
    { label: t.articles, view: 'articles' as const },
    { label: t.audio, view: 'audio' as const },
    { label: t.books, view: 'books' as const },
    { label: t.multimedia, view: 'multimedia' as const },
    { label: t.authors, view: 'about' as const },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('books')}
          >
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Insight Sharing Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-wide text-slate-900 dark:text-white leading-none group-hover:text-amber-900 dark:group-hover:text-amber-500 transition-colors uppercase">
                Insight Sharing
              </span>
              <span className={`text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-medium leading-tight ${language === 'kh' ? 'khmer-text' : ''}`}>
                {language === 'kh' ? 'ខ្លឹមសារនៃវប្បធម៌ និងប្រាជ្ញា' : (language === 'zh' ? '文明与智慧' : 'Civilization & Wisdom')}
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, idx) => (
              <button
                key={`${item.label}-${idx}`}
                onClick={() => onNavigate(item.view)}
                className={`text-[14px] font-medium transition-all duration-200 border-b-2 border-transparent py-1 ${(currentView === item.view && (
                  (item.view === 'audio' && currentView === 'audio') ||
                  (item.view === 'articles' && currentView === 'articles') ||
                  (item.view === 'books' && currentView === 'books' && (item.label === t.home || item.label === t.books)) ||
                  (item.view === 'multimedia' && currentView === 'multimedia') ||
                  (item.view === 'about' && currentView === 'about')
                ))
                  ? 'text-amber-900 dark:text-amber-500 border-amber-900 dark:border-amber-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-900 dark:hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-800'
                  } ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <button
                onClick={() => onLanguageChange('en')}
                className={`transition-colors ${language === 'en' ? 'text-amber-900 dark:text-amber-500 font-bold' : 'text-slate-500 hover:text-amber-900 dark:hover:text-amber-500'}`}
              >
                EN
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => onLanguageChange('zh')}
                className={`chinese-text transition-colors ${language === 'zh' ? 'text-amber-900 dark:text-amber-500 font-bold' : 'text-slate-500 hover:text-amber-900 dark:hover:text-amber-500'}`}
              >
                中文
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => onLanguageChange('kh')}
                className={`khmer-text transition-colors ${language === 'kh' ? 'text-amber-900 dark:text-amber-500 font-bold' : 'text-slate-500 hover:text-amber-900 dark:hover:text-amber-500'}`}
              >
                KH
              </button>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-900 dark:hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full pr-3 pl-1 py-1 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">{currentUser.fullName}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 py-1 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-900 dark:hover:text-amber-500 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile Settings
                    </button>
                    <button
                      onClick={() => { onNavigate('my-library'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-900 dark:hover:text-amber-500 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      My Library
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-500 text-sm font-semibold transition-colors ${language === 'kh' ? 'khmer-text' : ''}`}
              >
                {t.login}
              </button>
            )}

          </div>

          <button
            className="md:hidden text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full left-0 shadow-xl animate-fade-in-down z-50">
          <nav className="flex flex-col p-6 space-y-4">
            {navItems.map((item, idx) => (
              <button
                key={`${item.label}-${idx}`}
                onClick={() => {
                  onNavigate(item.view);
                  setIsMenuOpen(false);
                }}
                className={`text-lg font-serif font-medium text-left border-l-4 pl-3 transition-all ${(currentView === item.view)
                  ? 'text-amber-900 dark:text-amber-500 border-amber-900 dark:border-amber-500'
                  : 'text-slate-800 dark:text-slate-200 hover:text-amber-900 dark:hover:text-amber-500 border-transparent hover:border-amber-900 dark:hover:border-amber-500'
                  } ${language === 'kh' ? 'khmer-text' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button onClick={() => { onLanguageChange('en'); setIsMenuOpen(false); }} className={`font-medium ${language === 'en' ? 'text-amber-900 dark:text-amber-500' : 'text-slate-500'}`}>EN</button>
                  <button onClick={() => { onLanguageChange('zh'); setIsMenuOpen(false); }} className={`chinese-text font-medium ${language === 'zh' ? 'text-amber-900 dark:text-amber-500' : 'text-slate-500'}`}>中文</button>
                  <button onClick={() => { onLanguageChange('kh'); setIsMenuOpen(false); }} className={`khmer-text font-medium ${language === 'kh' ? 'text-amber-900 dark:text-amber-500' : 'text-slate-500'}`}>KH</button>
                </div>
                <button onClick={toggleDarkMode} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  {isDarkMode ? (
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </button>
              </div>

              {currentUser ? (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3">
                    <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full border border-white dark:border-slate-700 shadow-sm" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }} className="text-slate-600 dark:text-slate-400 text-left hover:text-amber-900 dark:hover:text-amber-500 font-medium pl-1">Profile Settings</button>
                  <button onClick={() => { onNavigate('my-library'); setIsMenuOpen(false); }} className="text-slate-600 dark:text-slate-400 text-left hover:text-amber-900 dark:hover:text-amber-500 font-medium pl-1">My Library</button>
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="text-red-600 dark:text-red-400 text-left font-medium pl-1">Sign Out</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className={`text-slate-800 dark:text-slate-200 font-medium hover:text-amber-900 dark:hover:text-amber-500 text-left px-1 ${language === 'kh' ? 'khmer-text' : ''}`}
                >
                  {t.login}
                </button>
              )}

            </div>
          </nav>
        </div>
      )}
    </header>
  );
};