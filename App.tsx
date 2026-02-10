
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BookGrid } from './components/BookGrid';
import { BookModal } from './components/BookModal';
import { ReaderModal } from './components/ReaderModal';
import { LoginModal } from './components/LoginModal';
import { FilterBar } from './components/FilterBar';
import { Pagination } from './components/Pagination';
import { MultimediaPage } from './components/MultimediaPage';
import { ArticlesPage } from './components/ArticlesPage';
import { AboutPage } from './components/AboutPage';
import { AudioPage } from './components/AudioPage';

import { AdminPage } from './components/AdminPage';
import { ProfilePage } from './components/ProfilePage';
import { MyLibraryPage } from './components/MyLibraryPage';
import { Book, Category, Language, ViewState, Audio, Video, User, Article, Artist } from './types';
import { UI_STRINGS, BOOKS, ARTICLES, AUDIOS, VIDEOS, ARTIST_PROFILES } from './constants';
import { authService } from './services/authService';
import { firebaseService } from './services/firebaseService';
import { SearchBar } from './components/SearchBar';
import { AdvancedFilters } from './components/AdvancedSearchModal';
import { evaluateQuery } from './utils/searchUtils';

const ITEMS_PER_PAGE = 8;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('books');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize state from Database Service
  const [books, setBooks] = useState<Book[]>([]);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  const t = UI_STRINGS[language];

  // Fetch data on load
  // Subscribe to real-time data
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setCurrentUser(user);

    const unsubBooks = firebaseService.subscribeBooks(setBooks);
    const unsubAudios = firebaseService.subscribeAudios(setAudios);
    const unsubVideos = firebaseService.subscribeVideos(setVideos);
    const unsubArticles = firebaseService.subscribeArticles(setArticles);
    const unsubArtists = firebaseService.subscribeArtists(setArtists);

    return () => {
      unsubBooks();
      unsubAudios();
      unsubVideos();
      unsubArticles();
      unsubArtists();
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    if (currentView === 'profile' || currentView === 'my-library' || currentView === 'admin') {
      setCurrentView('books');
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const result = await authService.updateUser(updatedUser);
      setCurrentUser(result);
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const addToHistory = (itemId: string, type: 'book' | 'audio' | 'video' | 'article') => {
    if (!currentUser) return;

    const newHistoryItem = { itemId, type, timestamp: new Date().toISOString() };
    const currentHistory = currentUser.history || [];
    const filteredHistory = currentHistory.filter(h => h.itemId !== itemId);

    const updatedUser = {
      ...currentUser,
      history: [...filteredHistory, newHistoryItem]
    };

    handleUpdateUser(updatedUser);
  };

  const handleSeed = async () => {
    if (!confirm('Are you sure you want to seed the database? This might duplicate data if run multiple times.')) return;

    try {
      console.log('Seeding Books...');
      for (const b of BOOKS) await firebaseService.saveBook({ ...b, createdAt: new Date().toISOString() });

      console.log('Seeding Articles...');
      for (const a of ARTICLES) await firebaseService.saveArticle({ ...a, createdAt: new Date().toISOString() });

      console.log('Seeding Audios...');
      for (const a of AUDIOS) await firebaseService.saveAudio({ ...a, createdAt: new Date().toISOString() });

      console.log('Seeding Videos...');
      for (const v of VIDEOS) await firebaseService.saveVideo({ ...v, createdAt: new Date().toISOString() });

      console.log('Seeding Artists...');
      for (const ar of ARTIST_PROFILES) await firebaseService.saveArtist({ ...ar, createdAt: new Date().toISOString() });

      alert('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Failed to seed database. Check console for details.');
    }
  };

  const filteredBooks = books.filter((book) => {
    // 1. Matches Category (Top level filter)
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;

    // 2. Matches Advanced Filters (if active)
    let matchesAdvanced = true;
    if (Object.keys(advancedFilters).length > 0) {
      if (advancedFilters.category && advancedFilters.category !== 'All' && book.category !== advancedFilters.category) {
        matchesAdvanced = false;
      }
      if (advancedFilters.author && !book.author.toLowerCase().includes(advancedFilters.author.toLowerCase()) && !book.authorZh.includes(advancedFilters.author)) {
        matchesAdvanced = false;
      }
      if (advancedFilters.yearFrom && parseInt(book.year) < parseInt(advancedFilters.yearFrom)) {
        matchesAdvanced = false;
      }
      if (advancedFilters.yearTo && parseInt(book.year) > parseInt(advancedFilters.yearTo)) {
        matchesAdvanced = false;
      }
      if (advancedFilters.query && !evaluateQuery(book, advancedFilters.query, ['title', 'titleZh', 'titleKh', 'author', 'authorZh', 'description', 'descriptionZh'])) {
        matchesAdvanced = false;
      }
    }

    // 3. Matches Simple Search (if no advanced query)
    // If advanced query exists, it takes precedence for text matching
    let matchesSearch = true;
    if (!advancedFilters.query && searchQuery) {
      matchesSearch = evaluateQuery(book, searchQuery, ['title', 'titleZh', 'titleKh', 'author', 'authorZh']);
    }

    return matchesCategory && matchesAdvanced && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, advancedFilters, language]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // URL Deep Linking Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('v') as ViewState;
    const id = params.get('id');
    const bookId = params.get('book'); // Legacy support or direct book link
    const chapterId = params.get('chapter');

    if (bookId && books.length > 0) {
      const book = books.find(b => b.id === bookId);
      if (book) {
        setSelectedBook(book);
        // Logic to handle chapter scrolling if needed inside BookModal is passed via props
      }
    }

    if (view && ['books', 'articles', 'multimedia', 'about', 'audio', 'admin', 'profile', 'my-library'].includes(view)) {
      setCurrentView(view);

      // Special handling for books on home page
      if (view === 'books' && id && books.length > 0) {
        const book = books.find(b => b.id === id);
        if (book) setSelectedBook(book);
      }
    }
  }, [books.length]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('v', currentView);

    let id = '';
    if (currentView === 'books' && selectedBook) id = selectedBook.id;
    // For other views, IDs are handled by sub-pages, but we can still track them here if needed

    if (id) params.set('id', id);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [currentView, selectedBook]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadBook = (book: Book) => {
    addToHistory(book.id, 'book');
    setReadingBook(book);
    // Removed setSelectedBook(null) to allow stacking (Popup effect)
  };

  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return (
          <div key="admin" className="animate-fade-in">
            <AdminPage
              books={books}
              audios={audios}
              videos={videos}
              articles={articles}
              artists={artists}
              language={language}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
              onSeed={handleSeed}
            />
          </div>
        );
      case 'profile':
        return currentUser ? (
          <div key="profile" className="animate-fade-in">
            <ProfilePage
              user={currentUser}
              onUpdateUser={handleUpdateUser}
              language={language}
            />
          </div>
        ) : (
          <div className="text-center py-20 dark:text-slate-300 animate-fade-in">Please log in to view profile.</div>
        );
      case 'my-library':
        return currentUser ? (
          <div key="my-library" className="animate-fade-in">
            <MyLibraryPage
              user={currentUser}
              books={books}
              audios={audios}
              videos={videos}
              articles={articles}
              language={language}
            />
          </div>
        ) : (
          <div className="text-center py-20 dark:text-slate-300 animate-fade-in">Please log in to view library.</div>
        );
      case 'articles':
        return <div key="articles" className="animate-fade-in"><ArticlesPage language={language} articles={articles} initialId={new URLSearchParams(window.location.search).get('id')} /></div>;
      case 'multimedia':
        return <div key="multimedia" className="animate-fade-in"><MultimediaPage language={language} videos={videos} initialId={new URLSearchParams(window.location.search).get('id')} /></div>;
      case 'about':
        return <div key="about" className="animate-fade-in"><AboutPage language={language} onRead={handleReadBook} books={books} audios={audios} videos={videos} articles={articles} /></div>;
      case 'audio':
        return <div key="audio" className="animate-fade-in"><AudioPage language={language} audios={audios} initialId={new URLSearchParams(window.location.search).get('id')} /></div>;
      case 'books':
      default:
        return (
          <div key="books" className="animate-fade-in">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 font-serif tracking-tight ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}>{t.library}</h1>
                <p className={`text-slate-500 dark:text-slate-400 font-serif italic text-lg max-w-2xl ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}>
                  {t.heroSub}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <span className={`text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider ${language === 'kh' ? 'khmer-text' : ''}`}>{t.totalCollection}</span>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-500 font-serif">{books.length} <span className="text-base font-normal text-slate-500 dark:text-slate-400">Vol.</span></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 sticky top-24 z-30 glass py-4 rounded-xl transition-all animate-fade-in">
              <FilterBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                language={language}
              />

              <div className="w-full md:w-auto">
                <SearchBar
                  language={language}
                  type="books"
                  onSearch={(q) => {
                    setSearchQuery(q);
                    setAdvancedFilters({}); // Clear advanced filters on simple search
                  }}
                  onAdvancedSearch={(filters) => {
                    setAdvancedFilters(filters);
                    setSearchQuery(''); // Clear simple search on advanced
                    if (filters.category) setSelectedCategory(filters.category as any);
                  }}
                />
              </div>
            </div>

            <BookGrid
              books={displayedBooks}
              onBookClick={(book) => {
                firebaseService.incrementView('books', book.id);
                setSelectedBook(book);
              }}
              language={language}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        );
    }
  };

  const handleSaveItem = async (type: 'book' | 'audio' | 'video' | 'article' | 'artist', item: any) => {
    const finalItem = item.id ? item : { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };

    try {
      // Save to Firebase
      let newData;
      if (type === 'book') newData = await firebaseService.saveBook(finalItem);
      else if (type === 'audio') newData = await firebaseService.saveAudio(finalItem);
      else if (type === 'video') newData = await firebaseService.saveVideo(finalItem);
      else if (type === 'article') newData = await firebaseService.saveArticle(finalItem);
      else if (type === 'artist') newData = await firebaseService.saveArtist(finalItem);

      // Refresh relevant state
      if (type === 'book') setBooks(newData as Book[]);
      else if (type === 'audio') setAudios(newData as Audio[]);
      else if (type === 'video') setVideos(newData as Video[]);
      else if (type === 'article') setArticles(newData as Article[]);
      else if (type === 'artist') setArtists(newData as Artist[]);
    } catch (error: any) {
      console.error('Firebase save error:', error);

      let errorMessage = "Failed to save item to Firebase.";

      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check Firebase security rules.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase service unavailable. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = `Failed to save: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  const handleDeleteItem = async (type: 'book' | 'audio' | 'video' | 'article' | 'artist', id: string) => {
    try {
      // Delete from Firebase
      let newData;
      if (type === 'book') newData = await firebaseService.deleteBook(id);
      else if (type === 'audio') newData = await firebaseService.deleteAudio(id);
      else if (type === 'video') newData = await firebaseService.deleteVideo(id);
      else if (type === 'article') newData = await firebaseService.deleteArticle(id);
      else if (type === 'artist') newData = await firebaseService.deleteArtist(id);

      // Refresh relevant state
      if (type === 'book') setBooks(newData as Book[]);
      else if (type === 'audio') setAudios(newData as Audio[]);
      else if (type === 'video') setVideos(newData as Video[]);
      else if (type === 'article') setArticles(newData as Article[]);
      else if (type === 'artist') setArtists(newData as Artist[]);
    } catch (error) {
      alert("Failed to delete item from Firebase. Please check your internet connection.");
      console.error(error);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen text-slate-800 dark:text-slate-200 bg-[#f9fafb] dark:bg-slate-900 transition-colors duration-300 ${language === 'kh' ? 'khmer-text' : ''}`}>
      <Header
        onLoginClick={() => setIsLoginOpen(true)}
        onNavigate={handleNavigate}
        currentView={currentView}
        language={language}
        onLanguageChange={setLanguage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-grow container mx-auto px-4 py-12 md:px-8 max-w-7xl">
        {renderContent()}
      </main>

      <Footer language={language} onNavigate={handleNavigate} />

      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => {
            setSelectedBook(null);
            // Clear URL params
            const newUrl = window.location.pathname;
            window.history.pushState({}, '', newUrl);
          }}
          language={language}
          onRead={handleReadBook}
          initialChapterId={new URLSearchParams(window.location.search).get('chapter') || undefined}
        />
      )}

      {readingBook && (
        <ReaderModal
          book={readingBook}
          onClose={() => setReadingBook(null)}
          language={language}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          language={language}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default App;
