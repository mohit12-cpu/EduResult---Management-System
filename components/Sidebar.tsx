
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeView, setActiveView }) => {
  return (
    <aside className="w-72 bg-[#0F172A] text-white flex flex-col h-full shadow-2xl relative z-50 no-print">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <span className="text-xl font-bold">E</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">EduResult</h1>
        </div>
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">Academic Cloud</p>
      </div>
      
      <div className="px-6 py-2">
        <div className="h-px bg-slate-800/50 w-full mb-6"></div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <SidebarLink icon="🏠" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>Dashboard</SidebarLink>
        
        {user.role === UserRole.ADMIN && (
          <>
            <div className="mt-8 mb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Management</div>
            <SidebarLink icon="🎓" active={activeView === 'students'} onClick={() => setActiveView('students')}>Students</SidebarLink>
            <SidebarLink icon="👨‍🏫" active={activeView === 'teachers'} onClick={() => setActiveView('teachers')}>Instructors</SidebarLink>
            <SidebarLink icon="📚" active={activeView === 'subjects'} onClick={() => setActiveView('subjects')}>Curriculum</SidebarLink>
          </>
        )}
        
        {user.role === UserRole.TEACHER && (
          <>
            <div className="mt-8 mb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Teaching</div>
            <SidebarLink icon="🖋️" active={activeView === 'entry'} onClick={() => setActiveView('entry')}>Grade Entry</SidebarLink>
            <SidebarLink icon="📅" active={activeView === 'attendance'} onClick={() => setActiveView('attendance')}>Attendance</SidebarLink>
            <SidebarLink icon="📈" active={activeView === 'analysis'} onClick={() => setActiveView('analysis')}>Performance</SidebarLink>
          </>
        )}
        
        {user.role === UserRole.STUDENT && (
          <>
            <div className="mt-8 mb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Hub</div>
            <SidebarLink icon="📄" active={activeView === 'results'} onClick={() => setActiveView('results')}>Marksheets</SidebarLink>
            <SidebarLink icon="🕒" active={activeView === 'history'} onClick={() => setActiveView('history')}>Insights</SidebarLink>
          </>
        )}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-800/40 rounded-2xl p-4 mb-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate opacity-70">{user.role}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all font-bold text-sm group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const SidebarLink: React.FC<{ children: React.ReactNode; icon: string; active?: boolean; onClick: () => void }> = ({ children, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <span className={`text-lg transition-transform ${active ? 'scale-110' : 'opacity-70'}`}>{icon}</span>
    {children}
  </button>
);

export default Sidebar;
