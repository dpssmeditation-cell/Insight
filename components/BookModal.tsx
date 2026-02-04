import React, { useState, useRef, useEffect } from 'react';
import { Book, ChatMessage, Language } from '../types';
import { generateBookAnalysis } from '../services/geminiService';
import { UI_STRINGS } from '../constants';

interface BookModalProps {
  book: Book;
  onClose: () => void;
  language: Language;
  onRead: (book: Book) => void;
}

export const BookModal: React.FC<BookModalProps> = ({ book, onClose, language, onRead }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const getLocalizedDesc = () => {
    if (language === 'zh') return book.descriptionZh;
    return book.description;
  };

  const getLocalizedCategory = () => {
    if (language === 'zh') return book.categoryZh;
    return book.category;
  };

  const getLocalizedPublisher = () => {
    if (language === 'zh') return book.publisherZh;
    return book.publisher;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);
    const aiResponseText = await generateBookAnalysis(book, userMsg.text);
    setMessages((prev) => [...prev, { role: 'model', text: aiResponseText }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300" />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[650px] animate-fade-in-up transform transition-all border dark:border-slate-800">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="w-full md:w-5/12 bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
          <img src={book.coverUrl} alt={getLocalizedTitle()} className="w-full h-48 md:h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
          <div className="absolute bottom-0 left-0 p-6 md:hidden text-white"><h2 className={`font-serif font-bold text-xl shadow-sm ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedTitle()}</h2></div>
        </div>
        <div className="w-full md:w-7/12 flex flex-col bg-white dark:bg-slate-900">
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-4 bg-white dark:bg-slate-900">
            <button onClick={() => setActiveTab('details')} className={`pb-3 px-4 text-sm font-semibold tracking-wide transition-all border-b-2 ${activeTab === 'details' ? 'text-amber-900 dark:text-amber-500 border-amber-900 dark:border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}>{t.bookDetails}</button>
            <button onClick={() => setActiveTab('ai')} className={`pb-3 px-4 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ai' ? 'text-amber-900 dark:text-amber-500 border-amber-900 dark:border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>{t.aiLibrarian}</button>
          </div>
          <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar" ref={scrollRef}>
            {activeTab === 'details' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="hidden md:block">
                  <h2 className={`text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2 leading-tight ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedTitle()}</h2>
                  <p className={`text-lg text-slate-500 dark:text-slate-400 font-medium ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedAuthor()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-sm">
                  <div><span className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-1">{language === 'zh' ? '类别' : (language === 'kh' ? 'ប្រភេទ' : 'Category')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{getLocalizedCategory()}</span></div>
                  <div><span className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-1">{language === 'zh' ? '年份' : (language === 'kh' ? 'ឆ្នាំ' : 'Year')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{book.year}</span></div>
                  <div><span className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-1">{language === 'zh' ? '页数' : (language === 'kh' ? 'ទំព័រ' : 'Pages')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{book.pages}</span></div>
                  <div><span className="block text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-1">{language === 'zh' ? '出版商' : (language === 'kh' ? 'អ្នកបោះពុម្ព' : 'Publisher')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{getLocalizedPublisher()}</span></div>
                </div>
                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-lg mb-3">{t.synopsis}</h3>
                  <p className={`text-slate-600 dark:text-slate-300 leading-relaxed text-base ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedDesc()}</p>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {language === 'zh' ? '分享此书' : (language === 'kh' ? 'ចែករំលែកសៀវភៅនេះ' : 'Share this book')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?book=${book.id}`;
                        const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                      title="Share on Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?book=${book.id}`;
                        const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                      title="Share on Twitter"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?book=${book.id}`;
                        const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                      title="Share on LinkedIn"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?book=${book.id}`;
                        const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()} - ${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                      title="Share on WhatsApp"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?book=${book.id}`;
                        navigator.clipboard.writeText(url).then(() => {
                          const btn = event?.currentTarget as HTMLButtonElement;
                          const originalText = btn.innerHTML;
                          btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>${language === 'zh' ? '已复制!' : (language === 'kh' ? 'បានចម្លង!' : 'Copied!')}</span>`;
                          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                      title="Copy link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{language === 'zh' ? '复制链接' : (language === 'kh' ? 'ចម្លងតំណ' : 'Copy Link')}</span>
                    </button>
                  </div>
                </div>
                <div className="pt-6 mt-auto">
                  <button onClick={() => onRead(book)} className="w-full bg-amber-900 dark:bg-amber-700 hover:bg-amber-800 dark:hover:bg-amber-600 text-white py-3.5 rounded-lg font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95"><span>{t.readOnline}</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-fade-in">
                <div className="flex-grow space-y-6 mb-4">{messages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-amber-900 dark:bg-amber-700 text-white rounded-br-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'}`}>{msg.text}</div></div>))}</div>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800"><div className="relative flex items-center gap-2"><input type="text" className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-900/10 dark:focus:ring-amber-500/10 focus:border-amber-900 dark:focus:border-amber-500 transition-all text-sm dark:text-white" placeholder={language === 'zh' ? '提问...' : (language === 'kh' ? 'សួរសំណួរ...' : 'Ask a question...')} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyPress} disabled={isLoading} /><button onClick={handleSendMessage} disabled={!chatInput.trim() || isLoading} className="absolute right-2 top-2 bottom-2 p-2 text-white bg-amber-900 dark:bg-amber-700 rounded-full hover:bg-amber-800 dark:hover:bg-amber-600 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors shadow-sm aspect-square flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg></button></div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};