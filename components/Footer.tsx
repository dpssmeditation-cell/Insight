import React, { useState, useEffect } from 'react';
import { Language, ViewState } from '../types';
import { UI_STRINGS } from '../constants';

interface FooterProps {
  language: Language;
  onNavigate?: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const t = UI_STRINGS[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAdmin(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-800 text-white flex items-center justify-center font-serif font-bold rounded-sm">
                  IS
                </div>
                <span className="font-serif font-bold text-xl text-white uppercase tracking-tight">
                  Insight Sharing
                </span>
             </div>
             <p className={`text-sm text-slate-400 leading-relaxed ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
               {t.dedicatedTo}
             </p>
          </div>

          <div>
            <h3 className={`text-white font-serif font-semibold mb-4 ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{t.discover}</h3>
            <ul className={`space-y-2 text-sm ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.books}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.articles}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.multimedia}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{language === 'zh' ? '画廊' : (language === 'kh' ? 'វិចិត្រសាល' : 'Gallery')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className={`text-white font-serif font-semibold mb-4 ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{t.organization}</h3>
            <ul className={`space-y-2 text-sm ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.about}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{language === 'zh' ? '联系' : (language === 'kh' ? 'ទាក់ទង' : 'Contact')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{language === 'zh' ? '支持我们' : (language === 'kh' ? 'គាំទ្រយើង' : 'Support Us')}</a></li>
              {onNavigate && (
                <li className={`transition-all duration-500 ${showAdmin ? 'opacity-100 translate-y-0 h-auto mt-2' : 'opacity-0 translate-y-2 h-0 overflow-hidden pointer-events-none'}`}>
                  <button 
                    onClick={() => onNavigate('admin')} 
                    className="text-amber-600/80 font-bold hover:text-amber-400 transition-colors flex items-center gap-1 text-[10px] uppercase tracking-tighter"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Admin Gateway
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className={`text-white font-serif font-semibold mb-4 ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{t.stayConnected}</h3>
            <div className="flex space-x-4 mb-4">
               <a 
                href="https://facebook.com/insightsharing" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-800 cursor-pointer transition-colors"
                title="Facebook"
              >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
               </a>
               <a 
                href="https://x.com/insightsharing" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-800 cursor-pointer transition-colors"
                title="X (Twitter)"
              >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
               </a>
            </div>
            <p className={`text-xs text-slate-500 select-none ${language === 'kh' ? 'khmer-text' : ''}`}>
              &copy; 2025 Insight Sharing. {t.rightsReserved}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};