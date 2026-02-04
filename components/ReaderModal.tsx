
import React, { useState, useEffect } from 'react';
import { Book, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface ReaderModalProps {
    book: Book;
    onClose: () => void;
    language: Language;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose, language }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Use a reliable default PDF if none provided, or a specific demo PDF
    const rawPdfUrl = book.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    // Construct Google Docs Viewer URL for reliable embedding
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawPdfUrl)}&embedded=true`;

    const t = UI_STRINGS[language];

    const getLocalizedTitle = () => {
        if (language === 'zh') return book.titleZh;
        if (language === 'kh' && book.titleKh) return book.titleKh;
        return book.title;
    };

    const getLocalizedAuthor = () => {
        if (language === 'zh') return book.authorZh;
        if (language === 'kh' && book.authorKh) return book.authorKh;
        return book.author;
    };


    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 lg:p-8">
            {/* Backdrop - lighter opacity to show context behind (Popup effect) */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
            ></div>

            {/* Modal Container - Window style */}
            <div className="relative w-full h-full sm:h-[90vh] max-w-6xl bg-white dark:bg-slate-900 shadow-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-scale-in border border-slate-200 dark:border-slate-700 ring-1 ring-black/5">

                {/* Professional Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 md:px-6 md:py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-9 h-9 bg-amber-900 dark:bg-amber-700 text-white items-center justify-center rounded-lg font-serif font-bold text-xs shadow-inner">
                            IS
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 font-black">
                                    {t.digitalReader}
                                </span>
                                <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{book.fileSize || '2.4 MB'}</span>
                            </div>
                            <h2 className={`font-serif font-bold text-slate-900 dark:text-white text-lg leading-tight truncate ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
                                {getLocalizedTitle()}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-1">
                            <a
                                href={rawPdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-900 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                title={t.openNewTab}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <button
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-900 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                title="Print"
                                onClick={() => window.print()}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
                            </button>
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                        <button
                            onClick={onClose}
                            className="group flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <span>Close</span>
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-grow bg-slate-100 dark:bg-[#0a0a0a] relative overflow-hidden">
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0a0a0a] transition-opacity duration-500">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-amber-900 dark:border-t-amber-500 rounded-full animate-spin mb-6"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-serif italic text-sm animate-pulse">
                                Opening the archives of wisdom...
                            </p>
                        </div>
                    )}

                    {hasError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12 text-slate-500 animate-fade-in">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 text-red-400 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Resource temporarily unavailable</h3>
                            <p className="mb-8 max-w-md mx-auto text-slate-500 dark:text-slate-400 leading-relaxed">
                                We're having trouble embedding the digital copy of "{getLocalizedTitle()}" directly. You can still access it by opening it in a new tab.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href={rawPdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-amber-900 dark:bg-amber-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-amber-800 dark:hover:bg-amber-600 transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Manual View / Download
                                </a>
                                <button
                                    onClick={onClose}
                                    className="px-10 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Close Reader
                                </button>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={googleDocsViewerUrl}
                            className={`w-full h-full border-none transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            title={getLocalizedTitle()}
                            onLoad={() => setIsLoading(false)}
                            onError={() => setHasError(true)}
                        ></iframe>
                    )}
                </div>

                {/* Immersive Footer Detail */}
                <div className={`hidden md:flex px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
                    <div className="flex items-center gap-4">
                        <span>Insight Sharing Digital Archives</span>
                        <span className="h-1 w-1 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
                        <span>{getLocalizedAuthor()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-amber-700/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        <span>{language === 'zh' ? '安全研究会话' : (language === 'kh' ? 'វគ្គសិក្សាស្រាវជ្រាវដែលមានសុវត្ថិភាព' : 'Secure Research Session')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
