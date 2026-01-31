import React, { useState } from 'react';
import { User, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => Promise<void>;
  language: Language;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, language }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const t = UI_STRINGS[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (password && password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
    }

    setIsLoading(true);
    try {
        const updatedUser = { ...user, fullName };
        if (password) {
            updatedUser.password = password; // In real app, never do this client side without hashing
        }
        
        await onUpdateUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        setIsEditing(false);
        setPassword('');
        setConfirmPassword('');
    } catch (error) {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
       <div className="mb-10 border-b border-slate-200 pb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">Profile Settings</h1>
            <p className="text-slate-500">Manage your account information and preferences.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Sidebar */}
           <div className="col-span-1">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                   <div className="relative mb-4">
                       <img src={user.avatarUrl} alt={user.fullName} className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-md" />
                       <button className="absolute bottom-0 right-0 bg-amber-900 text-white p-2 rounded-full shadow-md hover:bg-amber-800 transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </button>
                   </div>
                   <h2 className="text-xl font-bold text-slate-900 mb-1">{user.fullName}</h2>
                   <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                   <div className="w-full border-t border-slate-100 pt-4 mt-2 text-left">
                       <div className="flex justify-between text-sm mb-2">
                           <span className="text-slate-500">Member Since</span>
                           <span className="font-medium text-slate-700">{new Date(user.joinedDate).getFullYear()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Account Type</span>
                           <span className="font-medium text-slate-700 capitalize">{user.provider}</span>
                       </div>
                   </div>
               </div>
           </div>

           {/* Main Form */}
           <div className="col-span-1 md:col-span-2">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold text-slate-900 font-serif">Personal Information</h3>
                       <button 
                         type="button" 
                         onClick={() => setIsEditing(!isEditing)}
                         className="text-amber-900 text-sm font-bold hover:underline"
                       >
                           {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                       </button>
                   </div>

                   {message.text && (
                       <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                           {message.text}
                       </div>
                   )}

                   <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Full Name</label>
                               <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-amber-900 focus:ring-2 focus:ring-amber-900/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address</label>
                               <input 
                                    type="email" 
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                               />
                           </div>
                       </div>

                       {isEditing && user.provider === 'email' && (
                           <div className="border-t border-slate-100 pt-6 mt-6">
                               <h4 className="text-sm font-bold text-slate-900 mb-4">Change Password</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div>
                                       <label className="block text-xs font-bold uppercase text-slate-500 mb-2">New Password</label>
                                       <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-amber-900 focus:ring-2 focus:ring-amber-900/10 outline-none transition-all"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Confirm Password</label>
                                       <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-amber-900 focus:ring-2 focus:ring-amber-900/10 outline-none transition-all"
                                       />
                                   </div>
                               </div>
                           </div>
                       )}

                       {isEditing && (
                           <div className="pt-4 flex justify-end">
                               <button 
                                type="submit"
                                disabled={isLoading}
                                className="bg-amber-900 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-70"
                               >
                                   {isLoading ? 'Saving...' : 'Save Changes'}
                               </button>
                           </div>
                       )}
                   </form>
               </div>
           </div>
       </div>
    </div>
  );
};
