import React from 'react';
import { Video, Language } from '../types';

interface VideoCardProps {
  video: Video;
  language: Language;
  onPlay: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, language, onPlay }) => {
  const handleShare = (platform: 'facebook' | 'twitter' | 'telegram', e: React.MouseEvent) => {
    e.stopPropagation();
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    const baseUrl = isLocal ? 'https://insightsharing.org' : (window.location.origin + window.location.pathname);
    const title = language === 'zh' ? video.titleZh : video.title;
    const text = language === 'zh' ? `观看《${title}》` : `Watch "${title}" on Insight Sharing Digital Library`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`; break;
      case 'telegram': shareUrl = `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div
      className="group cursor-pointer flex flex-col gap-3"
      onClick={() => onPlay(video)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <img src={video.thumbnailUrl} alt={language === 'zh' ? video.titleZh : video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"><svg className="w-5 h-5 text-amber-900 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 text-white/95 text-xs font-semibold drop-shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>
            <span className="translate-y-[1px] font-sans">{(video.views || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm" onClick={(e) => handleShare('facebook', e)}><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></button>
            <button className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm" onClick={(e) => handleShare('twitter', e)}><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg></button>
            <button className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm" onClick={(e) => handleShare('telegram', e)}><svg className="w-3.5 h-3.5 ml-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.8-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg></button>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{video.duration}</div>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">{language === 'zh' ? video.categoryZh : video.category}</span>
          <span className="text-[11px] text-slate-400">{new Date(video.date).toLocaleDateString()}</span>
        </div>
        <h3 className={`font-serif font-bold text-base text-slate-900 group-hover:text-amber-900 leading-tight mb-1 line-clamp-2 ${language === 'zh' ? 'chinese-text' : ''}`}>{language === 'zh' ? video.titleZh : video.title}</h3>
      </div>
    </div>
  );
};