import React, { useState, useEffect, useRef } from 'react';
import { Book, Audio, Video, Language, Category, Article, Artist } from '../types';
import { CATEGORIES, VIDEO_CATEGORIES, AUDIO_CATEGORIES } from '../constants';

interface AdminPageProps {
  books: Book[];
  audios: Audio[];
  videos: Video[];
  articles: Article[];
  artists: Artist[];
  language: Language;
  onSave: (type: 'book' | 'audio' | 'video' | 'article' | 'artist', item: any) => void;
  onDelete: (type: 'book' | 'audio' | 'video' | 'article' | 'artist', id: string) => void;
  onSeed?: () => void;
}

/**
 * A sophisticated Rich Text Editor component that mimics Word/Google Docs.
 */
const RichTextEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  lang?: string;
}> = ({ value, onChange, placeholder, lang }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync state to DOM only if it's different to prevent cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    const rows = prompt("Number of rows?", "3");
    const cols = prompt("Number of columns?", "3");
    if (rows && cols) {
      let table = `<table style="width:100%; border-collapse: collapse; border: 1px solid #ddd; margin: 10px 0;">`;
      for (let i = 0; i < parseInt(rows); i++) {
        table += `<tr>`;
        for (let j = 0; j < parseInt(cols); j++) {
          table += `<td style="border: 1px solid #ddd; padding: 8px; min-height: 20px;">Cell</td>`;
        }
        table += `</tr>`;
      }
      table += `</table><p><br></p>`;
      exec('insertHTML', table);
    }
  };

  const insertDateTime = () => {
    const now = new Date().toLocaleString();
    exec('insertText', now);
  };

  const insertSymbol = () => {
    const symbol = prompt("Enter a symbol (e.g. ©, ®, ™, ∞, π)", "©");
    if (symbol) exec('insertText', symbol);
  };

  const toggleDropCap = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const span = `<span style="float: left; font-size: 3.5em; line-height: 0.8; padding-right: 8px; font-weight: bold; color: #5d3a1a;">${selection.toString()}</span>`;
      exec('insertHTML', span);
    }
  };

  return (
    <div className={`flex flex-col border-2 rounded-2xl transition-all bg-white ${isFocused ? 'border-amber-900 ring-4 ring-amber-50' : 'border-slate-100'}`}>
      {/* WORD RIBBON TOOLBAR */}
      <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 shadow-sm rounded-t-[14px]">

        {/* Font Group */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1 mr-1">
          <select
            onChange={(e) => exec('fontName', e.target.value)}
            className="text-[10px] font-bold p-1 bg-transparent outline-none w-24"
            title="Font Family"
          >
            <option value="Inter">Sans Serif</option>
            <option value="Merriweather">Serif</option>
            <option value="Noto Sans SC">Chinese</option>
            <option value="Noto Serif Khmer">Khmer</option>
            <option value="Courier New">Monospace</option>
          </select>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <select
            onChange={(e) => exec('fontSize', e.target.value)}
            className="text-[10px] font-bold p-1 bg-transparent outline-none w-12"
            title="Font Size"
          >
            <option value="1">10px</option>
            <option value="2">13px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>
        </div>

        {/* Style Group */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 mr-1">
          <ToolbarButton onClick={() => exec('bold')} icon={<path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />} title="Bold" />
          <ToolbarButton onClick={() => exec('italic')} icon={<path d="M19 4h-9m3 16H5M15 4L9 20" />} title="Italic" />
          <ToolbarButton onClick={() => exec('underline')} icon={<path d="M6 3v7a6 6 0 0012 0V3M4 21h16" />} title="Underline" />
          <ToolbarButton onClick={() => exec('strikeThrough')} icon={<path d="M5 12h14M16 8H9a3 3 0 000 6h7" />} title="Strikethrough" />
        </div>

        {/* Color Group */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 mr-1">
          <div className="relative group">
            <ToolbarButton onClick={() => { }} icon={<path d="M11 4l-7 16m14-16l7 16M8 16h8M12 4v16" />} title="Text Color" />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => exec('foreColor', e.target.value)} />
          </div>
          <div className="relative group">
            <ToolbarButton onClick={() => { }} icon={<path d="M4 21h16M7 14h10M9 4l6 10H9l6-10" />} title="Highlight" />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => exec('hiliteColor', e.target.value)} />
          </div>
        </div>

        {/* Paragraph Group */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 mr-1">
          <ToolbarButton onClick={() => exec('justifyLeft')} icon={<path d="M3 6h18M3 12h18M3 18h11" />} title="Align Left" />
          <ToolbarButton onClick={() => exec('justifyCenter')} icon={<path d="M3 6h18M3 12h18M3 18h18" />} title="Align Center" />
          <ToolbarButton onClick={() => exec('justifyRight')} icon={<path d="M3 6h18M3 12h18M10 18h11" />} title="Align Right" />
          <ToolbarButton onClick={() => exec('justifyFull')} icon={<path d="M3 6h18M3 12h18M3 18h18" />} title="Justify" />
        </div>

        {/* Lists Group */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 mr-1">
          <ToolbarButton onClick={() => exec('insertUnorderedList')} icon={<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />} title="Bullets" />
          <ToolbarButton onClick={() => exec('insertOrderedList')} icon={<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M4 18h2M4 14h2M4 14l2 4" />} title="Numbering" />
        </div>

        {/* Insert Group */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 mr-1">
          <ToolbarButton onClick={insertTable} icon={<path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />} title="Table" />
          <ToolbarButton onClick={() => {
            const url = prompt("Image URL?", "https://");
            if (url) exec('insertImage', url);
          }} icon={<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />} title="Picture" />
          <ToolbarButton onClick={() => {
            const url = prompt("Link URL?", "https://");
            if (url) exec('createLink', url);
          }} icon={<path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />} title="Link" />
        </div>

        {/* Extras Group */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5">
          <ToolbarButton onClick={insertSymbol} icon={<path d="M12 2v20m-8-8l8-8 8 8" />} title="Symbol" />
          <ToolbarButton onClick={insertDateTime} icon={<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} title="Date/Time" />
          <ToolbarButton onClick={toggleDropCap} icon={<path d="M4 20h16M4 4h16M4 12h16" />} title="Drop Cap" />
          <ToolbarButton onClick={() => exec('removeFormat')} icon={<path d="M18 6L6 18M6 6l12 12" />} title="Clear Formatting" />
        </div>
      </div>

      {/* EDITING AREA */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-8 min-h-[400px] outline-none prose prose-slate max-w-none text-base leading-relaxed overflow-y-auto rounded-b-[14px] ${lang === 'zh' ? 'chinese-text' : (lang === 'kh' ? 'khmer-text font-serif' : 'font-serif')}`}
        style={{ scrollBehavior: 'smooth' }}
      ></div>
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void; icon: React.ReactNode; title: string }> = ({ onClick, icon, title }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault(); // Prevent focus loss from editor
      onClick();
    }}
    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
    title={title}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      {icon}
    </svg>
  </button>
);

export const AdminPage: React.FC<AdminPageProps> = ({ books, audios, videos, articles, artists, language, onSave, onDelete, onSeed }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 2FA State
  const [loginStep, setLoginStep] = useState<'credentials' | 'verification'>('credentials');
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'book' | 'audio' | 'video' | 'article' | 'artist'>('book');
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  // Default values
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUsernames = ['admin', 'englishtips729@gmail.com'];

    if (validUsernames.includes(username.trim().toLowerCase()) && (password.trim() === 'IS2026?' || password.trim() === 'IS2026')) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setLoginStep('verification');
      console.log(`[Admin Security] Code: ${code}`);

      // Simulate Email Sending
      setTimeout(() => {
        alert(`(Simulation) Verification code sent to ${username}:\n\nCode: ${code}`);
      }, 500);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === verificationCode) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid code');
    }
  };

  const handleCreate = () => {
    setCurrentItem({
      id: '', title: '', titleZh: '', titleKh: '',
      category: 'History',
      // Contributors
      author: '', authorZh: '', authorKh: '',
      artist: '', artistZh: '', artistKh: '',
      presenter: '', presenterZh: '', presenterKh: '',
      // Artist-specific fields
      name: '', nameZh: '', nameKh: '',
      role: '', roleZh: '', roleKh: '',
      bio: '', bioZh: '',
      // Visuals
      imageUrl: 'https://picsum.photos/800/450',
      coverUrl: 'https://picsum.photos/300/400',
      thumbnailUrl: 'https://picsum.photos/600/338',
      // Content
      content: '', contentZh: '', contentKh: '',
      excerpt: '', excerptZh: '', excerptKh: '',
      // Metadata
      date: new Date().toISOString().split('T')[0],
      readTime: '5 min',
      duration: '04:00',
      views: 0,
      plays: 0,
      // Digital Assets
      pdfUrl: '', fileSize: '', pages: 0,
      audioUrl: '',
      videoUrl: ''
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activeTab, currentItem);
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">{loginStep === 'credentials' ? 'Admin Gateway' : 'Identity Verification'}</h2>
          {loginStep === 'credentials' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-900/20" value={username} onChange={e => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-900/20" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="w-full py-4 bg-amber-900 text-white font-bold rounded-xl shadow-xl">Proceed</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                <p className="text-xs text-amber-800 font-bold uppercase tracking-widest mb-1">Dev Environment Security</p>
                <p className="text-sm">Verification code: <span className="font-mono font-bold text-lg text-amber-900">{verificationCode}</span></p>
              </div>
              <input type="text" placeholder="000000" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-center tracking-widest font-mono text-xl" value={inputCode} onChange={e => setInputCode(e.target.value)} />
              <button type="submit" className="w-full py-4 bg-amber-900 text-white font-bold rounded-xl shadow-xl">Verify & Enter</button>
            </form>
          )}
          {loginError && <p className="text-red-600 text-sm text-center mt-4">{loginError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-fade-in relative">
      <div className="flex justify-between items-end mb-12 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-serif font-bold text-slate-900">Editor Suite</h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-200" title="Data synced via local server">Live Sync</span>
          </div>
          <p className="text-slate-500 font-medium">Full management control for Insight Sharing digital content.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsAuthenticated(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">Logout</button>

          {onSeed && (
            <button onClick={onSeed} className="px-6 py-3 bg-amber-100 text-amber-900 border border-amber-200 rounded-full font-bold shadow hover:bg-amber-200 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              Seed Database
            </button>
          )}

          <button onClick={handleCreate} className="px-8 py-3 bg-green-700 text-white rounded-full font-bold shadow-lg hover:bg-green-800 transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex bg-slate-50/50 p-1">
          {['book', 'article', 'audio', 'video', 'artist'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-xl ${activeTab === tab ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}s
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-50">
                <th className="p-6">Content</th>
                <th className="p-6">Contributor</th>
                <th className="p-6">Category</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'book' ? books : activeTab === 'article' ? articles : activeTab === 'audio' ? audios : activeTab === 'video' ? videos : artists).map((item: any) => (
                <tr key={item.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 bg-slate-100 rounded flex-shrink-0 overflow-hidden shadow-sm">
                        <img src={item.coverUrl || item.imageUrl || item.thumbnailUrl} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-slate-800">{item.title || item.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-600">{item.author || item.artist || item.presenter || item.role}</td>
                  <td className="p-6">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 rounded text-slate-500">{item.category || item.role}</span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => { setCurrentItem({ ...item }); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-amber-900 hover:bg-amber-50 rounded-full transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onDelete(activeTab, item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col my-8">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-20">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">{currentItem.id ? 'Edit' : 'Create'} {activeTab}</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Global Library Asset Manager</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-10 space-y-12">
              {/* Multi-language Title Field Group */}
              <section className="space-y-6">
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">1. Localized Titles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">English Title</label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all" value={currentItem.title} onChange={e => setCurrentItem({ ...currentItem, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Chinese Title</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all chinese-text" value={currentItem.titleZh} onChange={e => setCurrentItem({ ...currentItem, titleZh: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Khmer Title</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all khmer-text font-serif" value={currentItem.titleKh || ''} onChange={e => setCurrentItem({ ...currentItem, titleKh: e.target.value })} />
                  </div>
                </div>
              </section>

              {/* Artist-specific fields */}
              {activeTab === 'artist' && (
                <>
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">2. Author/Artist Names</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">English Name</label>
                        <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all" value={currentItem.name || ''} onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Chinese Name</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all chinese-text" value={currentItem.nameZh || ''} onChange={e => setCurrentItem({ ...currentItem, nameZh: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Khmer Name</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all khmer-text font-serif" value={currentItem.nameKh || ''} onChange={e => setCurrentItem({ ...currentItem, nameKh: e.target.value })} />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">3. Role/Profession</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">English Role</label>
                        <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all" placeholder="e.g., Author, Composer, Presenter" value={currentItem.role || ''} onChange={e => setCurrentItem({ ...currentItem, role: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Chinese Role</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all chinese-text" placeholder="例如：作者、作曲家" value={currentItem.roleZh || ''} onChange={e => setCurrentItem({ ...currentItem, roleZh: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Khmer Role</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all khmer-text font-serif" value={currentItem.roleKh || ''} onChange={e => setCurrentItem({ ...currentItem, roleKh: e.target.value })} />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-10">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">4. Biography (Rich Text)</h3>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 text-xs font-bold uppercase text-slate-500">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">EN</span>
                        English Biography
                      </label>
                      <RichTextEditor value={currentItem.bio || ''} onChange={val => setCurrentItem({ ...currentItem, bio: val })} />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 text-xs font-bold uppercase text-slate-500">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">ZH</span>
                        Chinese Biography (中文简介)
                      </label>
                      <RichTextEditor lang="zh" value={currentItem.bioZh || ''} onChange={val => setCurrentItem({ ...currentItem, bioZh: val })} />
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">5. Profile Image</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Image URL</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all font-mono text-xs" placeholder="https://example.com/profile.jpg" value={currentItem.imageUrl || ''} onChange={e => setCurrentItem({ ...currentItem, imageUrl: e.target.value })} />
                    </div>
                  </section>
                </>
              )}

              {/* Advanced Rich Text Content Editors */}
              {activeTab === 'article' && (
                <section className="space-y-10">
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">2. Article Content (Rich Text)</h3>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-xs font-bold uppercase text-slate-500">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">EN</span>
                      English Body Content
                    </label>
                    <RichTextEditor value={currentItem.content || ''} onChange={val => setCurrentItem({ ...currentItem, content: val })} />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-xs font-bold uppercase text-slate-500">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">ZH</span>
                      Chinese Body Content (中文正文)
                    </label>
                    <RichTextEditor lang="zh" value={currentItem.contentZh || ''} onChange={val => setCurrentItem({ ...currentItem, contentZh: val })} />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-xs font-bold uppercase text-slate-500">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">KH</span>
                      Khmer Body Content (ខ្លឹមសារអត្ថបទខ្មែរ)
                    </label>
                    <RichTextEditor lang="kh" value={currentItem.contentKh || ''} onChange={val => setCurrentItem({ ...currentItem, contentKh: val })} />
                  </div>
                </section>
              )}

              {/* Simple Metadata Group */}
              <section className="space-y-6">
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">3. Primary Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={currentItem.category} onChange={e => setCurrentItem({ ...currentItem, category: e.target.value })}>
                      {(activeTab === 'video' ? VIDEO_CATEGORIES : activeTab === 'audio' ? AUDIO_CATEGORIES : CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Contributor</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Author, Artist or Presenter" value={currentItem.author || currentItem.artist || currentItem.presenter || ''} onChange={e => {
                      if (activeTab === 'book' || activeTab === 'article') setCurrentItem({ ...currentItem, author: e.target.value });
                      else if (activeTab === 'audio') setCurrentItem({ ...currentItem, artist: e.target.value });
                      else if (activeTab === 'video') setCurrentItem({ ...currentItem, presenter: e.target.value });
                    }} />
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Asset URL (Cover/Thumbnail)</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-xs" value={currentItem.coverUrl || currentItem.imageUrl || currentItem.thumbnailUrl || ''} onChange={e => {
                      if (activeTab === 'video') setCurrentItem({ ...currentItem, thumbnailUrl: e.target.value });
                      else if (activeTab === 'article') setCurrentItem({ ...currentItem, imageUrl: e.target.value });
                      else setCurrentItem({ ...currentItem, coverUrl: e.target.value });
                    }} />
                  </div>
                </div>

                {/* Digital Document Section for Books */}
                {activeTab === 'book' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Digital Document (External PDF URL)</label>
                      <input
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all font-mono text-xs"
                        placeholder="https://drive.google.com/uc?id=... or S3 link"
                        value={currentItem.pdfUrl || ''}
                        onChange={e => setCurrentItem({ ...currentItem, pdfUrl: e.target.value })}
                      />
                      <p className="text-[9px] text-slate-400 italic">Upload to Google Drive, S3, or similar and paste the public direct link here.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">File Metadata (Size & Pages)</label>
                      <div className="flex gap-4">
                        <input
                          className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all"
                          placeholder="Size (e.g. 5.2 MB)"
                          value={currentItem.fileSize || ''}
                          onChange={e => setCurrentItem({ ...currentItem, fileSize: e.target.value })}
                        />
                        <input
                          type="number"
                          className="w-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all"
                          placeholder="Pages"
                          value={currentItem.pages || 0}
                          onChange={e => setCurrentItem({ ...currentItem, pages: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Asset Section for Audio/Video */}
                {(activeTab === 'audio' || activeTab === 'video') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">{activeTab === 'audio' ? 'Audio Source URL (.mp3)' : 'Video Source URL (.mp4)'}</label>
                      <input
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all font-mono text-xs"
                        placeholder={activeTab === 'audio' ? 'https://example.com/file.mp3' : 'https://example.com/file.mp4'}
                        value={activeTab === 'audio' ? currentItem.audioUrl || '' : currentItem.videoUrl || ''}
                        onChange={e => setCurrentItem({ ...currentItem, [activeTab === 'audio' ? 'audioUrl' : 'videoUrl']: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Duration (MM:SS)</label>
                      <input
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-900 focus:bg-white transition-all"
                        placeholder="e.g. 05:22"
                        value={currentItem.duration || ''}
                        onChange={e => setCurrentItem({ ...currentItem, duration: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </section>

              <div className="pt-8 flex justify-end gap-4 border-t border-slate-100 sticky bottom-0 bg-white py-4 -mx-10 px-10">
                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="px-12 py-4 bg-amber-900 text-white font-bold rounded-xl shadow-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};