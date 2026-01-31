import React from 'react';
import { Book, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface ReaderModalProps {
  book: Book;
  onClose: () => void;
  language: Language;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose, language }) => {
  // Use a reliable default PDF if none provided
  const rawPdfUrl = book.pdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
  
  // Construct Google Docs Viewer URL for reliable embedding
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawPdfUrl)}&embedded=true`;
  
  const t = UI_STRINGS[language];

  const getLocalizedTitle = () => {
    if (language === 'zh') return book.titleZh;
    if (language === 'kh' && book.titleKh) return book.titleKh;
    return book.title;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8">
        <div 
            className="absolute inset-0 bg-slate-900/95 dark:bg-black/95 backdrop-blur-md animate-fade-in" 
            onClick={onClose}
        ></div>
        
        <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden flex flex-col animate-fade-in-up border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 md:py-4 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-900 dark:bg-amber-700 text-white flex items-center justify-center rounded font-serif font-bold text-xs">
                        IS
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{t.digitalReader}</span>
                        <h2 className={`font-serif font-bold text-slate-900 dark:text-white text-lg line-clamp-1 leading-tight ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
                            {getLocalizedTitle()}
                        </h2>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className={`text-slate-300 dark:text-slate-600 ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{t.size}:</span>
                        <span>{book.fileSize || '2.4 MB'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <a 
                            href={rawPdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-900 dark:hover:text-amber-500 transition-colors"
                            title={t.openNewTab}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                        <button 
                            onClick={onClose}
                            className="ml-2 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-slate-200 dark:bg-slate-950 relative">
                {/* Use iframe with Google Docs Viewer for reliable embedding */}
                <iframe 
                    src={googleDocsViewerUrl}
                    className="w-full h-full border-none"
                    title={getLocalizedTitle()}
                >
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                        <svg className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="mb-4 font-medium dark:text-slate-400">Unable to display PDF directly in this browser.</p>
                        <a 
                            href={rawPdfUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-amber-900 dark:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-amber-800 dark:hover:bg-amber-600 transition-colors shadow-sm"
                        >
                            Download / View PDF
                        </a>
                    </div>
                </iframe>
            </div>

            <div className={`px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
                <span>© 2025 Insight Sharing</span>
                <span>{language === 'zh' ? '授权研究副本' : (language === 'kh' ? 'ច្បាប់ចម្លងសម្រាប់ការស្រាវជ្រាវ' : 'Authorized Research Copy')}</span>
            </div>
        </div>
    </div>
  );
};