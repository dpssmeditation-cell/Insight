
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
import { DonationPage } from './components/DonationPage';
import { AdminPage } from './components/AdminPage';
import { ProfilePage } from './components/ProfilePage';
import { MyLibraryPage } from './components/MyLibraryPage';
import { Book, Category, Language, ViewState, Audio, Video, User, Article, Artist } from './types';
import { UI_STRINGS, BOOKS, ARTICLES, AUDIOS, VIDEOS, ARTIST_PROFILES } from './constants';
import { authService } from './services/authService';
import { firebaseService } from './services/firebaseService';

const ITEMS_PER_PAGE = 8;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('books');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      for (const b of BOOKS) await firebaseService.saveBook(b);

      console.log('Seeding Articles...');
      for (const a of ARTICLES) await firebaseService.saveArticle(a);

      console.log('Seeding Audios...');
      for (const a of AUDIOS) await firebaseService.saveAudio(a);

      console.log('Seeding Videos...');
      for (const v of VIDEOS) await firebaseService.saveVideo(v);

      console.log('Seeding Artists...');
      for (const ar of ARTIST_PROFILES) await firebaseService.saveArtist(ar);

      alert('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Failed to seed database. Check console for details.');
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.titleZh && book.titleZh.includes(searchQuery)) ||
      (book.titleKh && book.titleKh.includes(searchQuery)) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, language]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        );
      case 'profile':
        return currentUser ? (
          <ProfilePage
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            language={language}
          />
        ) : (
          <div className="text-center py-20 dark:text-slate-300">Please log in to view profile.</div>
        );
      case 'my-library':
        return currentUser ? (
          <MyLibraryPage
            user={currentUser}
            books={books}
            audios={audios}
            videos={videos}
            articles={articles}
            language={language}
          />
        ) : (
          <div className="text-center py-20 dark:text-slate-300">Please log in to view library.</div>
        );
      case 'articles':
        return <ArticlesPage language={language} articles={articles} />;
      case 'multimedia':
        return <MultimediaPage language={language} videos={videos} />;
      case 'about':
        return <AboutPage language={language} onRead={handleReadBook} books={books} audios={audios} videos={videos} articles={articles} />;
      case 'audio':
        return <AudioPage language={language} audios={audios} />;
      case 'donate':
        return <DonationPage language={language} />;
      case 'books':
      default:
        return (
          <>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 animate-fade-in">
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

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 sticky top-24 z-30 bg-[#f9fafb]/95 dark:bg-slate-900/95 backdrop-blur-md py-4 rounded-xl transition-all animate-fade-in">
              <FilterBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                language={language}
              />

              <div className="relative w-full md:w-72 group">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/20 focus:border-amber-900 dark:focus:border-amber-500 text-sm transition-all shadow-sm group-hover:border-slate-300 dark:text-white dark:placeholder-slate-500 ${language === 'kh' ? 'khmer-text' : (language === 'zh' ? 'chinese-text' : '')}`}
                />
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-2.5 transition-colors group-hover:text-amber-800 dark:group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
          </>
        );
    }
  };

  const handleSaveItem = async (type: 'book' | 'audio' | 'video' | 'article' | 'artist', item: any) => {
    const finalItem = item.id ? item : { ...item, id: Date.now().toString() };

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
    } catch (error) {
      alert("Failed to save item to Firebase. Please check your internet connection.");
      console.error(error);
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
          onClose={() => setSelectedBook(null)}
          language={language}
          onRead={handleReadBook}
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
