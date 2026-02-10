import React, { useState, useEffect } from 'react';
import { AUDIO_CATEGORIES, UI_STRINGS } from '../constants';
import { AudioCard } from './AudioCard';
import { AudioPlayerModal } from './AudioPlayerModal';
import { Pagination } from './Pagination';
import { Language, Audio } from '../types';
import { firebaseService } from '../services/firebaseService';
import { SearchBar } from './SearchBar';
import { AdvancedFilters } from './AdvancedSearchModal';
import { evaluateQuery } from '../utils/searchUtils';

const ITEMS_PER_PAGE = 8;

interface AudioPageProps {
    language: Language;
    audios: Audio[];
    onAudioPlay?: (audio: Audio) => void;
    initialId?: string | null;
}

export const AudioPage: React.FC<AudioPageProps> = ({ language, audios, onAudioPlay, initialId }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [playingAudio, setPlayingAudio] = useState<Audio | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
    const t = UI_STRINGS[language];

    // Sync state to URL and handle initial ID
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (playingAudio) {
            params.set('id', playingAudio.id);
        } else {
            params.delete('id');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    }, [playingAudio]);

    useEffect(() => {
        if (initialId && audios.length > 0) {
            const audio = audios.find(a => a.id === initialId);
            if (audio) setPlayingAudio(audio);
        }
    }, [initialId, audios.length]);

    // Reset pagination when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery, advancedFilters]);

    const filteredAudios = audios.filter(a => {
        // 1. Matches Category
        const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;

        // 2. Matches Advanced Filters
        let matchesAdvanced = true;
        if (Object.keys(advancedFilters).length > 0) {
            if (advancedFilters.category && advancedFilters.category !== 'All' && a.category !== advancedFilters.category) {
                matchesAdvanced = false;
            }
            if (advancedFilters.author && !a.artist.toLowerCase().includes(advancedFilters.author.toLowerCase()) && !a.artistZh.includes(advancedFilters.author)) {
                matchesAdvanced = false;
            }
            const year = a.date ? parseInt(a.date.split('-')[0]) : 0;
            if (advancedFilters.yearFrom && year < parseInt(advancedFilters.yearFrom)) {
                matchesAdvanced = false;
            }
            if (advancedFilters.yearTo && year > parseInt(advancedFilters.yearTo)) {
                matchesAdvanced = false;
            }
            if (advancedFilters.query && !evaluateQuery(a, advancedFilters.query, ['title', 'titleZh', 'artist', 'artistZh'])) {
                matchesAdvanced = false;
            }
        }

        // 3. Simple Search
        let matchesSearch = true;
        if (!advancedFilters.query && searchQuery) {
            matchesSearch = evaluateQuery(a, searchQuery, ['title', 'titleZh', 'artist', 'artistZh']);
        }

        return matchesCategory && matchesAdvanced && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredAudios.length / ITEMS_PER_PAGE);
    const displayedAudios = filteredAudios.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-10 border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 font-serif tracking-tight">{t.audioLibrary}</h1>
                    <p className="text-slate-500 font-serif italic text-lg max-w-2xl">
                        {language === 'zh' ? '沉浸在五千年文明的旋律与圣贤智慧中。' : 'Immerse yourself in the melodies of the Middle Kingdom and the wisdom of the ages.'}
                    </p>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                    <SearchBar
                        language={language}
                        type="audio"
                        onSearch={(q) => { setSearchQuery(q); setAdvancedFilters({}); }}
                        onAdvancedSearch={(filters) => { setAdvancedFilters(filters); setSearchQuery(''); if (filters.category) setSelectedCategory(filters.category); }}
                    />
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-fit">
                        <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        <span>{audios.length} {t.totalTracks}</span>
                    </div>
                </div>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-2 mb-8 scrollbar-hide">
                {AUDIO_CATEGORIES.map(cat => (
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                {displayedAudios.map(audio => (
                    <AudioCard
                        key={audio.id}
                        audio={audio}
                        language={language}
                        onPlay={(audio) => {
                            firebaseService.incrementView('audios', audio.id);
                            setPlayingAudio(audio);
                            if (onAudioPlay) onAudioPlay(audio);
                        }}
                    />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <div className="mt-16 py-12 bg-slate-900 rounded-2xl text-center px-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h2 className={`text-2xl font-serif font-bold text-white mb-3 ${language === 'zh' ? 'chinese-text' : ''}`}>{language === 'zh' ? '神韵交响乐团' : 'Shen Yun Symphony Orchestra'}</h2>
                    <p className={`text-slate-400 max-w-2xl mx-auto mb-8 text-sm leading-relaxed ${language === 'zh' ? 'chinese-text' : ''}`}>
                        {language === 'zh' ? '体验神韵原创作品，将中国音乐的精神与西方交响乐的力量完美融合。' : 'Experience the original compositions of Shen Yun, blending the spirit of Chinese music with the power of a Western orchestra.'}
                    </p>
                    <button className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-amber-900/50 flex items-center gap-2 mx-auto">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        {t.listenNow}
                    </button>
                </div>
            </div>

            {playingAudio && (
                <AudioPlayerModal
                    audio={playingAudio}
                    onClose={() => setPlayingAudio(null)}
                    language={language}
                />
            )}
        </div>
    )
}