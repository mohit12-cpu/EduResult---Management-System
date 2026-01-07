
import React, { useState, useEffect } from 'react';
import { Database, Mark, Student, Subject, Attendance } from '../../types';
import { calculateGrade } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TeacherDashboardProps {
  db: Database;
  teacherId: string;
  setDb: (fn: (prev: Database) => Database) => void;
  forcedTab?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ db, teacherId, setDb, forcedTab }) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'attendance' | 'analysis'>('entry');
  const teacher = db.teachers.find(t => t.id === teacherId);
  const teacherSubjects = db.subjects.filter(s => teacher?.subjectIds.includes(s.id));
  const [selectedSubjectId, setSelectedSubjectId] = useState(teacherSubjects[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(db.classes[0]?.id || '');
  const [editingMarks, setEditingMarks] = useState<Record<string, { theory: number; practical: number }>>({});
  
  useEffect(() => {
    if (forcedTab === 'dashboard' || forcedTab === 'entry') setActiveTab('entry');
    if (forcedTab === 'attendance') setActiveTab('attendance');
    if (forcedTab === 'analysis') setActiveTab('analysis');
  }, [forcedTab]);

  if (!teacher) return null;

  const currentSubject = db.subjects.find(s => s.id === selectedSubjectId);
  const filteredStudents = db.students.filter(s => s.classId === selectedClassId);
  const subjectMarks = db.marks.filter(m => m.subjectId === selectedSubjectId);
  
  const atRiskStudents = filteredStudents.map(s => {
    const mark = db.marks.find(m => m.studentId === s.id && m.subjectId === selectedSubjectId);
    const attendance = db.attendance.find(a => a.studentId === s.id && a.subjectId === selectedSubjectId);
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    let reasons: string[] = [];

    if (mark && mark.total < 40) { riskLevel = 'high'; reasons.push('Failing Marks'); }
    if (attendance && attendance.percentage < 75) { riskLevel = riskLevel === 'high' ? 'high' : 'medium'; reasons.push('Low Attendance'); }
    if (mark && mark.total >= 40 && mark.total < 50) { riskLevel = riskLevel === 'low' ? 'medium' : riskLevel; reasons.push('Borderline Pass'); }

    return { student: s, riskLevel, reasons };
  }).filter(r => r.riskLevel !== 'low');

  const distributionData = [
    { name: 'A+', count: subjectMarks.filter(m => m.grade === 'A+').length },
    { name: 'A', count: subjectMarks.filter(m => m.grade === 'A').length },
    { name: 'B+', count: subjectMarks.filter(m => m.grade === 'B+').length },
    { name: 'B', count: subjectMarks.filter(m => m.grade === 'B').length },
    { name: 'F', count: subjectMarks.filter(m => m.grade === 'F').length },
  ];

  const handleMarkChange = (studentId: string, type: 'theory' | 'practical', value: string) => {
    let numValue = parseInt(value) || 0;
    const maxT = Math.round((currentSubject?.maxMarks || 100) * 0.7);
    const maxP = (currentSubject?.maxMarks || 100) - maxT;
    const limit = type === 'theory' ? maxT : maxP;
    if (numValue > limit) numValue = limit;
    
    setEditingMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { 
          theory: db.marks.find(m => m.studentId === studentId && m.subjectId === selectedSubjectId)?.theory || 0,
          practical: db.marks.find(m => m.studentId === studentId && m.subjectId === selectedSubjectId)?.practical || 0
        }),
        [type]: numValue
      }
    }));
  };

  const saveMarks = () => {
    setDb(prev => {
      const newMarks = [...prev.marks];
      Object.entries(editingMarks).forEach(([studentId, data]) => {
        const total = data.theory + data.practical;
        const percentage = (total / (currentSubject?.maxMarks || 100)) * 100;
        const entry: Mark = {
          studentId, subjectId: selectedSubjectId, theory: data.theory, practical: data.practical,
          total, grade: calculateGrade(percentage), status: percentage >= 40 ? 'PASS' : 'FAIL'
        };
        const idx = newMarks.findIndex(m => m.studentId === studentId && m.subjectId === selectedSubjectId);
        if (idx > -1) newMarks[idx] = entry; else newMarks.push(entry);
      });
      return { ...prev, marks: newMarks };
    });
    setEditingMarks({});
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex bg-white p-1 rounded-2xl border w-fit shadow-sm no-print">
        <button onClick={() => setActiveTab('entry')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'entry' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Grade Entry</button>
        <button onClick={() => setActiveTab('analysis')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Performance Insights</button>
      </div>

      {activeTab === 'entry' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">📝</div>
               <h3 className="text-xl font-black text-slate-800">{currentSubject?.name} Management</h3>
             </div>
             <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-xl bg-slate-50 font-black text-xs outline-none" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                   {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="px-4 py-2 border rounded-xl bg-slate-50 font-black text-xs outline-none" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                   {teacherSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
          </div>

          <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                   <tr><th className="px-8 py-4">Student</th><th className="px-8 py-4 text-center">Theory</th><th className="px-8 py-4 text-center">Practical</th><th className="px-8 py-4 text-right">Aggregate</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredStudents.map(s => {
                      const m = db.marks.find(dm => dm.studentId === s.id && dm.subjectId === selectedSubjectId);
                      const edited = s.id in editingMarks;
                      const t = edited ? editingMarks[s.id].theory : (m?.theory || 0);
                      const p = edited ? editingMarks[s.id].practical : (m?.practical || 0);
                      return (
                        <tr key={s.id} className={edited ? 'bg-indigo-50/30' : ''}>
                           <td className="px-8 py-6 font-bold text-slate-800">{s.name}<p className="text-[10px] text-slate-400 uppercase tracking-tighter">Roll: {s.rollNumber}</p></td>
                           <td className="px-8 py-6 text-center"><input type="number" className="w-16 px-2 py-1 border rounded-md text-center bg-white" value={t} onChange={e => handleMarkChange(s.id, 'theory', e.target.value)} /></td>
                           <td className="px-8 py-6 text-center"><input type="number" className="w-16 px-2 py-1 border rounded-md text-center bg-white" value={p} onChange={e => handleMarkChange(s.id, 'practical', e.target.value)} /></td>
                           <td className="px-8 py-6 text-right font-black text-indigo-600">{t + p}</td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
             <div className="p-8 bg-slate-50 border-t flex justify-end">
                <button onClick={saveMarks} disabled={Object.keys(editingMarks).length === 0} className="px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl disabled:opacity-30 active:scale-95 transition-all">Submit Updates</button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[40px] border shadow-sm">
                <h4 className="font-black text-slate-800 mb-8 flex items-center gap-2"><span>📊</span> Class Grade Curve</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                       <YAxis hide />
                       <Tooltip cursor={{fill: '#f8fafc'}} />
                       <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                         {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === 'F' ? '#f43f5e' : '#6366f1'} />)}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[40px] border shadow-sm">
                <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2"><span>🚨</span> At-Risk Intelligence</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {atRiskStudents.length > 0 ? atRiskStudents.map((r, i) => (
                     <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:translate-x-1 ${r.riskLevel === 'high' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        <div>
                           <p className="font-black text-sm">{r.student.name}</p>
                           <p className="text-[9px] font-bold uppercase opacity-60">{r.reasons.join(' • ')}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{r.riskLevel} Risk</span>
                     </div>
                   )) : (
                     <div className="py-20 text-center text-slate-300 italic font-bold">Class Health: Optimal. No students at risk.</div>
                   )}
                </div>
                <p className="text-[8px] font-black text-slate-400 mt-4 uppercase text-center tracking-[0.2em]">Based on real-time attendance and academic thresholds</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
