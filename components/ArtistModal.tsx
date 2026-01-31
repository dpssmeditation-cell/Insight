import React from 'react';
import { Artist, Language, Audio, Book, Video } from '../types';
import { UI_STRINGS } from '../constants';

interface ArtistModalProps {
  artist: Artist;
  onClose: () => void;
  language: Language;
  onAudioClick: (audio: Audio) => void;
  onBookClick: (book: Book) => void;
  onVideoClick: (video: Video) => void;
}

export const ArtistModal: React.FC<ArtistModalProps> = ({ 
  artist, 
  onClose, 
  language,
  onAudioClick,
  onBookClick,
  onVideoClick
}) => {
  const t = UI_STRINGS[language];
  const isKhmer = language === 'kh';

  const getLocalizedName = () => {
    if (language === 'zh') return artist.nameZh;
    if (language === 'kh') return artist.nameKh || artist.name;
    return artist.name;
  };

  const getLocalizedRole = () => {
    if (language === 'zh') return artist.roleZh;
    if (language === 'kh') return artist.roleKh || artist.role;
    return artist.role;
  };

  const getLocalizedBio = () => {
    if (language === 'zh') return artist.bioZh;
    return artist.bio;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative bg-[#1a1a1a] text-slate-200 rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in-up border border-slate-700 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-[#111] shrink-0">
          <h2 className={`text-lg font-medium ${isKhmer ? 'khmer-text' : ''}`}>
            {getLocalizedRole()}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/4 flex flex-col items-center">
               <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl mb-6 bg-slate-800">
                  <img 
                      src={artist.imageUrl} 
                      alt={artist.name} 
                      className="w-full h-full object-cover"
                  />
               </div>
               <div className="text-center">
                  <p className="text-lg font-medium text-slate-300">
                    {t.artistCode}: {artist.code || 'CT'}
                  </p>
               </div>
            </div>

            <div className="md:w-3/4 flex flex-col">
              <div className="mb-8">
                 <h1 className="text-3xl font-bold text-white mb-4">{getLocalizedName()}</h1>
                 <p className="text-slate-400 leading-relaxed italic">{getLocalizedBio()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 mb-10 text-base">
                  <div className="flex gap-4 items-center">
                      <span className="text-slate-500 w-32 text-xs uppercase font-bold tracking-wider">{t.audioAlbums}</span>
                      <span className="text-amber-500 font-medium">
                          {artist.audioCount || 0} {t.totalTracks}
                      </span>
                  </div>
                  <div className="flex gap-4 items-center">
                      <span className="text-slate-500 w-32 text-xs uppercase font-bold tracking-wider">{t.bookAlbums}</span>
                      <span className="text-amber-500 font-medium">
                          {artist.bookCount || 0} {language === 'zh' ? '部作品' : 'collections'}
                      </span>
                  </div>
                  <div className="flex gap-4 items-center">
                      <span className="text-slate-500 w-32 text-xs uppercase font-bold tracking-wider">{t.videoAlbums}</span>
                      <span className="text-amber-500 font-medium">
                          {artist.videoCount || 0} {t.videos}
                      </span>
                  </div>
                  <div className="flex gap-4 items-center">
                      <span className="text-slate-500 w-32 text-xs uppercase font-bold tracking-wider">{t.articles}</span>
                      <span className="text-amber-500 font-medium">
                          {artist.articleCount || 0} {language === 'zh' ? '篇文章' : 'articles'}
                      </span>
                  </div>
                  <div className="flex gap-4 md:col-span-2 pt-4 border-t border-slate-800">
                      <span className="text-slate-500 w-32 text-xs uppercase font-bold tracking-wider">{t.totalInteractions}</span>
                      <span className="text-white font-mono text-lg">{(artist.totalPlays || 0).toLocaleString()}</span>
                  </div>
              </div>

              <div className="border border-slate-700 rounded-sm overflow-hidden bg-[#242424]">
                  <div className="bg-[#111] py-3 text-center border-b border-slate-700 font-bold tracking-wide text-xs uppercase text-slate-400">
                      {t.mostPopular}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-700">
                      <div className="flex flex-col">
                          <div className="bg-[#2a2a2a] py-2 text-center border-b border-slate-700 text-xs font-bold text-slate-500 uppercase">
                              {t.audio}
                          </div>
                          <div className="p-4 flex flex-col items-center min-h-[160px] justify-center">
                              {artist.featuredAudio ? (
                                  <div className="cursor-pointer group text-center" onClick={() => onAudioClick(artist.featuredAudio!)}>
                                      <div className="relative w-24 h-24 mb-3 rounded-sm overflow-hidden border border-slate-600 shadow-md transition-transform group-hover:scale-105 mx-auto">
                                          <img src={artist.featuredAudio.coverUrl} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                      </div>
                                      <p className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-amber-500 transition-colors">
                                          {language === 'zh' ? artist.featuredAudio.titleZh : artist.featuredAudio.title}
                                      </p>
                                  </div>
                              ) : <p className="text-slate-600 text-[10px] italic">{t.none}</p>}
                          </div>
                      </div>

                      <div className="flex flex-col">
                          <div className="bg-[#2a2a2a] py-2 text-center border-b border-slate-700 text-xs font-bold text-slate-500 uppercase">
                              {t.books}
                          </div>
                          <div className="p-4 flex flex-col items-center min-h-[160px] justify-center">
                               {artist.featuredBook ? (
                                  <div className="cursor-pointer group text-center" onClick={() => onBookClick(artist.featuredBook!)}>
                                      <div className="relative w-24 h-32 mb-3 rounded-sm overflow-hidden border border-slate-600 shadow-md transition-transform group-hover:scale-105 mx-auto">
                                          <img src={artist.featuredBook.coverUrl} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                      </div>
                                      <p className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-amber-500 transition-colors">
                                          {language === 'zh' ? artist.featuredBook.titleZh : artist.featuredBook.title}
                                      </p>
                                  </div>
                              ) : <p className="text-slate-600 text-[10px] italic">{t.none}</p>}
                          </div>
                      </div>

                      <div className="flex flex-col">
                          <div className="bg-[#2a2a2a] py-2 text-center border-b border-slate-700 text-xs font-bold text-slate-500 uppercase">
                              {t.videos}
                          </div>
                          <div className="p-4 flex flex-col items-center min-h-[160px] justify-center">
                              {artist.featuredVideo ? (
                                  <div className="cursor-pointer group text-center" onClick={() => onVideoClick(artist.featuredVideo!)}>
                                      <div className="relative w-28 h-18 mb-3 rounded-sm overflow-hidden border border-slate-600 shadow-md transition-transform group-hover:scale-105 mx-auto">
                                          <img src={artist.featuredVideo.thumbnailUrl} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                      </div>
                                      <p className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-amber-500 transition-colors">
                                          {language === 'zh' ? artist.featuredVideo.titleZh : artist.featuredVideo.title}
                                      </p>
                                  </div>
                              ) : <p className="text-slate-600 text-[10px] italic">{t.none}</p>}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};