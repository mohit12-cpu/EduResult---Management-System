
import React, { useState, useEffect } from 'react';
import { INITIAL_DB } from './constants';
import { Database, User, UserRole } from './types';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import StudentPortal from './pages/Student/StudentPortal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [db, setDb] = useState<Database>(() => {
    const saved = localStorage.getItem('edu_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.settings) parsed.settings = INITIAL_DB.settings;
        return parsed;
      } catch (e) {
        return INITIAL_DB;
      }
    }
    return INITIAL_DB;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edu_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('edu_db', JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    localStorage.setItem('edu_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
  };

  const updateDb = (fn: (prev: Database) => Database) => {
    setDb(fn);
  };

  const navigateTo = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} db={db} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Desktop & Mobile overlay */}
      <div className={`
        fixed inset-0 z-40 md:relative md:inset-auto md:z-0 transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex h-full">
          <Sidebar 
            user={currentUser} 
            onLogout={handleLogout} 
            activeView={activeView} 
            setActiveView={navigateTo} 
          />
          {/* Backdrop for mobile */}
          <div 
            className={`md:hidden flex-1 bg-black/20 backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          user={currentUser} 
          onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {currentUser.role === UserRole.ADMIN && (
              <AdminDashboard db={db} setDb={updateDb} forcedTab={activeView} />
            )}
            {currentUser.role === UserRole.TEACHER && (
              <TeacherDashboard db={db} teacherId={currentUser.id} setDb={updateDb} forcedTab={activeView} />
            )}
            {currentUser.role === UserRole.STUDENT && (
              <StudentPortal db={db} studentId={currentUser.id} forcedTab={activeView} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;