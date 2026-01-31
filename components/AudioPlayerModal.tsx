import React, { useState, useEffect, useRef } from 'react';
import { Audio, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface AudioPlayerModalProps {
  audio: Audio;
  onClose: () => void;
  language: Language;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ audio, onClose, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMounted = useRef(true);
  const t = UI_STRINGS[language];

  // Helper for safe playback
  const safePlay = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        if (isMounted.current) {
          setIsPlaying(true);
        }
      } catch (error: any) {
        // AbortError is common when unmounting; ignore it.
        // Other errors (like autoplay blocks) can be logged.
        if (error.name !== 'AbortError' && isMounted.current) {
          console.warn("Audio playback issue:", error.message);
          setIsPlaying(false);
        }
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    // Initial attempt to play
    safePlay();

    return () => {
      isMounted.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Stop resource loading immediately
        audioRef.current.load();
      }
    };
  }, []);

  // Handle manual play/pause toggles
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Only call play if it's actually paused to avoid interrupting existing play requests
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => {
          if (e.name !== 'AbortError') console.debug("Manual play interrupted:", e.message);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current && isMounted.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (dur > 0) {
        setCurrentTime(current);
        setDuration(dur);
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.min(Math.max(x / width, 0), 1);
        const newTime = percentage * duration;
        
        audioRef.current.currentTime = newTime;
        setProgress(percentage * 100);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnded = () => {
    if (isMounted.current) {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <audio 
        ref={audioRef}
        src={audio.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up transform transition-all">
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 md:p-10 flex flex-col items-center">
          <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 group">
            <div className="absolute inset-0 bg-amber-900/20 rounded-2xl blur-2xl group-hover:bg-amber-900/30 transition-all duration-700"></div>
            <img 
              src={audio.coverUrl} 
              alt={language === 'zh' ? audio.titleZh : audio.title}
              className="relative w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
            />
            <div className="absolute -bottom-3 -right-3 bg-amber-900 text-white p-3 rounded-full shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-800 font-bold mb-2 block">
              {language === 'zh' ? '正在播放' : 'Now Playing'}
            </span>
            <h2 className={`text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2 leading-tight ${language === 'zh' ? 'chinese-text' : ''}`}>
              {language === 'zh' ? audio.titleZh : audio.title}
            </h2>
            <p className={`text-slate-500 font-medium text-lg ${language === 'zh' ? 'chinese-text' : ''}`}>
              {language === 'zh' ? audio.artistZh : audio.artist}
            </p>
          </div>

          <div className="w-full mb-8">
            <div 
                className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden cursor-pointer group"
                onClick={handleSeek}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-amber-900 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mb-8">
            <button 
                className="text-slate-300 hover:text-amber-900 transition-colors"
                onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime -= 10;
                }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 bg-amber-900 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-amber-800 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button 
                className="text-slate-300 hover:text-amber-900 transition-colors"
                onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime += 10;
                }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            </button>
          </div>

          <div className="w-full max-w-[200px] flex items-center gap-3">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div className="relative flex-grow h-1 bg-slate-100 rounded-full cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-slate-400 rounded-full"
                style={{ width: `${volume}%` }}
              />
              <input 
                type="range" 
                min="0" max="100" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};