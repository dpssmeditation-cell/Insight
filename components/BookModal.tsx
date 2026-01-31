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
      <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
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
            <button onClick={() => setActiveTab('ai')} className={`pb-3 px-4 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ai' ? 'text-amber-900 dark:text-amber-500 border-amber-900 dark:border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>{t.aiLibrarian}</button>
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