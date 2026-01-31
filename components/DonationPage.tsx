import React, { useState } from 'react';
import { Language } from '../types';
import { UI_STRINGS } from '../constants';

interface DonationPageProps {
  language: Language;
}

export const DonationPage: React.FC<DonationPageProps> = ({ language }) => {
  const t = UI_STRINGS[language];
  const [amount, setAmount] = useState<number | 'custom'>(50);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [customAmountValue, setCustomAmountValue] = useState('');

  const amounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
        <span className="hover:text-amber-900 cursor-pointer">{t.home}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-400">Read</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-amber-900 font-bold">2301</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content Column */}
        <div className="lg:w-8/12">
          <h1 className={`text-4xl md:text-5xl font-bold text-slate-900 mb-8 font-serif leading-tight ${language === 'zh' ? 'chinese-text' : ''}`}>
            {t.donateHeader}
          </h1>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl shadow-lg mb-10 bg-slate-200">
            <img 
              src="https://picsum.photos/seed/shenyun-donate/1200/675" 
              alt="Mission" 
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>

          <article className="prose prose-slate prose-lg max-w-none font-serif">
            <p className={`text-xl text-slate-700 leading-relaxed italic mb-8 border-l-4 border-amber-800 pl-6 ${language === 'zh' ? 'chinese-text' : ''}`}>
              {t.donateDesc}
            </p>

            <div className={`text-slate-600 space-y-6 ${language === 'zh' ? 'chinese-text' : ''}`}>
              <p>
                {language === 'zh' 
                  ? 'Insight Sharing 是一个致力于恢复传统人类文化的非营利组织。通过我们的数字图书馆和多媒体平台，我们努力保留那些在快速现代化的浪潮中可能流失的智慧遗产。' 
                  : 'Insight Sharing is a non-profit organization dedicated to restoring traditional human culture. Through our digital library and multimedia platform, we strive to preserve the heritage of wisdom that might otherwise be lost in the tide of rapid modernization.'}
              </p>
              <p>
                {language === 'zh'
                  ? '您的慷慨捐助将直接支持我们的内容数字化项目、AI馆员的研究能力提升，以及向全球更多语种社区的拓展。每一分钱都将转化为让更多人接触传统艺术和道德价值观的力量。'
                  : 'Your generous contribution directly supports our content digitization projects, the enhancement of our AI Librarian’s research capabilities, and outreach to more language communities worldwide. Every penny translates into making traditional art and moral values accessible to a wider audience.'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 pt-4">
                {language === 'zh' ? '为什么您的支持至关重要' : 'Why Your Support Matters'}
              </h3>
              <ul className="list-disc pl-5 space-y-3">
                <li>{language === 'zh' ? '数字化罕见的历史古籍与卷轴' : 'Digitizing rare historical texts and scrolls'}</li>
                <li>{language === 'zh' ? '制作高画质的传统艺术教学与纪录片' : 'Producing high-quality traditional art tutorials and documentaries'}</li>
                <li>{language === 'zh' ? '为全球学者提供免费的文化研究平台' : 'Providing a free cultural research platform for scholars globaly'}</li>
                <li>{language === 'zh' ? '开发先进的AI技术辅助文化解析' : 'Developing advanced AI technology for cultural interpretation'}</li>
              </ul>
            </div>
          </article>
        </div>

        {/* Donation Sidebar Column */}
        <div className="lg:w-4/12">
          <div className="sticky top-32 bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-amber-900 font-serif">$124,500</span>
                <span className="text-slate-500 text-sm font-medium">{t.raised}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-amber-700 rounded-full" style={{ width: '62%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">{t.goal}</span>
                  <span className="font-bold text-slate-700">$200,000</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">{t.backers}</span>
                  <span className="font-bold text-slate-700">1,248</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full mb-8"></div>

            {/* Form Section */}
            <div className="space-y-6">
              {/* Frequency Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setFrequency('one-time')}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${frequency === 'one-time' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t.oneTime}
                </button>
                <button 
                  onClick={() => setFrequency('monthly')}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${frequency === 'monthly' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t.monthly}
                </button>
              </div>

              {/* Amount Grid */}
              <div className="grid grid-cols-3 gap-3">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-3 px-2 border-2 rounded-xl text-lg font-bold transition-all ${amount === amt ? 'border-amber-900 bg-amber-50 text-amber-900' : 'border-slate-100 text-slate-600 hover:border-amber-200'}`}
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  onClick={() => setAmount('custom')}
                  className={`col-span-3 py-3 border-2 rounded-xl text-base font-bold transition-all ${amount === 'custom' ? 'border-amber-900 bg-amber-50 text-amber-900' : 'border-slate-100 text-slate-600 hover:border-amber-200'}`}
                >
                  {t.customAmount}
                </button>
              </div>

              {amount === 'custom' && (
                <div className="relative animate-fade-in">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full pl-8 pr-4 py-3 border-2 border-amber-900 rounded-xl outline-none font-bold"
                    placeholder="0.00"
                    value={customAmountValue}
                    onChange={(e) => setCustomAmountValue(e.target.value)}
                  />
                </div>
              )}

              <textarea 
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none text-sm focus:border-amber-900 transition-colors"
                placeholder={t.leaveMessage}
                rows={3}
              ></textarea>

              <button className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 text-lg">
                {t.next}
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};