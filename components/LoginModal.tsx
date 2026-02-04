import React, { useState } from 'react';
import { Language, User } from '../types';
import { UI_STRINGS } from '../constants';
import { authService } from '../services/authService';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  language: Language;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess, language }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetSent, setIsResetSent] = useState(false);

  const t = UI_STRINGS[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'forgot') {
        await authService.resetPassword(email);
        setIsResetSent(true);
      } else {
        let user: User;
        if (mode === 'signup') {
          user = await authService.register(fullName, email, password);
        } else {
          user = await authService.login(email, password);
        }
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError('');
    const mockEmail = `user_${Date.now()}@${provider}.com`;
    try {
      const user = await authService.login(mockEmail, undefined, provider);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError("Social login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setIsResetSent(false);
    setPassword('');
  };

  const getTitle = () => {
    if (mode === 'signup') return t.joinCommunity;
    if (mode === 'forgot') return t.resetPassword;
    return t.welcomeBack;
  };

  const getSubtitle = () => {
    if (mode === 'signup') return t.joinSub;
    if (mode === 'forgot') return t.resetPasswordSub;
    return t.loginSub;
  };

  if (isResetSent && mode === 'forgot') {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
        <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[480px] overflow-hidden animate-fade-in-up p-10 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t.resetPassword}</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {t.resetSuccess}
            <br />
            <span className="font-bold text-slate-800 mt-2 block">{email}</span>
          </p>
          <button
            onClick={() => switchMode('signin')}
            className="w-full bg-[#5D3A1A] hover:bg-[#4A2E14] text-white font-bold py-4 rounded-xl shadow-lg transition-all"
          >
            {t.backToSignIn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[480px] overflow-hidden animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pt-10 pb-12">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-[#5D3A1A] text-white flex items-center justify-center font-serif font-bold text-2xl rounded-xl shadow-sm">
              IS
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className={`text-[32px] font-serif font-bold text-[#1A2138] leading-tight ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
              {getTitle()}
            </h2>
            <p className={`text-[#64748B] text-[15px] mt-3 leading-relaxed px-4 ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>
              {getSubtitle()}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className={`block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2 ${language === 'kh' ? 'khmer-text' : ''}`}>{t.fullName}</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#5D3A1A]/5 focus:border-[#5D3A1A] transition-all outline-none text-[#1A2138] text-[15px] bg-[#F8FAFC]"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2 ${language === 'kh' ? 'khmer-text' : ''}`}>{t.emailLabel}</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#5D3A1A]/5 focus:border-[#5D3A1A] transition-all outline-none text-[#1A2138] text-[15px] bg-[#F8FAFC]"
                placeholder="reader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode !== 'forgot' && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider text-[#64748B] ${language === 'kh' ? 'khmer-text' : ''}`}>{t.passwordLabel}</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => switchMode('forgot')} className={`text-[12px] font-bold text-[#5D3A1A] hover:text-[#4A2E14] transition-colors ${language === 'kh' ? 'khmer-text' : ''}`}>
                      {t.forgotPassword}
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#5D3A1A]/5 focus:border-[#5D3A1A] transition-all outline-none text-[#1A2138] text-[15px] bg-[#F8FAFC]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#5D3A1A] hover:bg-[#4A2E14] text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center text-[17px] ${language === 'kh' ? 'khmer-text' : ''}`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (mode === 'signup' ? t.createAccount : (mode === 'forgot' ? t.sendResetLink : t.signIn))}
              </button>
            </div>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="mt-10 mb-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]"></div>
                </div>
                <div className="relative flex justify-center text-[14px]">
                  <span className={`px-4 bg-white text-[#64748B] font-medium ${language === 'zh' ? 'chinese-text' : (language === 'kh' ? 'khmer-text' : '')}`}>{t.orContinueWith}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-3 px-6 py-4 border border-[#E2E8F0] rounded-2xl hover:bg-slate-50 transition-all text-[15px] font-bold text-[#1A2138] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center gap-3 px-6 py-4 border border-[#E2E8F0] rounded-2xl hover:bg-slate-50 transition-all text-[15px] font-bold text-[#1A2138] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </button>
              </div>
            </>
          )}

          <div className={`mt-10 text-center text-[15px] text-[#64748B] ${language === 'kh' ? 'khmer-text' : ''}`}>
            {mode === 'signup' ? (
              <>
                {t.alreadyMember} <button onClick={() => switchMode('signin')} className="font-bold text-[#5D3A1A] hover:underline">{t.signIn}</button>
              </>
            ) : (
              mode === 'forgot' ? (
                <button onClick={() => switchMode('signin')} className="font-bold text-[#5D3A1A] hover:underline">{t.backToSignIn}</button>
              ) : (
                <>
                  {t.notMember} <button onClick={() => switchMode('signup')} className="font-bold text-[#5D3A1A] hover:underline">{t.createAccount}</button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};