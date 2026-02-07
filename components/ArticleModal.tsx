
import React, { useState, useEffect, useRef } from 'react';
import { Article, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  language: Language;
}

const NOTES_STORAGE_KEY = 'article_notes';
const PROGRESS_STORAGE_KEY = 'article_progress';
const WORDS_PER_MINUTE = 200;

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, language }) => {
  const t = UI_STRINGS[language];
  const [noteContent, setNoteContent] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState<string | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Reading Progress State
  const [readProgress, setReadProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TTS State
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightedText, setHighlightedText] = useState<string>('');

  // Calculate reading time on mount
  useEffect(() => {
    const stripHtml = (html: string) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const content = language === 'zh' && article.contentZh ? article.contentZh : (language === 'kh' && article.contentKh ? article.contentKh : article.content || '');
    const excerpt = language === 'zh' && article.excerptZh ? article.excerptZh : (language === 'kh' && article.excerptKh ? article.excerptKh : article.excerpt || '');
    const fullText = stripHtml(`${excerpt} ${content}`);
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    setEstimatedReadTime(Math.ceil(wordCount / WORDS_PER_MINUTE));
  }, [article, language]);

  // Load saved progress and restore scroll position
  useEffect(() => {
    const progressJson = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (progressJson) {
      try {
        const progressData = JSON.parse(progressJson);
        if (progressData[article.id]) {
          const savedProgress = progressData[article.id].progress || 0;
          setReadProgress(savedProgress);

          if (contentRef.current && savedProgress > 0) {
            setTimeout(() => {
              const elem = contentRef.current!;
              const scrollPos = (savedProgress / 100) * (elem.scrollHeight - elem.clientHeight);
              elem.scrollTop = scrollPos;
            }, 300);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, [article.id]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      const progress = Math.round((scrollTop / maxScroll) * 100);
      setReadProgress(progress);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (progress > 5) {
          try {
            const progressJson = localStorage.getItem(PROGRESS_STORAGE_KEY);
            const progressData = progressJson ? JSON.parse(progressJson) : {};
            progressData[article.id] = { progress, timestamp: new Date().toISOString() };
            localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressData));
          } catch (error) {
            console.error('Error saving progress:', error);
          }
        }
      }, 250);
    };

    const elem = contentRef.current;
    if (elem) {
      elem.addEventListener('scroll', handleScroll);
      return () => {
        elem.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };
    }
  }, [article.id]);

  // Preload voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Load existing note on mount
  useEffect(() => {
    const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
    if (notesJson) {
      try {
        const notes = JSON.parse(notesJson);
        if (notes[article.id]) {
          setNoteContent(notes[article.id].content || '');
          setNoteTimestamp(notes[article.id].timestamp || null);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, [article.id]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSaveNote = () => {
    try {
      const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
      const notes = notesJson ? JSON.parse(notesJson) : {};

      const timestamp = new Date().toISOString();
      notes[article.id] = {
        content: noteContent,
        timestamp: timestamp
      };

      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      setNoteTimestamp(timestamp);

      // Show saved message
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  // TTS Functions
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handlePlay = async () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsReading(true);
      return;
    }

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const title = getLocalizedTitle();
    const excerpt = getLocalizedExcerpt();
    const content = getLocalizedContent();
    const textToRead = `${title}. ${excerpt}. ${stripHtml(content)}`;

    // Android-specific: Wait for voices to load
    const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();

        if (voices.length > 0) {
          resolve(voices);
          return;
        }

        // Android Chrome needs time to load voices
        const voicesChangedHandler = () => {
          voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
            resolve(voices);
          }
        };

        window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);

        // Fallback timeout for Android
        setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
          resolve(voices);
        }, 1000);
      });
    };

    try {
      const voices = await loadVoices();

      const newUtterance = new SpeechSynthesisUtterance(textToRead);

      // Set language and voice based on current language
      let targetLang = 'en-US';
      if (language === 'zh') {
        targetLang = 'zh-CN';
      } else if (language === 'kh') {
        targetLang = 'km-KH';
      }

      newUtterance.lang = targetLang;

      // Voice selection with Android compatibility
      if (voices.length > 0) {
        // 1. Prefer local voice for target language (better performance/privacy)
        let selectedVoice = voices.find(v => v.lang === targetLang && v.localService);

        // 2. Fallback to any voice for the target language
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang === targetLang);
        }

        // 3. Last resort: match just the language code (e.g. 'en')
        if (!selectedVoice) {
          const langCode = targetLang.split('-')[0];
          selectedVoice = voices.find(v => v.lang.startsWith(langCode));
        }

        if (selectedVoice) {
          console.log('TTS using voice:', selectedVoice.name, 'Local:', selectedVoice.localService);
          newUtterance.voice = selectedVoice;
        } else {
          console.log('No specific voice found for language:', targetLang, 'Using default');
        }
      }

      newUtterance.rate = 0.9;
      newUtterance.pitch = 1;

      // Track word boundaries for highlighting
      newUtterance.onboundary = (event) => {
        console.log('onboundary event fired:', event.name, 'at index:', event.charIndex); // Debug log
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          // Find word end (next space or end of string)
          let wordEnd = charIndex;
          while (wordEnd < textToRead.length && textToRead[wordEnd] !== ' ' && textToRead[wordEnd] !== '.' && textToRead[wordEnd] !== ',') {
            wordEnd++;
          }

          const word = textToRead.substring(charIndex, wordEnd).trim();
          console.log('TTS Reading word:', word); // Debug log
          setHighlightedText(word);
          setCurrentWordIndex(charIndex);

          // Remove previous bold highlighting with a delay
          setTimeout(() => {
            const previousHighlights = document.querySelectorAll('.tts-word-highlight');
            previousHighlights.forEach(el => {
              const text = el.textContent || '';
              const textNode = document.createTextNode(text);
              if (el.parentNode) {
                el.parentNode.replaceChild(textNode, el);
              }
            });
          }, 500); // Keep highlight visible for 500ms

          // Apply bold highlighting to current word in the DOM
          if (word.length > 0) { // Highlight all words
            const articleContent = document.querySelector('.prose');
            if (articleContent) {
              console.log('Found article content, searching for word:', word); // Debug log

              // Use a simpler approach: find all text nodes and wrap the word
              const textNodes: Text[] = [];
              const walker = document.createTreeWalker(
                articleContent,
                NodeFilter.SHOW_TEXT,
                null
              );

              let node;
              while (node = walker.nextNode()) {
                if (node.textContent && node.textContent.trim().length > 0) {
                  textNodes.push(node as Text);
                }
              }

              // Search for the word in text nodes
              for (const textNode of textNodes) {
                const text = textNode.textContent || '';
                const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                const match = text.match(regex);

                if (match && match.index !== undefined) {
                  console.log('Found word in text:', text.substring(0, 50)); // Debug log
                  const matchIndex = match.index;
                  const matchedWord = match[0];

                  const before = text.substring(0, matchIndex);
                  const after = text.substring(matchIndex + matchedWord.length);

                  const span = document.createElement('span');
                  span.className = 'tts-word-highlight';
                  // Add inline styles - bold and zoom only, no background
                  span.style.fontWeight = '900';
                  span.style.fontSize = '1.2em';
                  span.style.transform = 'scale(1.15)';
                  span.style.display = 'inline-block';
                  span.style.transition = 'all 0.2s ease';
                  span.textContent = matchedWord;

                  const fragment = document.createDocumentFragment();
                  if (before) fragment.appendChild(document.createTextNode(before));
                  fragment.appendChild(span);
                  if (after) fragment.appendChild(document.createTextNode(after));

                  textNode.parentNode?.replaceChild(fragment, textNode);
                  console.log('Applied highlight to word:', matchedWord); // Debug log
                  break;
                }
              }
            } else {
              console.log('Article content not found'); // Debug log
            }
          }
        }
      };

      newUtterance.onstart = () => {
        console.log('TTS started successfully');
        setIsReading(true);
        setIsPaused(false);
        setCurrentWordIndex(0);
      };

      newUtterance.onend = () => {
        console.log('TTS ended');
        setIsReading(false);
        setIsPaused(false);
        setHighlightedText('');
        setCurrentWordIndex(0);
        // Clean up bold highlighting
        document.querySelectorAll('.tts-word-highlight').forEach(el => {
          const text = el.textContent || '';
          const textNode = document.createTextNode(text);
          el.parentNode?.replaceChild(textNode, el);
        });
      };

      newUtterance.onerror = (event) => {
        console.error('TTS error:', event.error, event);
        setIsReading(false);
        setIsPaused(false);
        setHighlightedText('');
        setCurrentWordIndex(0);
        // Clean up bold highlighting
        document.querySelectorAll('.tts-word-highlight').forEach(el => {
          const text = el.textContent || '';
          const textNode = document.createTextNode(text);
          el.parentNode?.replaceChild(textNode, el);
        });

        // Show user-friendly error message
        if (event.error === 'not-allowed' || event.error === 'canceled') {
          alert('Speech was interrupted. Please try again.');
        }
      };

      setUtterance(newUtterance);

      // Android-specific: Small delay before speaking to ensure proper initialization
      setTimeout(() => {
        console.log('Attempting to speak...');
        window.speechSynthesis.speak(newUtterance);

        // Android fallback: Check if speaking started
        setTimeout(() => {
          if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
            console.log('Speech did not start, retrying...');
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(newUtterance);
          }
        }, 100);
      }, 50);

    } catch (error) {
      console.error('Error initializing TTS:', error);
      alert('Failed to initialize text-to-speech. Please try again.');
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis && isReading) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsReading(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setHighlightedText('');
      setCurrentWordIndex(0);
      // Clean up bold highlighting
      document.querySelectorAll('.tts-word-highlight').forEach(el => {
        const text = el.textContent || '';
        const textNode = document.createTextNode(text);
        el.parentNode?.replaceChild(textNode, el);
      });
    }
  };

  const getLocalizedTitle = () => {
    if (language === 'zh') return article.titleZh;
    if (language === 'kh' && article.titleKh) return article.titleKh;
    return article.title;
  };

  const getLocalizedAuthor = () => {
    if (language === 'zh') return article.authorZh;
    return article.author;
  };

  const getLocalizedExcerpt = () => {
    if (language === 'zh') return article.excerptZh;
    if (language === 'kh' && article.excerptKh) return article.excerptKh;
    return article.excerpt;
  };

  const getLocalizedContent = () => {
    if (language === 'zh') return article.contentZh || article.content;
    if (language === 'kh') return article.contentKh || article.content;
    return article.content;
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'telegram') => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    const baseUrl = isLocal ? 'https://insightsharing.org' : (window.location.origin + window.location.pathname);
    const title = getLocalizedTitle();
    const text = language === 'zh'
      ? `阅读 Insight Sharing 上的文章：${title}`
      : `Read this article on Insight Sharing: "${title}"`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleExportPDF = async () => {
    // Dynamically load html2pdf.js from CDN
    if (!(window as any).html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    const title = getLocalizedTitle();
    const author = getLocalizedAuthor();
    const excerpt = getLocalizedExcerpt();
    const content = getLocalizedContent();
    const date = new Date(article.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

    // Create a temporary container for PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '40px';
    pdfContainer.style.fontFamily = 'serif';
    pdfContainer.style.lineHeight = '1.6';
    pdfContainer.style.color = '#1e293b';

    pdfContainer.innerHTML = `
      <div style="margin-bottom: 30px; border-bottom: 2px solid #d97706; padding-bottom: 20px;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 10px; color: #0f172a;">${title}</h1>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 5px;">By ${author}</p>
        <p style="font-size: 12px; color: #94a3b8;">${date}</p>
      </div>
      <div style="margin-bottom: 25px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #d97706; font-style: italic; font-size: 16px;">
        ${excerpt}
      </div>
      <div style="font-size: 14px; text-align: justify;">
        ${content || '<p>No content available.</p>'}
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
        <p>Downloaded from Insight Sharing</p>
      </div>
    `;

    // Configure PDF options
    const opt = {
      margin: 15,
      filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate and download PDF
    try {
      await (window as any).html2pdf().set(opt).from(pdfContainer).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const content = getLocalizedContent();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-fade-in"
      />

      <div className="relative w-full max-w-4xl max-h-[95vh] animate-fade-in-up flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div
          ref={contentRef}
          className="w-full h-full overflow-y-auto"
        >
          {/* Reading Progress Bar */}
          <div className="sticky top-0 z-[60] w-full h-1.5 bg-slate-100">
            <div
              className="h-full bg-amber-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(217,119,6,0.5)]"
              style={{ width: `${readProgress}%` }}
            />
          </div>

          {/* Hero Image Section */}
          <div className="relative w-full aspect-[21/9] overflow-hidden bg-slate-200 shrink-0">
            <img
              src={article.imageUrl}
              alt={getLocalizedTitle()}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all border border-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute bottom-8 left-8 right-24">
              <span className="bg-amber-700 text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest mb-3 inline-block">
                {article.category}
              </span>
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight ${language === 'zh' ? 'chinese-text' : ''}`}>
                {getLocalizedTitle()}
              </h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-12">
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border-2 border-slate-50 shadow-sm">
                  {getLocalizedAuthor().charAt(0)}
                </div>
                <div>
                  <p className={`text-base font-bold text-slate-900 ${language === 'zh' ? 'chinese-text' : ''}`}>{getLocalizedAuthor()}</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(article.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>

              <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">

                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{estimatedReadTime > 0 ? `${estimatedReadTime} min read` : article.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <span>{(article.views || 0).toLocaleString()}</span>
                </div>
              </div>


              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?article=${article.id}`;
                    const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 transition-all"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?article=${article.id}`;
                    const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?article=${article.id}`;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0A66C2] hover:bg-blue-50 transition-all"
                  title="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?article=${article.id}`;
                    const text = `${getLocalizedTitle()} by ${getLocalizedAuthor()} - ${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:bg-green-50 transition-all"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title={t.exportPdf}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?article=${article.id}`;
                    navigator.clipboard.writeText(url).then(() => {
                      const btn = event?.currentTarget as HTMLButtonElement;
                      const originalHTML = btn.innerHTML;
                      btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
                      btn.classList.add('text-green-600');
                      setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.classList.remove('text-green-600');
                      }, 2000);
                    });
                  }}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  title="Copy link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

            {/* TTS Controls */}
            {/* TTS Controls */}
            <div className="sticky top-2 z-40 mb-6 flex items-center gap-4 p-4 bg-amber-50/95 backdrop-blur border border-amber-200 rounded-lg shadow-sm hover:shadow-md transition-all">
              {readProgress > 5 && (
                <div className="flex items-center gap-2 text-amber-700 font-medium animate-fade-in border-r border-amber-200 pr-4 mr-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm">{readProgress}%</span>
                </div>
              )}
              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              <span className={`text-sm font-medium text-slate-700 ${language === 'zh' ? 'chinese-text' : ''}`}>
                {t.listenToArticle}
              </span>

              {isReading && (
                <span className="text-xs text-amber-700 font-medium animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-700 rounded-full"></span>
                  {t.reading}
                </span>
              )}


              <div
                className="ml-auto flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-x',
                  overscrollBehavior: 'contain'
                }}
              >
                <button
                  onClick={handlePlay}
                  disabled={isReading}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${isReading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm hover:shadow-md'
                    } ${language === 'zh' ? 'chinese-text' : ''}`}
                  title={t.play}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    {t.play}
                  </div>
                </button>

                <button
                  onClick={handlePause}
                  disabled={!isReading}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${!isReading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md'
                    } ${language === 'zh' ? 'chinese-text' : ''}`}
                  title={t.pause}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                    {t.pause}
                  </div>
                </button>

                <button
                  onClick={handleStop}
                  disabled={!isReading && !isPaused}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${!isReading && !isPaused
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md'
                    } ${language === 'zh' ? 'chinese-text' : ''}`}
                  title={t.stop}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                    {t.stop}
                  </div>
                </button>
              </div>
            </div>

            {/* Article Text */}
            <div className={`prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-serif ${language === 'zh' ? 'chinese-text' : ''} ${isReading ? 'tts-reading-active' : ''}`}>
              <p className={`text-xl font-medium text-slate-900 mb-10 italic border-l-4 border-amber-800 pl-6 bg-amber-50/30 py-6 rounded-r-xl ${isReading ? 'tts-highlight' : ''}`}>
                {getLocalizedExcerpt()}
              </p>

              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} className={isReading ? 'tts-highlight' : ''} />
              ) : (
                <div className="space-y-6 opacity-60 italic">
                  <p>{language === 'zh' ? '暂无正文内容。' : 'No article body content available.'}</p>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                </div>
              )}
            </div>

            {/* Personal Notes Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <h3 className={`text-2xl font-bold text-slate-900 ${language === 'zh' ? 'chinese-text' : ''}`}>{t.myNotes}</h3>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t.notePlaceholder}
                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none text-slate-700 font-serif focus:border-amber-700 transition-colors resize-none ${language === 'zh' ? 'chinese-text' : ''}`}
                rows={6}
              ></textarea>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-500">
                  {noteTimestamp && (
                    <span>
                      {t.lastUpdated}: {new Date(noteTimestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {showSavedMessage && (
                    <span className="text-green-600 font-medium text-sm animate-fade-in flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {t.notesSaved}
                    </span>
                  )}
                  <button
                    onClick={handleSaveNote}
                    className={`px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 ${language === 'zh' ? 'chinese-text' : ''}`}
                  >
                    {t.saveNote}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 flex justify-center">
              <button
                onClick={onClose}
                className="px-12 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-amber-900 transition-all shadow-xl hover:shadow-amber-900/20 active:scale-95 transform"
              >
                {language === 'zh' ? '完成阅读' : 'Finish Reading'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
