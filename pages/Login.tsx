
import React, { useState } from 'react';
import { Database, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  db: Database;
}

const Login: React.FC<LoginProps> = ({ onLogin, db }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Artificial delay for UX feel
    setTimeout(() => {
      const user = db.users.find(u => u.username === username);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Check demo access below.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full -mr-64 -mt-64 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full -ml-48 -mb-48 blur-3xl opacity-50"></div>

      <div className="max-w-md w-full animate-scaleIn relative z-10">
        <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.1)] border border-slate-100 p-10 md:p-12 overflow-hidden relative">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-100 text-white text-3xl font-black">
              E
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">EduResult</h1>
            <p className="text-slate-400 font-semibold text-sm mt-2">Sign in to your academic dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username / ID</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                placeholder="admin, teacher1, or roll number"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black rounded-2xl animate-shake flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3
                ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Sign In Now'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-6">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-3">
              <QuickAccessBtn label="Admin" sub="Full Control" onClick={() => setUsername('admin')} />
              <QuickAccessBtn label="Teacher" sub="Grading" onClick={() => setUsername('teacher1')} />
              <QuickAccessBtn label="Student" sub="Results" onClick={() => setUsername('2024001')} />
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
          Powered by Gemini Intelligence
        </p>
      </div>
    </div>
  );
};

const QuickAccessBtn: React.FC<{ label: string; sub: string; onClick: () => void }> = ({ label, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-2xl border border-slate-100 bg-white hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
  >
    <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{label}</span>
    <span className="text-[8px] font-bold text-slate-400 uppercase opacity-60">{sub}</span>
  </button>
);

export default Login;