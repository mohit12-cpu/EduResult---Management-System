
import React, { useState, useEffect } from 'react';
import { Database, Student, Teacher, Subject, UserRole, User } from '../../types';

interface AdminDashboardProps {
  db: Database;
  setDb: (fn: (prev: Database) => Database) => void;
  forcedTab?: string;
}

const StatCard: React.FC<{ label: string; value: string | number; color: 'indigo' | 'emerald' | 'amber' | 'rose' }> = ({ label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };
  
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} shadow-sm transition-all hover:shadow-md`}>
      <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-scaleIn">
      <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50/50">
        <h3 className="text-xl font-black text-slate-800">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="px-8 py-8 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ db, setDb, forcedTab }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'subjects'>('dashboard');
  const [modalType, setModalType] = useState<'none' | 'student' | 'teacher' | 'subject' | 'assign' | 'edit_student' | 'edit_teacher' | 'edit_subject'>('none');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tempSubjectIds, setTempSubjectIds] = useState<string[]>([]);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    rollNumber: '',
    classId: db.classes[0]?.id || 'c1',
    code: '',
    maxMarks: '100'
  });

  useEffect(() => {
    const validTabs = ['dashboard', 'students', 'teachers', 'subjects'];
    if (forcedTab && validTabs.includes(forcedTab)) {
      setActiveTab(forcedTab as any);
      setSearchTerm('');
    }
  }, [forcedTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const openAddModal = (type: 'student' | 'teacher' | 'subject') => {
    let initialRoll = '';
    if (type === 'student') {
      const rollNums = db.students.map(s => parseInt(s.rollNumber)).filter(n => !isNaN(n));
      const nextRollNum = rollNums.length > 0 ? Math.max(...rollNums) + 1 : 2024001;
      initialRoll = nextRollNum.toString();
    }

    setFormData({
      name: '',
      email: '',
      username: type === 'student' ? initialRoll : '',
      password: 'password123',
      rollNumber: initialRoll,
      classId: db.classes[0]?.id || 'c1',
      code: '',
      maxMarks: '100'
    });
    setError(null);
    setSelectedId(null);
    setModalType(type);
  };

  const openEditModal = (type: 'student' | 'teacher' | 'subject', entity: any) => {
    setSelectedId(entity.id);
    setError(null);
    
    if (type === 'student') {
      const s = entity as Student;
      setFormData({
        name: s.name,
        email: s.email,
        username: s.username,
        password: '',
        rollNumber: s.rollNumber,
        classId: s.classId,
        code: '',
        maxMarks: '100'
      });
      setModalType('edit_student');
    } else if (type === 'teacher') {
      const t = entity as Teacher;
      setFormData({
        name: t.name,
        email: t.email,
        username: t.username,
        password: '',
        rollNumber: '',
        classId: '',
        code: '',
        maxMarks: '100'
      });
      setModalType('edit_teacher');
    } else if (type === 'subject') {
      const s = entity as Subject;
      setFormData({
        name: s.name,
        email: '',
        username: '',
        password: '',
        rollNumber: '',
        classId: '',
        code: s.code,
        maxMarks: s.maxMarks.toString()
      });
      setModalType('edit_subject');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEditing = modalType.startsWith('edit_');
    
    // Username duplicate check (excluding self during edit)
    if (modalType !== 'subject' && modalType !== 'edit_subject') {
      const isUsernameTaken = db.users.some(u => 
        u.username.toLowerCase() === formData.username.toLowerCase() && 
        u.id !== selectedId
      );
      if (isUsernameTaken) {
        setError('Username or Roll Number is already assigned.');
        return;
      }
    }

    setDb(prev => {
      let newState = { ...prev };

      if (modalType === 'student' || modalType === 'edit_student') {
        if (modalType === 'edit_student') {
          newState.students = prev.students.map(s => s.id === selectedId ? {
            ...s, name: formData.name, email: formData.email, username: formData.username, rollNumber: formData.rollNumber, classId: formData.classId
          } : s);
          newState.users = prev.users.map(u => u.id === selectedId ? {
            ...u, name: formData.name, email: formData.email, username: formData.username,
            ...(formData.password ? { password: formData.password } : {})
          } : u);
        } else {
          const newId = `std_${Date.now()}`;
          const newStudent: Student = {
            id: newId, name: formData.name, email: formData.email, username: formData.username, password: formData.password, role: UserRole.STUDENT, rollNumber: formData.rollNumber, classId: formData.classId
          };
          newState.students = [...prev.students, newStudent];
          newState.users = [...prev.users, newStudent];
        }
      } else if (modalType === 'teacher' || modalType === 'edit_teacher') {
        if (modalType === 'edit_teacher') {
          newState.teachers = prev.teachers.map(t => t.id === selectedId ? {
            ...t, name: formData.name, email: formData.email, username: formData.username
          } : t);
          newState.users = prev.users.map(u => u.id === selectedId ? {
            ...u, name: formData.name, email: formData.email, username: formData.username,
            ...(formData.password ? { password: formData.password } : {})
          } : u);
        } else {
          const newId = `tch_${Date.now()}`;
          const newTeacher: Teacher = {
            id: newId, name: formData.name, email: formData.email, username: formData.username, password: formData.password, role: UserRole.TEACHER, subjectIds: []
          };
          newState.teachers = [...prev.teachers, newTeacher];
          newState.users = [...prev.users, newTeacher];
        }
      } else if (modalType === 'subject' || modalType === 'edit_subject') {
        if (modalType === 'edit_subject') {
          newState.subjects = prev.subjects.map(s => s.id === selectedId ? {
            ...s, name: formData.name, code: formData.code, maxMarks: parseInt(formData.maxMarks)
          } : s);
        } else {
          const newSub: Subject = {
            id: `sub_${Date.now()}`, name: formData.name, code: formData.code, maxMarks: parseInt(formData.maxMarks)
          };
          newState.subjects = [...prev.subjects, newSub];
        }
      }

      return newState;
    });

    setModalType('none');
    setSelectedId(null);
  };

  const deleteRecord = (type: 'student' | 'teacher' | 'subject', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setDb(prev => {
      const newState = { ...prev };
      if (type === 'student') {
        newState.students = prev.students.filter(s => s.id !== id);
        newState.users = prev.users.filter(u => u.id !== id);
        newState.marks = prev.marks.filter(m => m.studentId !== id);
        newState.attendance = prev.attendance.filter(a => a.studentId !== id);
      } else if (type === 'teacher') {
        newState.teachers = prev.teachers.filter(t => t.id !== id);
        newState.users = prev.users.filter(u => u.id !== id);
      } else if (type === 'subject') {
        newState.subjects = prev.subjects.filter(s => s.id !== id);
        newState.marks = prev.marks.filter(m => m.subjectId !== id);
        newState.teachers = prev.teachers.map(t => ({
          ...t, subjectIds: t.subjectIds.filter(sid => sid !== id)
        }));
        newState.attendance = prev.attendance.filter(a => a.subjectId !== id);
      }
      return newState;
    });
  };

  const openAssignModal = (teacherId: string) => {
    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    setSelectedId(teacherId);
    setTempSubjectIds([...teacher.subjectIds]);
    setSearchTerm('');
    setModalType('assign');
  };

  const saveAssignments = () => {
    if (!selectedId) return;
    setDb(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => t.id === selectedId ? { ...t, subjectIds: tempSubjectIds } : t)
    }));
    setModalType('none');
    setSelectedId(null);
  };

  // Filter Logic
  const filteredStudents = db.students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.includes(searchTerm);
    const matchesClass = classFilter === 'all' || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const filteredTeachers = db.teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSubjects = db.subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={db.students.length} color="indigo" />
        <StatCard label="Active Teachers" value={db.teachers.length} color="emerald" />
        <StatCard label="Subjects" value={db.subjects.length} color="amber" />
        <StatCard label="Public Status" value={db.settings.isResultsPublished ? "ONLINE" : "OFFLINE"} color={db.settings.isResultsPublished ? "emerald" : "rose"} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl border w-fit shadow-sm">
          {(['dashboard', 'students', 'teachers', 'subjects'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-sm font-black capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'dashboard' && (
          <div className="flex flex-1 max-w-md gap-2 w-full">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            {activeTab === 'students' && (
              <select 
                className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-black outline-none"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        )}
      </div>

      {activeTab === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-800">Global Controls</h3>
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">Immediate Override</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Toggles student portal access</p>
                </div>
                <button 
                  onClick={() => setDb(prev => ({ ...prev, settings: { ...prev.settings, isResultsPublished: !prev.settings.isResultsPublished } }))}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${db.settings.isResultsPublished ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-600 text-white shadow-xl hover:bg-emerald-700'}`}
                >
                  {db.settings.isResultsPublished ? 'Go Offline' : 'Go Online'}
                </button>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-700 mb-1">Scheduled Release</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">Set future publication date</p>
                <input 
                  type="datetime-local" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 outline-none"
                  value={db.settings.scheduledPublication || ''}
                  onChange={(e) => setDb(prev => ({ ...prev, settings: { ...prev.settings, scheduledPublication: e.target.value || undefined } }))}
                />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-10 rounded-[40px] text-white shadow-2xl flex flex-col justify-center relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="text-3xl font-black mb-4">Quick Entry</h3>
               <div className="flex gap-4">
                 <button onClick={() => openAddModal('student')} className="flex-1 bg-white/10 hover:bg-white/20 p-6 rounded-3xl border border-white/10 transition-all text-center">
                    <span className="text-3xl block mb-2">🎓</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">New Student</span>
                 </button>
                 <button onClick={() => openAddModal('teacher')} className="flex-1 bg-white/10 hover:bg-white/20 p-6 rounded-3xl border border-white/10 transition-all text-center">
                    <span className="text-3xl block mb-2">👨‍🏫</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">New Teacher</span>
                 </button>
               </div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden animate-fadeIn">
          <div className="border-b bg-slate-50/50 p-8 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-800 text-xl capitalize">{activeTab} Directory</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Managing {
                activeTab === 'students' ? filteredStudents.length : 
                activeTab === 'teachers' ? filteredTeachers.length : 
                filteredSubjects.length
              } Total Records</p>
            </div>
            <button onClick={() => openAddModal(activeTab === 'students' ? 'student' : activeTab === 'teachers' ? 'teacher' : 'subject')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
              + Add {activeTab.slice(0, -1)}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {activeTab === 'students' && (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Roll No</th>
                    <th className="px-8 py-5">Student Information</th>
                    <th className="px-8 py-5">Academic Group</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6 font-black text-indigo-600">{s.rollNumber}</td>
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400 font-bold">{s.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                          {db.classes.find(c => c.id === s.classId)?.name}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button onClick={() => openEditModal('student', s)} className="text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Edit</button>
                        <button onClick={() => deleteRecord('student', s.id)} className="text-rose-500 text-[10px] font-black uppercase hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {activeTab === 'teachers' && (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Instructor</th>
                    <th className="px-8 py-5">Assignments</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{t.name}</p>
                        <p className="text-xs text-slate-400 font-bold">@{t.username} • {t.email}</p>
                      </td>
                      <td className="px-8 py-6 flex flex-wrap gap-2">
                        <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">{t.subjectIds.length} Subjects</span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button onClick={() => openEditModal('teacher', t)} className="text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Profile</button>
                        <button onClick={() => openAssignModal(t.id)} className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all">Map Subjects</button>
                        <button onClick={() => deleteRecord('teacher', t.id)} className="text-rose-500 text-[10px] font-black uppercase hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'subjects' && (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Subject Code</th>
                    <th className="px-8 py-5">Title</th>
                    <th className="px-8 py-5 text-center">Max Marks</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubjects.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="px-8 py-6 font-black text-amber-600">{s.code}</td>
                      <td className="px-8 py-6 font-black text-slate-800">{s.name}</td>
                      <td className="px-8 py-6 text-center font-black text-slate-500">{s.maxMarks}</td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button onClick={() => openEditModal('subject', s)} className="text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Modify</button>
                        <button onClick={() => deleteRecord('subject', s.id)} className="text-rose-500 text-[10px] font-black uppercase hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {modalType !== 'none' && (
        <Modal 
          title={
            modalType === 'assign' ? 'Map Instructor Subjects' : 
            modalType.startsWith('edit_') ? `Edit ${modalType.split('_')[1].charAt(0).toUpperCase() + modalType.split('_')[1].slice(1)}` :
            `Register New ${modalType}`
          } 
          onClose={() => setModalType('none')}
        >
          {modalType === 'assign' ? (
            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Instructor Profile</p>
                  <p className="text-xl font-black">{db.teachers.find(t => t.id === selectedId)?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {db.subjects.map(s => (
                    <label key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${tempSubjectIds.includes(s.id) ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-400 uppercase">{s.code}</span>
                        <span className="font-bold text-sm text-slate-700 leading-tight">{s.name}</span>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded-lg accent-indigo-600" checked={tempSubjectIds.includes(s.id)} onChange={() => setTempSubjectIds(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t flex gap-4">
                <button onClick={() => setModalType('none')} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-sm hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={saveAssignments} className="flex-2 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Save Mapping</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl">{error}</div>}
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Display Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" />
                </div>
                
                {(modalType.includes('student') || modalType.includes('teacher')) && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Email Address</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">{modalType.includes('student') ? 'Roll Number / Username' : 'Username'}</label>
                      <input required type="text" name="username" value={formData.username} onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, username: val, rollNumber: val }));
                      }} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-indigo-600" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Password {modalType.startsWith('edit') && '(Leave empty to keep)'}</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" />
                    </div>
                  </>
                )}

                {modalType.includes('student') && (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Assigned Class</label>
                    <select name="classId" value={formData.classId} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all bg-white font-black text-slate-700">
                      {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {modalType.includes('subject') && (
                  <>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Subject Code</label>
                      <input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-amber-600" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Max Marks</label>
                      <input required type="number" name="maxMarks" value={formData.maxMarks} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-700" />
                    </div>
                  </>
                )}
              </div>
              <div className="pt-6 border-t flex gap-4">
                <button type="button" onClick={() => setModalType('none')} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-sm hover:bg-slate-100 transition-all">Cancel</button>
                <button type="submit" className="flex-2 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  {modalType.startsWith('edit_') ? 'Update Record' : 'Register Entity'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
