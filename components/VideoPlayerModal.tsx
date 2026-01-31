import React, { useState, useEffect, useRef } from 'react';
import { Video, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface VideoPlayerModalProps {
  video: Video;
  onClose: () => void;
  language: Language;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMounted = useRef(true);
  const t = UI_STRINGS[language];

  useEffect(() => {
    isMounted.current = true;
    return () => {
        isMounted.current = false;
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
            videoRef.current.load();
        }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
        videoRef.current.play().catch(e => {
            // Ignore AbortError caused by removing element during playback start
            if (e.name !== 'AbortError' && isMounted.current) {
              console.warn("Video playback issue:", e.message);
            }
        });
    }
  }, [isPlaying]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    const text = `Check out "${video.title}" on Insight Sharing`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative bg-[#0b0f19] rounded-[20px] shadow-2xl w-full max-w-[1000px] overflow-hidden animate-fade-in-up transform transition-all border border-slate-800/50">
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="aspect-video w-full bg-black flex items-center justify-center relative group">
          {isPlaying ? (
              <video 
                ref={videoRef}
                src={video.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                className="w-full h-full"
                controls
              />
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-[#3a2e26]/80 hover:bg-[#C26B2C] text-white/90 hover:text-white rounded-full flex items-center justify-center mb-6 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                    <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                <p className={`text-slate-400 font-medium text-sm tracking-wide ${language === 'zh' ? 'chinese-text' : ''}`}>
                    {language === 'zh' ? '正在流式传输高清内容...' : (language === 'kh' ? 'កំពុងចាក់បញ្ជូនកម្រិតច្បាស់ខ្ពស់...' : 'Streaming high-quality content...')}
                </p>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-[#0F1216] text-white border-t border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] uppercase tracking-widest text-[#E6B063] font-bold bg-[#1C1610] border border-[#E6B063]/20 px-2 py-1 rounded-[2px] ${language === 'zh' ? 'chinese-text' : ''}`}>
                  {language === 'zh' ? video.categoryZh : video.category}
                </span>
                <span className="text-[#64748B] text-sm font-medium">
                  {new Date(video.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : (language === 'kh' ? 'km-KH' : 'en-US'), { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h2 className={`text-2xl md:text-3xl font-serif font-bold tracking-tight mb-2 text-white leading-tight ${language === 'zh' ? 'chinese-text' : ''}`}>
                {language === 'zh' ? video.titleZh : video.title}
              </h2>
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm font-medium">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                 <span>{(video.views || 0).toLocaleString()} {language === 'zh' ? '次观看' : (language === 'kh' ? 'ដង' : 'views')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
               <button 
                onClick={() => setIsPlaying(true)}
                className={`flex items-center gap-2 px-8 py-3 bg-[#C26B2C] hover:bg-[#A65822] text-white rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-orange-900/20 active:scale-95 ${language === 'zh' ? 'chinese-text' : ''}`}
               >
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 {language === 'zh' ? '播放' : (language === 'kh' ? 'ចាក់' : 'Play')}
               </button>
               
               <button 
                onClick={handleShare}
                className="w-11 h-11 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};