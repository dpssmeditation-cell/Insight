
import React, { useState, useMemo } from 'react';
import { User, Language, Book, Audio, Video, HistoryItem, Article } from '../types';
import { UI_STRINGS } from '../constants';

interface MyLibraryPageProps {
    user: User;
    books: Book[];
    audios: Audio[];
    videos: Video[];
    articles: Article[];
    language: Language;
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({ user, books, audios, videos, articles, language }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');

    // Helper to find item details
    // Fixed: Included 'article' in the allowed types and added logic to find articles.
    const getItemDetails = (itemId: string, type: 'book' | 'audio' | 'video' | 'article') => {
        if (type === 'book') return books.find(b => b.id === itemId);
        if (type === 'audio') return audios.find(a => a.id === itemId);
        if (type === 'video') return videos.find(v => v.id === itemId);
        if (type === 'article') return articles.find(ar => ar.id === itemId);
        return null;
    };

    const handleShare = (item: any, type: string, platform: 'facebook' | 'twitter' | 'telegram', e: React.MouseEvent) => {
        e.stopPropagation();
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
        const baseUrl = isLocal ? 'https://insightsharing.org' : (window.location.origin + window.location.pathname);

        let title = language === 'zh' ? item.titleZh : (language === 'kh' ? (item.titleKh || item.title) : item.title);
        let creator = '';

        if (type === 'book' || type === 'article') {
            creator = language === 'zh' ? item.authorZh : item.author;
        } else if (type === 'audio') {
            creator = language === 'zh' ? item.artistZh : item.artist;
        } else {
            creator = item.presenter || (language === 'zh' ? item.categoryZh : item.category);
        }

        let text = '';
        if (language === 'zh') {
            text = type === 'book'
                ? `在 Insight Sharing 数字图书馆查看 ${creator} 的《${title}》`
                : type === 'article'
                    ? `在 Insight Sharing 阅读 ${creator} 的文章《${title}》`
                    : type === 'audio'
                        ? `在 Insight Sharing 收听 ${creator} 的《${title}》`
                        : `在 Insight Sharing 观看《${title}》`;
        } else {
            text = type === 'book'
                ? `Check out "${title}" by ${creator} on Insight Sharing Digital Library`
                : type === 'article'
                    ? `Read "${title}" by ${creator} on Insight Sharing`
                    : type === 'audio'
                        ? `Listen to "${title}" by ${creator} on Insight Sharing`
                        : `Watch "${title}" on Insight Sharing`;
        }

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
                break;
        }
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const historyItems = useMemo(() => {
        return (user.history || []).map(h => {
            const item = getItemDetails(h.itemId, h.type);
            return item ? { ...h, details: item } : null;
        }).filter(Boolean).reverse(); // Newest first
    }, [user.history, books, audios, videos, articles]);

    const renderItemCard = (item: any, type: string, timestamp?: string) => {
        let title = language === 'zh' ? item.titleZh : (language === 'kh' ? (item.titleKh || item.title) : item.title);
        let creator = '';
        let image = '';

        if (type === 'book') {
            creator = language === 'zh' ? item.authorZh : item.author;
            image = item.coverUrl;
        } else if (type === 'audio') {
            creator = language === 'zh' ? item.artistZh : item.artist;
            image = item.coverUrl;
        } else if (type === 'article') {
            // Handle article card fields
            creator = language === 'zh' ? item.authorZh : item.author;
            image = item.imageUrl;
        } else {
            creator = item.presenter || (language === 'zh' ? item.categoryZh : item.category);
            image = item.thumbnailUrl;
        }

        return (
            <div key={`${type}-${item.id}-${timestamp}`} className="flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-20 h-28 flex-shrink-0 bg-slate-200 rounded-md overflow-hidden relative">
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1 uppercase">
                        {type}
                    </div>
                </div>
                <div className="flex flex-col flex-grow">
                    <h3 className={`text-lg font-bold text-slate-900 mb-1 line-clamp-1 ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{title}</h3>
                    <p className={`text-slate-500 text-sm mb-2 ${language === 'zh' ? 'chinese-text' : ''}`}>{creator}</p>
                    {timestamp && (
                        <p className="text-xs text-slate-400 mt-auto">
                            Last viewed: {new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <button
                            onClick={(e) => handleShare(item, type, 'facebook', e)}
                            className="w-8 h-8 bg-slate-100 hover:bg-white text-slate-700 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110"
                            title="Share on Facebook"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                        </button>
                        <button
                            onClick={(e) => handleShare(item, type, 'twitter', e)}
                            className="w-8 h-8 bg-slate-100 hover:bg-white text-slate-700 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110"
                            title="Share on X (Twitter)"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
                        </button>
                        <button
                            onClick={(e) => handleShare(item, type, 'telegram', e)}
                            className="w-8 h-8 bg-slate-100 hover:bg-white text-slate-700 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110"
                            title="Share on Telegram"
                        >
                            <svg className="w-4 h-4 ml-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                        </button>
                    </div>
                    <button className="text-amber-900 font-bold text-sm hover:underline px-3 py-1 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        {(type === 'book' || type === 'article') ? 'Read Again' : 'Play Again'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-10">
            <div className="mb-8 border-b border-slate-200 pb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">My Library</h1>
                    <p className="text-slate-500">Your personal collection and reading history.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'bookmarks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Bookmarks
                    </button>
                </div>
            </div>

            {activeTab === 'history' && (
                <div className="space-y-4">
                    {historyItems.length > 0 ? (
                        historyItems.map((h: any) => renderItemCard(h.details, h.type, h.timestamp))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">No History Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Items you read or listen to will appear here automatically.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'bookmarks' && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Bookmarks</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Use the bookmark icon on any item to save it to your library.</p>
                </div>
            )}
        </div>
    );
};
