import React, { useState, useEffect } from 'react';
import { VIDEO_CATEGORIES, UI_STRINGS } from '../constants';
import { VideoCard } from './VideoCard';
import { VideoPlayerModal } from './VideoPlayerModal';
import { Language, Video } from '../types';
import { firebaseService } from '../services/firebaseService';
import { SearchBar } from './SearchBar';
import { AdvancedFilters } from './AdvancedSearchModal';
import { evaluateQuery } from '../utils/searchUtils';

const INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_INCREMENT = 4;

interface MultimediaPageProps {
    language: Language;
    videos: Video[];
    onVideoPlay?: (video: Video) => void;
    initialId?: string | null;
}

export const MultimediaPage: React.FC<MultimediaPageProps> = ({ language, videos, onVideoPlay, initialId }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

    const t = UI_STRINGS[language];

    const filteredVideos = videos.filter(v => {
        // 1. Matches Category
        const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;

        // 2. Matches Advanced Filters
        let matchesAdvanced = true;
        if (Object.keys(advancedFilters).length > 0) {
            if (advancedFilters.category && advancedFilters.category !== 'All' && v.category !== advancedFilters.category) {
                matchesAdvanced = false;
            }
            if (advancedFilters.author && (!v.presenter || (!v.presenter.toLowerCase().includes(advancedFilters.author.toLowerCase()) && !v.presenterZh?.includes(advancedFilters.author)))) {
                matchesAdvanced = false;
            }
            const year = v.date ? parseInt(v.date.split('-')[0]) : 0;
            if (advancedFilters.yearFrom && year < parseInt(advancedFilters.yearFrom)) {
                matchesAdvanced = false;
            }
            if (advancedFilters.yearTo && year > parseInt(advancedFilters.yearTo)) {
                matchesAdvanced = false;
            }
            if (advancedFilters.query && !evaluateQuery(v, advancedFilters.query, ['title', 'titleZh', 'presenter', 'presenterZh'])) {
                matchesAdvanced = false;
            }
        }

        // 3. Simple Search
        let matchesSearch = true;
        if (!advancedFilters.query && searchQuery) {
            matchesSearch = evaluateQuery(v, searchQuery, ['title', 'titleZh', 'presenter', 'presenterZh']);
        }

        return matchesCategory && matchesAdvanced && matchesSearch;
    });
    const visibleVideos = filteredVideos.slice(0, visibleCount);

    // Sync state to URL and handle initial ID
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (playingVideo) {
            params.set('id', playingVideo.id);
        } else {
            params.delete('id');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    }, [playingVideo]);

    useEffect(() => {
        if (initialId && videos.length > 0) {
            const video = videos.find(v => v.id === initialId);
            if (video) setPlayingVideo(video);
        }
    }, [initialId, videos.length]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_INCREMENT);
    };

    // Reset visibility when category/search changes
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [selectedCategory, searchQuery, advancedFilters]);

    return (
        <div className="animate-fade-in">
            <div className="mb-10 border-b border-slate-200 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 font-serif tracking-tight">{t.multimedia}</h1>
                <p className="text-slate-500 font-serif italic text-lg max-w-2xl">
                    {language === 'zh' ? '通过纪录片、访谈和艺术表演探索历史。' : 'Explore the history through documentaries, interviews, and artistic performances.'}
                </p>
            </div>

            <div className="mb-8">
                <SearchBar
                    language={language}
                    type="multimedia"
                    onSearch={(q) => { setSearchQuery(q); setAdvancedFilters({}); }}
                    onAdvancedSearch={(filters) => { setAdvancedFilters(filters); setSearchQuery(''); if (filters.category) setSelectedCategory(filters.category); }}
                />
            </div>
            <div className="flex overflow-x-auto pb-4 gap-2 mb-8 scrollbar-hide">
                {VIDEO_CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                            ? 'bg-amber-900 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-900 hover:text-amber-900'
                            } ${language === 'zh' ? 'chinese-text' : ''}`}
                    >
                        {cat === 'All' ? t.all : cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                {visibleVideos.map((video, index) => (
                    <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}>
                        <VideoCard
                            video={video}
                            language={language}
                            onPlay={(video) => {
                                firebaseService.incrementView('videos', video.id);
                                setPlayingVideo(video);
                                if (onVideoPlay) onVideoPlay(video);
                            }}
                        />
                    </div>
                ))}
            </div>

            {visibleCount < filteredVideos.length && (
                <div className="mt-12 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 border border-slate-300 text-slate-600 rounded-full hover:border-amber-900 hover:text-amber-900 transition-colors font-medium text-sm"
                    >
                        {t.loadMore}
                    </button>
                </div>
            )}

            {playingVideo && (
                <VideoPlayerModal
                    video={playingVideo}
                    onClose={() => setPlayingVideo(null)}
                    language={language}
                />
            )}
        </div>
    )
}