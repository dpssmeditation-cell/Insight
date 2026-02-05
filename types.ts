
export type Category = 'All' | 'History' | 'Philosophy' | 'Culture' | 'Arts' | 'Biography' | 'Buddhism' | 'Dhamma Talks';

export interface Book {
  id: string;
  title: string;
  titleZh: string;
  titleKh?: string;
  author: string;
  authorZh: string;
  authorKh?: string;
  category: Category;
  categoryZh: string;
  year: string;
  coverUrl: string;
  description: string;
  descriptionZh: string;
  pages: number;
  isbn?: string;
  publisher?: string;
  publisherZh?: string;
  views?: number;
  pdfUrl?: string;
  fileSize?: string;
  createdAt?: string;
}

export interface Article {
  id: string;
  title: string;
  titleZh: string;
  titleKh?: string;
  excerpt: string;
  excerptZh: string;
  excerptKh?: string;
  content?: string;
  contentZh?: string;
  contentKh?: string;
  author: string;
  authorZh: string;
  authorKh?: string;
  date: string;
  readTime: string;
  imageUrl: string;
  category: Category;
  views?: number;
  createdAt?: string;
}

export interface Video {
  id: string;
  title: string;
  titleZh: string;
  titleKh?: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  categoryZh: string;
  views: number;
  date: string;
  presenter?: string;
  presenterZh?: string;
  presenterKh?: string;
  videoUrl?: string;
  createdAt?: string;
}

export interface Audio {
  id: string;
  title: string;
  titleZh: string;
  titleKh?: string;
  artist: string;
  artistZh: string;
  artistKh?: string;
  category: string;
  categoryZh: string;
  coverUrl: string;
  duration: string;
  date: string;
  plays: number;
  audioUrl?: string;
  createdAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  nameZh: string;
  nameKh?: string;
  role: string;
  roleZh: string;
  roleKh?: string;
  bio: string;
  bioZh: string;
  bioKh?: string;
  imageUrl: string;
  views?: number;
  code?: string;
  audioCount?: number;
  bookCount?: number;
  videoCount?: number;
  articleCount?: number;
  totalPlays?: number;
  featuredAudio?: Audio;
  featuredBook?: Book;
  featuredVideo?: Video;
  featuredArticle?: Article;
  latestActivity?: string; // For sorting by newest
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface HistoryItem {
  itemId: string;
  type: 'book' | 'audio' | 'video' | 'article';
  timestamp: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  provider: 'email' | 'google' | 'facebook';
  joinedDate: string;
  bookmarks?: string[];
  history?: HistoryItem[];
}

export type Language = 'en' | 'zh' | 'kh';
export type ViewState = 'books' | 'articles' | 'multimedia' | 'about' | 'audio' | 'admin' | 'profile' | 'my-library';
