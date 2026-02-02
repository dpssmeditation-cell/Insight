
import { Book, Article, Audio, Video } from '../types';

const API_URL = 'http://localhost:3001';

export const databaseService = {
  // Generic fetch wrapper
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  },

  save: async <T extends { id: string }>(endpoint: string, item: T): Promise<T[]> => {
    try {
      // Check if item exists to decide POST vs PUT
      const checkRes = await fetch(`${API_URL}/${endpoint}/${item.id}`);

      const method = checkRes.ok ? 'PUT' : 'POST';
      const url = checkRes.ok ? `${API_URL}/${endpoint}/${item.id}` : `${API_URL}/${endpoint}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error('Failed to save item');

      // Return updated list
      return await databaseService.getAll<T>(endpoint);
    } catch (error) {
      console.error(`Error saving to ${endpoint}:`, error);
      return [];
    }
  },

  delete: async <T>(endpoint: string, id: string): Promise<T[]> => {
    try {
      await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      return await databaseService.getAll<T>(endpoint);
    } catch (error) {
      console.error(`Error deleting from ${endpoint}:`, error);
      return [];
    }
  },

  // Specialized methods
  getBooks: () => databaseService.getAll<Book>('books'),
  saveBook: (book: Book) => databaseService.save<Book>('books', book),
  deleteBook: (id: string) => databaseService.delete<Book>('books', id),

  getArticles: () => databaseService.getAll<Article>('articles'),
  saveArticle: (article: Article) => databaseService.save<Article>('articles', article),
  deleteArticle: (id: string) => databaseService.delete<Article>('articles', id),

  getAudios: () => databaseService.getAll<Audio>('audios'),
  saveAudio: (audio: Audio) => databaseService.save<Audio>('audios', audio),
  deleteAudio: (id: string) => databaseService.delete<Audio>('audios', id),

  getVideos: () => databaseService.getAll<Video>('videos'),
  saveVideo: (video: Video) => databaseService.save<Video>('videos', video),
  deleteVideo: (id: string) => databaseService.delete<Video>('videos', id),
};
