
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
             <div className="flex items-center">
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
