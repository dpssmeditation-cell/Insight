import React, { useState, useEffect } from 'react';
import { VIDEO_CATEGORIES, UI_STRINGS } from '../constants';
import { VideoCard } from './VideoCard';
import { VideoPlayerModal } from './VideoPlayerModal';
import { Language, Video } from '../types';
import { firebaseService } from '../services/firebaseService';

const INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_INCREMENT = 4;

interface MultimediaPageProps {
    language: Language;
    videos: Video[];
    onVideoPlay?: (video: Video) => void;
}

export const MultimediaPage: React.FC<MultimediaPageProps> = ({ language, videos, onVideoPlay }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const t = UI_STRINGS[language];

    const filteredVideos = videos.filter(v => selectedCategory === 'All' || v.category === selectedCategory);
    const visibleVideos = filteredVideos.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_INCREMENT);
    };

    // Reset visibility when category changes
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [selectedCategory]);

    return (
        <div className="animate-fade-in">
            <div className="mb-10 border-b border-slate-200 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 font-serif tracking-tight">{t.multimedia}</h1>
                <p className="text-slate-500 font-serif italic text-lg max-w-2xl">
                    {language === 'zh' ? '通过纪录片、访谈和艺术表演探索历史。' : 'Explore the history through documentaries, interviews, and artistic performances.'}
                </p>
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
                {visibleVideos.map(video => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        language={language}
                        onPlay={(video) => {
                            firebaseService.incrementView('videos', video.id);
                            setPlayingVideo(video);
                            if (onVideoPlay) onVideoPlay(video);
                        }}
                    />
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