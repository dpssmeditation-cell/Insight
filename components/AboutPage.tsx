
// Added missing React import to resolve "Cannot find namespace 'React'" error.
import React, { useState, useMemo } from 'react';
import { ARTIST_PROFILES, UI_STRINGS } from '../constants';
import { ArtistCard } from './ArtistCard';
import { ArtistModal } from './ArtistModal';
import { BookModal } from './BookModal';
import { AudioPlayerModal } from './AudioPlayerModal';
import { VideoPlayerModal } from './VideoPlayerModal';
import { ArticleModal } from './ArticleModal';
import { Language, Artist, Book, Audio, Video, Article } from '../types';

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_INCREMENT = 4;

interface AboutPageProps {
    language: Language;
    onRead: (book: Book) => void;
    onBookClick?: (book: Book) => void;
    onArticleClick?: (article: Article) => void;
    onAudioPlay?: (audio: Audio) => void;
    onVideoPlay?: (video: Video) => void;
    books: Book[];
    audios: Audio[];
    videos: Video[];
    articles: Article[];
}

export const AboutPage: React.FC<AboutPageProps> = ({
    language,
    onRead,
    onBookClick,
    onArticleClick,
    onAudioPlay,
    onVideoPlay,
    books,
    audios,
    videos,
    articles
}) => {
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const t = UI_STRINGS[language];

    // Compute all artists dynamically based on ALL current content, sorting by newest activity
    const allArtists: Artist[] = useMemo(() => {
        const artistMap = new Map<string, Artist>();

        // Helper to get or create a profile entry and track latest activity
        const getOrCreate = (name: string, zh: string, kh: string | undefined, date?: string) => {
            if (!name) return null;
            let artist = artistMap.get(name);
            if (!artist) {
                artist = {
                    id: `contributor-${name.toLowerCase().replace(/\s+/g, '-')}`,
                    name: name,
                    nameZh: zh || name,
                    nameKh: kh || name,
                    role: 'Contributor',
                    roleZh: '贡献者',
                    roleKh: 'អ្នកចូលរួម',
                    bio: 'Contributor to the Insight Sharing knowledge base.',
                    bioZh: 'Insight Sharing 知识库的贡献者。',
                    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5D3A1A&color=fff&size=512`,
                    bookCount: 0,
                    audioCount: 0,
                    videoCount: 0,
                    articleCount: 0,
                    totalPlays: 0,
                    views: 0,
                    latestActivity: date || '1970-01-01'
                };

                // If it's a seed profile, enhance with details
                const seed = ARTIST_PROFILES.find(p => p.name === name);
                if (seed) {
                    artist = { ...artist, ...seed };
                }

                artistMap.set(name, artist);
            }

            // Update latest activity if current item date is newer
            if (date && date > (artist.latestActivity || '')) {
                artist.latestActivity = date;
            }

            return artist;
        };

        // 1. Process Articles (identify featured article)
        articles.forEach(art => {
            const a = getOrCreate(art.author, art.authorZh, art.authorKh, art.date);
            if (a) {
                a.articleCount = (a.articleCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (art.views || 0);
                if (!a.featuredArticle || (art.views || 0) > (a.featuredArticle.views || 0)) {
                    a.featuredArticle = art;
                }
            }
        });

        // 2. Process Audios
        audios.forEach(aud => {
            const a = getOrCreate(aud.artist, aud.artistZh, aud.artistKh, aud.date);
            if (a) {
                a.audioCount = (a.audioCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (aud.plays || 0);
                if (!a.featuredAudio || (aud.plays || 0) > (a.featuredAudio.plays || 0)) {
                    a.featuredAudio = aud;
                }
            }
        });

        // 3. Process Videos
        videos.forEach(v => {
            const name = v.presenter || 'Insight Team';
            const a = getOrCreate(name, v.presenterZh || name, v.presenterKh, v.date);
            if (a) {
                a.videoCount = (a.videoCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (v.views || 0);
                if (!a.featuredVideo || (v.views || 0) > (a.featuredVideo.views || 0)) {
                    a.featuredVideo = v;
                }
            }
        });

        // 4. Process Books
        books.forEach(b => {
            const a = getOrCreate(b.author, b.authorZh, b.authorKh, '1900-01-01');
            if (a) {
                a.bookCount = (a.bookCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (b.views || 0);
                if (!a.featuredBook || (b.views || 0) > (a.featuredBook.views || 0)) {
                    a.featuredBook = b;
                }
            }
        });

        // Convert Map to array and sort by latestActivity descending
        return Array.from(artistMap.values())
            .sort((a, b) => (b.latestActivity || '').localeCompare(a.latestActivity || ''));
    }, [books, audios, videos, articles]);

    const visibleArtists = allArtists.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_INCREMENT);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-12 border-b border-slate-200 pb-10 text-center">
                <span className="text-amber-900 dark:text-amber-500 font-bold uppercase tracking-widest text-xs mb-2 block">{language === 'zh' ? '团队' : (language === 'kh' ? 'ក្រុមការងារ' : 'Discovery')}</span>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-serif tracking-tight">
                    {language === 'zh' ? '作者与艺术家' : (language === 'kh' ? 'សិល្បករ និងអ្នកចូលរួម' : 'Authors & Artists')}
                </h1>
                <p className={`text-slate-500 dark:text-slate-400 font-serif italic text-lg max-w-3xl mx-auto leading-relaxed ${language === 'zh' ? 'chinese-text' : ''}`}>
                    {language === 'zh'
                        ? '结识致力于复兴五千年神传文化的杰出人才。探索按最新贡献排序的完整贡献者目录。'
                        : 'Meet the talented individuals reviving traditional culture. Explore our full directory of contributors, sorted by their most recent work.'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 gap-y-12">
                {visibleArtists.map(artist => (
                    <div key={artist.id} onClick={() => setSelectedArtist(artist)}>
                        <ArtistCard artist={artist} language={language} />
                    </div>
                ))}
            </div>

            {visibleCount < allArtists.length && (
                <div className="mt-12 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-full hover:border-amber-900 dark:hover:border-amber-500 hover:text-amber-900 dark:hover:text-amber-500 transition-colors font-medium text-sm"
                    >
                        {t.loadMore}
                    </button>
                </div>
            )}

            <div className="mt-20 py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center px-4">
                <h2 className={`text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 ${language === 'zh' ? 'chinese-text' : ''}`}>
                    {language === 'zh' ? '加入我们的旅程' : 'Join Our Journey'}
                </h2>
                <p className={`text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 ${language === 'zh' ? 'chinese-text' : ''}`}>
                    We are always looking for passionate individuals to help us preserve and share these treasures of humanity.
                </p>
                <button className="bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
                    {t.contactUs}
                </button>
            </div>

            {selectedArtist && (
                <ArtistModal
                    artist={selectedArtist}
                    onClose={() => setSelectedArtist(null)}
                    language={language}
                    onAudioClick={(a) => {
                        setSelectedAudio(a);
                        if (onAudioPlay) onAudioPlay(a);
                    }}
                    onBookClick={(b) => {
                        setSelectedBook(b);
                        if (onBookClick) onBookClick(b);
                    }}
                    onVideoClick={(v) => {
                        setSelectedVideo(v);
                        if (onVideoPlay) onVideoPlay(v);
                    }}
                    onArticleClick={(art) => {
                        setSelectedArticle(art);
                        if (onArticleClick) onArticleClick(art);
                    }}
                />
            )}

            {selectedAudio && (
                <AudioPlayerModal audio={selectedAudio} onClose={() => setSelectedAudio(null)} language={language} />
            )}

            {selectedBook && (
                <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} language={language} onRead={onRead} />
            )}

            {selectedVideo && (
                <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} language={language} />
            )}

            {selectedArticle && (
                <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} language={language} />
            )}
        </div>
    )
}
