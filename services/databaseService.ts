import { Book, Article, Audio, Video } from '../types';
import { BOOKS, ARTICLES, AUDIOS, VIDEOS } from '../constants';

const DB_KEYS = {
  BOOKS: 'is_library_books',
  ARTICLES: 'is_library_articles',
  AUDIOS: 'is_library_audios',
  VIDEOS: 'is_library_videos',
};

/**
 * Smart merge function:
 * Takes existing items from storage and merges them with default items from code.
 * Existing items with the same ID as a default item are preserved (user changes win),
 * but brand new default items (added in a redeploy) are injected.
 */
const syncWithDefaults = <T extends { id: string }>(key: string, defaultItems: T[]) => {
  const storedData = localStorage.getItem(key);
  const existingItems: T[] = storedData ? JSON.parse(storedData) : [];
  
  // Create a map of existing items by ID
  const itemMap = new Map<string, T>();
  
  // 1. Add all existing items (user-created or previous defaults)
  existingItems.forEach(item => itemMap.set(item.id, item));
  
  // 2. Add defaults only if they don't exist yet
  // This ensures new items added to constants.ts in a redeploy show up
  defaultItems.forEach(item => {
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, item);
    }
  });
  
  const mergedItems = Array.from(itemMap.values());
  
  // Save merged state back to storage
  localStorage.setItem(key, JSON.stringify(mergedItems));
};

// Initialize/Sync on load
const initializeDb = () => {
  syncWithDefaults(DB_KEYS.BOOKS, BOOKS);
  syncWithDefaults(DB_KEYS.ARTICLES, ARTICLES);
  syncWithDefaults(DB_KEYS.AUDIOS, AUDIOS);
  syncWithDefaults(DB_KEYS.VIDEOS, VIDEOS);
};

initializeDb();

export const databaseService = {
  // Generic getter
  getAll: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  // Generic saver (Create or Update)
  save: <T extends { id: string }>(key: string, item: T): T[] => {
    const items = databaseService.getAll<T>(key);
    const index = items.findIndex(i => i.id === item.id);
    
    let updatedItems: T[];
    if (index > -1) {
      updatedItems = [...items];
      updatedItems[index] = item;
    } else {
      // New items are added at the beginning
      updatedItems = [item, ...items];
    }
    
    localStorage.setItem(key, JSON.stringify(updatedItems));
    return updatedItems;
  },

  // Generic deleter
  delete: <T extends { id: string }>(key: string, id: string): T[] => {
    const items = databaseService.getAll<T>(key);
    const updatedItems = items.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(updatedItems));
    return updatedItems;
  },

  // Specific entity wrappers
  getArticles: () => databaseService.getAll<Article>(DB_KEYS.ARTICLES),
  saveArticle: (article: Article) => databaseService.save<Article>(DB_KEYS.ARTICLES, article),
  deleteArticle: (id: string) => databaseService.delete<Article>(DB_KEYS.ARTICLES, id),

  getBooks: () => databaseService.getAll<Book>(DB_KEYS.BOOKS),
  saveBook: (book: Book) => databaseService.save<Book>(DB_KEYS.BOOKS, book),
  deleteBook: (id: string) => databaseService.delete<Book>(DB_KEYS.BOOKS, id),

  getAudios: () => databaseService.getAll<Audio>(DB_KEYS.AUDIOS),
  saveAudio: (audio: Audio) => databaseService.save<Audio>(DB_KEYS.AUDIOS, audio),
  deleteAudio: (id: string) => databaseService.delete<Audio>(DB_KEYS.AUDIOS, id),

  getVideos: () => databaseService.getAll<Video>(DB_KEYS.VIDEOS),
  saveVideo: (video: Video) => databaseService.save<Video>(DB_KEYS.VIDEOS, video),
  deleteVideo: (id: string) => databaseService.delete<Video>(DB_KEYS.VIDEOS, id),
};