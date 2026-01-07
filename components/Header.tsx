
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleMenu }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 no-print">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMenu}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
            Hello, <span className="text-indigo-600">{user.name.split(' ')[0]}</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-black text-slate-800 leading-none">{user.name}</p>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-1 bg-indigo-50 px-2 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>
        <div className="relative group">
          <div className="h-11 w-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl shadow-indigo-100 text-white font-black group-hover:scale-105 transition-transform cursor-pointer">
            {user.name.charAt(0)}
          </div>
          <div className="absolute right-0 top-full mt-2 w-10 h-10 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg transform scale-50 -mr-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
