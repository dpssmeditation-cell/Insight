import React, { useState, useMemo } from 'react';
import { ARTIST_PROFILES, UI_STRINGS } from '../constants';
import { ArtistCard } from './ArtistCard';
import { ArtistModal } from './ArtistModal';
import { BookModal } from './BookModal';
import { AudioPlayerModal } from './AudioPlayerModal';
import { VideoPlayerModal } from './VideoPlayerModal';
import { Language, Artist, Book, Audio, Video, Article } from '../types';

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_INCREMENT = 4;

interface AboutPageProps {
  language: Language;
  onRead: (book: Book) => void;
  books: Book[];
  audios: Audio[];
  videos: Video[];
  articles: Article[];
}

export const AboutPage: React.FC<AboutPageProps> = ({ language, onRead, books, audios, videos, articles }) => {
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    
    const t = UI_STRINGS[language];

    // Compute all artists dynamically based on ALL current content
    const allArtists: Artist[] = useMemo(() => {
        const artistMap = new Map<string, Artist>();

        // 1. Seed with known profiles to maintain bio/high-res images
        ARTIST_PROFILES.forEach(profile => {
            artistMap.set(profile.name, {
                ...profile,
                bookCount: 0,
                audioCount: 0,
                videoCount: 0,
                articleCount: 0,
                totalPlays: 0,
                views: 0
            });
        });

        // Helper to get or create a profile entry
        const getOrCreate = (name: string, zh?: string, kh?: string) => {
            if (!name) return null;
            if (!artistMap.has(name)) {
                artistMap.set(name, {
                    id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: name,
                    nameZh: zh || name,
                    nameKh: kh || name,
                    role: 'Contributor',
                    roleZh: '贡献者',
                    roleKh: 'អ្នកចូលរួម',
                    bio: 'Regular contributor to the Insight Sharing knowledge base.',
                    bioZh: 'Insight Sharing 知识库的定期贡献者。',
                    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5D3A1A&color=fff&size=512`,
                    bookCount: 0,
                    audioCount: 0,
                    videoCount: 0,
                    articleCount: 0,
                    totalPlays: 0,
                    views: 0
                });
            }
            return artistMap.get(name)!;
        };

        // 2. Process Books
        books.forEach(b => {
            const a = getOrCreate(b.author, b.authorZh, b.authorKh);
            if (a) {
                a.bookCount = (a.bookCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (b.views || 0);
                if (!a.featuredBook || (b.views || 0) > (a.featuredBook.views || 0)) {
                    a.featuredBook = b;
                }
            }
        });

        // 3. Process Audios
        audios.forEach(aud => {
            const a = getOrCreate(aud.artist, aud.artistZh, aud.artistKh);
            if (a) {
                a.audioCount = (a.audioCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (aud.plays || 0);
                if (!a.featuredAudio || (aud.plays || 0) > (a.featuredAudio.plays || 0)) {
                    a.featuredAudio = aud;
                }
            }
        });

        // 4. Process Videos
        videos.forEach(v => {
            // Using presenter name if available
            const name = v.presenter || 'Insight Team';
            const a = getOrCreate(name, v.presenterZh, v.presenterKh);
            if (a) {
                a.videoCount = (a.videoCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (v.views || 0);
                if (!a.featuredVideo || (v.views || 0) > (a.featuredVideo.views || 0)) {
                    a.featuredVideo = v;
                }
            }
        });

        // 5. Process Articles
        articles.forEach(art => {
            const a = getOrCreate(art.author, art.authorZh, art.authorKh);
            if (a) {
                a.articleCount = (a.articleCount || 0) + 1;
                a.totalPlays = (a.totalPlays || 0) + (art.views || 0);
            }
        });

        // Convert Map to array and filter out those with zero content (if any remained empty)
        return Array.from(artistMap.values())
            .filter(a => (a.bookCount || 0) + (a.audioCount || 0) + (a.videoCount || 0) + (a.articleCount || 0) > 0)
            .sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0)); // Sort by popularity
    }, [books, audios, videos, articles]);

    const visibleArtists = allArtists.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_INCREMENT);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-12 border-b border-slate-200 pb-10 text-center">
                <span className="text-amber-900 font-bold uppercase tracking-widest text-xs mb-2 block">{language === 'zh' ? '团队' : (language === 'kh' ? 'ក្រុមការងារ' : 'The Team')}</span>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-serif tracking-tight">
                    {language === 'zh' ? '贡献者与艺术家' : (language === 'kh' ? 'សិល្បករ និងអ្នកចូលរួម' : 'Authors & Artists')}
                </h1>
                <p className={`text-slate-500 font-serif italic text-lg max-w-3xl mx-auto leading-relaxed ${language === 'zh' ? 'chinese-text' : ''}`}>
                    {language === 'zh' 
                      ? '结识致力于复兴五千年神传文化的杰出人才。通过舞蹈、音乐、学术研究和艺术，他们让古老的智慧重焕生机。'
                      : (language === 'kh' 
                          ? 'ស្វែងយល់ពីក្រុមការងារដែលឧទ្ទិសខ្លួនដើម្បីវប្បធម៌ប្រពៃណី ៥០០០ ឆ្នាំ។'
                          : 'Meet the talented individuals dedicated to reviving 5,000 years of traditional culture. Through music, literature, historical research, and art, they bring ancient wisdom to life.')}
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
                        className="px-6 py-2 border border-slate-300 text-slate-600 rounded-full hover:border-amber-900 hover:text-amber-900 transition-colors font-medium text-sm"
                    >
                        {t.loadMore}
                    </button>
                 </div>
            )}

            <div className="mt-20 py-16 bg-slate-50 rounded-xl text-center px-4">
                <h2 className={`text-2xl font-serif font-bold text-slate-900 mb-4 ${language === 'zh' ? 'chinese-text' : ''}`}>
                    {language === 'zh' ? '加入我们的旅程' : (language === 'kh' ? 'ចូលរួមជាមួយពួកយើង' : 'Join Our Journey')}
                </h2>
                <p className={`text-slate-600 max-w-2xl mx-auto mb-8 ${language === 'zh' ? 'chinese-text' : ''}`}>
                    {language === 'zh' ? '我们一直在寻找充满热情的人才，帮助我们保护和分享这些人类瑰宝。' : (language === 'kh' ? 'យើងតែងតែស្វែងរកអ្នកដែលមានចំណាប់អារម្មណ៍ក្នុងការថែរក្សាប្រាជ្ញាបុរាណ។' : 'We are always looking for passionate individuals to help us preserve and share these treasures of humanity.')}
                </p>
                <button className="bg-amber-900 hover:bg-amber-800 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
                    {t.contactUs}
                </button>
            </div>

            {/* Artist Modal */}
            {selectedArtist && (
                <ArtistModal 
                    artist={selectedArtist} 
                    onClose={() => setSelectedArtist(null)} 
                    language={language}
                    onAudioClick={(a) => setSelectedAudio(a)}
                    onBookClick={(b) => setSelectedBook(b)}
                    onVideoClick={(v) => setSelectedVideo(v)}
                />
            )}

            {/* Secondary Modals */}
            {selectedAudio && (
                <AudioPlayerModal 
                    audio={selectedAudio} 
                    onClose={() => setSelectedAudio(null)} 
                    language={language} 
                />
            )}

            {selectedBook && (
                <BookModal 
                    book={selectedBook} 
                    onClose={() => setSelectedBook(null)} 
                    language={language} 
                    onRead={onRead}
                />
            )}

            {selectedVideo && (
                <VideoPlayerModal 
                    video={selectedVideo} 
                    onClose={() => setSelectedVideo(null)} 
                    language={language} 
                />
            )}
        </div>
    )
}
