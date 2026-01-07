
import React, { useState, useEffect } from 'react';
import { Database, Mark, Subject } from '../../types';
import { calculateGrade } from '../../constants';
import { analyzeStudentResult, getCareerGuidance, AnalysisResponse, CareerGuidance } from '../../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line } from 'recharts';

interface StudentPortalProps {
  db: Database;
  studentId: string;
  forcedTab?: string;
}

const MeritBadge: React.FC<{ title: string; icon: string; description: string; active: boolean }> = ({ title, icon, description, active }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-2 group ${active ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-50 opacity-100 grayscale-0' : 'bg-slate-50 border-slate-100 opacity-40 grayscale pointer-events-none'}`}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${active ? 'bg-indigo-600 shadow-xl shadow-indigo-200' : 'bg-slate-200'}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-800">{title}</p>
      <p className="text-[8px] font-bold text-slate-400 mt-0.5 leading-tight">{description}</p>
    </div>
  </div>
);

const PrintableMarkSheet: React.FC<{ student: any, marks: Mark[], db: Database, totalMax: number, totalObtained: number, percentage: number }> = ({ student, marks, db, totalMax, totalObtained, percentage }) => {
  const academicYear = "2023 - 2024";
  const transcriptId = `EDU-${student.rollNumber}-${Date.now().toString().slice(-6)}`;
  const isOverallPass = marks.every(m => m.status === 'PASS') && percentage >= 40;

  return (
    <div className="hidden print:block p-10 bg-white text-slate-900 min-h-screen">
      <div className="border-[6px] border-double border-slate-900 p-8 h-full relative">
        <div className="text-center mb-10 pb-8 border-b-2 border-slate-900">
          <div className="absolute top-6 left-8 text-left">
            <p className="text-[10px] font-black uppercase text-slate-400">Transcript ID</p>
            <p className="text-xs font-bold font-mono">{transcriptId}</p>
          </div>
          <div className="inline-block w-20 h-20 bg-indigo-950 text-white font-black text-4xl flex items-center justify-center rounded-2xl mb-4 mx-auto shadow-lg">E</div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">EDU-RESULT INTERNATIONAL ACADEMY</h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-600">Official Academic Transcript</p>
          <p className="text-[10px] mt-2 text-slate-400 font-bold uppercase tracking-widest">Global Accreditation Board • ISO 9001:2024 Certified</p>
        </div>
        <div className="absolute top-32 right-12 text-center">
          <div className={`px-6 py-2 border-2 rounded-xl font-black text-sm uppercase tracking-widest ${isOverallPass ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'}`}>
            {isOverallPass ? 'PASS' : 'FAIL'}
          </div>
          <p className="text-[8px] font-black text-slate-400 mt-1 uppercase">Final Result Status</p>
        </div>
        <div className="grid grid-cols-2 gap-12 mb-10 mt-6">
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Candidate Name</p>
              <p className="text-xl font-black text-slate-900">{student.name.toUpperCase()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Roll Number</p>
                <p className="text-sm font-black text-indigo-800">{student.rollNumber}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Academic Grade</p>
                <p className="text-sm font-bold">{db.classes.find(c => c.id === student.classId)?.name}</p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Contact Email</p>
              <p className="text-xs font-medium text-slate-600">{student.email}</p>
            </div>
          </div>
          <div className="text-right space-y-3">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Session</p>
              <p className="text-sm font-black">{academicYear}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date of Examination</p>
              <p className="text-sm font-bold">April - May 2024</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date of Issue</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
        <table className="w-full border-collapse mb-10 border-2 border-slate-900">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
              <th className="border border-slate-900 px-4 py-4 text-left">Subject Code / Title</th>
              <th className="border border-slate-900 px-4 py-4 text-center">Theory</th>
              <th className="border border-slate-900 px-4 py-4 text-center">Practical</th>
              <th className="border border-slate-900 px-4 py-4 text-center">Max Marks</th>
              <th className="border border-slate-900 px-4 py-4 text-center">Obtained</th>
              <th className="border border-slate-900 px-4 py-4 text-center">Grade</th>
              <th className="border border-slate-900 px-4 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m, idx) => {
              const sub = db.subjects.find(s => s.id === m.subjectId);
              return (
                <tr key={idx} className="text-[11px] font-bold text-slate-800">
                  <td className="border border-slate-300 px-4 py-3 bg-slate-50/30">
                    <span className="text-[9px] text-indigo-500 block mb-0.5">{sub?.code}</span>
                    {sub?.name.toUpperCase()}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-center">{m.theory}</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">{m.practical}</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">{sub?.maxMarks}</td>
                  <td className="border border-slate-300 px-4 py-3 text-center font-black">{m.total}</td>
                  <td className="border border-slate-300 px-4 py-3 text-center font-black text-indigo-700">{m.grade}</td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <span className={m.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}>{m.status}</span>
                  </td>
                </tr>
              )
            })}
            <tr className="bg-slate-100 font-black text-xs">
              <td colSpan={3} className="border border-slate-900 px-4 py-4 text-right">AGGREGATE RESULTS</td>
              <td className="border border-slate-900 px-4 py-4 text-center">{totalMax}</td>
              <td className="border border-slate-900 px-4 py-4 text-center bg-slate-900 text-white">{totalObtained}</td>
              <td colSpan={2} className="border border-slate-900 px-4 py-4 text-center text-sm">{percentage.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
        <div className="grid grid-cols-4 gap-8 mt-16 pt-8">
          <div className="text-center col-span-1"><div className="w-20 h-20 bg-slate-100 rounded-lg mx-auto mb-2 flex items-center justify-center border border-slate-200">...</div><p className="text-[7px] font-black uppercase text-slate-400">Verification QR</p></div>
          <div className="text-center flex flex-col justify-end"><div className="border-b border-slate-900 h-12 w-full mx-auto mb-2"></div><p className="text-[9px] font-black uppercase text-slate-500">Class Instructor</p></div>
          <div className="text-center flex flex-col justify-end"><div className="border-b border-slate-900 h-12 w-full mx-auto mb-2"></div><p className="text-[9px] font-black uppercase text-slate-500">Registrar Office</p></div>
          <div className="text-center flex flex-col justify-end"><div className="border-b border-slate-900 h-12 w-full mx-auto mb-2"></div><p className="text-[9px] font-black uppercase text-slate-500">Controller of Exams</p></div>
        </div>
      </div>
    </div>
  );
};

const StudentPortal: React.FC<StudentPortalProps> = ({ db, studentId, forcedTab }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'history' | 'path'>('results');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [career, setCareer] = useState<CareerGuidance | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCareerLoading, setIsCareerLoading] = useState(false);

  const student = db.students.find(s => s.id === studentId);
  const studentMarks = db.marks.filter(m => m.studentId === studentId);
  const studentAttendance = db.attendance.filter(a => a.studentId === studentId);
  
  const avgAttendance = studentAttendance.length > 0 ? studentAttendance.reduce((acc, curr) => acc + curr.percentage, 0) / studentAttendance.length : 0;

  useEffect(() => {
    if (forcedTab === 'dashboard' || forcedTab === 'results') setActiveTab('results');
    if (forcedTab === 'history') setActiveTab('history');
  }, [forcedTab]);

  if (!student) return <div>Student data not found</div>;

  const totalObtained = studentMarks.reduce((acc, m) => acc + m.total, 0);
  const totalMax = studentMarks.reduce((acc, m) => acc + (db.subjects.find(s => s.id === m.subjectId)?.maxMarks || 100), 0);
  const academicPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  // Benchmarking Logic
  const classStudents = db.students.filter(s => s.classId === student.classId);
  const chartData = studentMarks.map(m => {
    const classTotalForSub = db.marks.filter(dm => dm.subjectId === m.subjectId && classStudents.map(cs => cs.id).includes(dm.studentId));
    const classAvg = classTotalForSub.length > 0 ? classTotalForSub.reduce((a, b) => a + b.total, 0) / classTotalForSub.length : 0;
    return {
      name: db.subjects.find(s => s.id === m.subjectId)?.name || 'Unknown',
      score: m.total,
      avg: parseFloat(classAvg.toFixed(1))
    };
  });

  const fetchAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeStudentResult(student.name, studentMarks, db.subjects);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const fetchCareerGuidance = async () => {
    setIsCareerLoading(true);
    try {
      const result = await getCareerGuidance(student.name, studentMarks, db.subjects);
      setCareer(result);
      setActiveTab('path');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCareerLoading(false);
    }
  };

  /* Fixed: Changed 'desc' to 'description' to match MeritBadge props */
  const badges = [
    { title: "Math Whiz", icon: "📐", description: "90+ in Mathematics", active: studentMarks.some(m => db.subjects.find(s => s.id === m.subjectId)?.name === 'Mathematics' && m.total >= 90) },
    { title: "Perfect Attendance", icon: "⏰", description: "100% in any subject", active: studentAttendance.some(a => a.percentage >= 100) },
    { title: "Academic Hero", icon: "🏆", description: "Over 85% aggregate", active: academicPercentage >= 85 },
    { title: "Science Pro", icon: "🧪", description: "Excels in Physics/CS", active: studentMarks.some(m => ['Physics', 'Computer Science'].includes(db.subjects.find(s => s.id === m.subjectId)?.name || '') && m.total >= 80) }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-indigo-50">
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{student.name}</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">ROLL: {student.rollNumber} • {db.classes.find(c => c.id === student.classId)?.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <StatBadge label="Academic" value={`${academicPercentage.toFixed(0)}%`} color="indigo" />
          <StatBadge label="Grade" value={calculateGrade(academicPercentage)} color="emerald" />
          <button onClick={fetchCareerGuidance} disabled={isCareerLoading} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
            {isCareerLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "🚀 Future Path"}
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border w-fit shadow-sm no-print">
        <button onClick={() => setActiveTab('results')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'results' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Overview</button>
        <button onClick={() => setActiveTab('path')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'path' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Career AI</button>
        <button onClick={() => setActiveTab('history')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Attendance</button>
      </div>

      {activeTab === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 no-print">
            <div className="bg-white rounded-3xl border shadow-sm p-10 h-[450px] relative overflow-hidden group">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> Performance Benchmark
                  </h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="text-[10px] font-black text-slate-400">ME</span></div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span className="text-[10px] font-black text-slate-400">PEERS</span></div>
                  </div>
               </div>
               <ResponsiveContainer width="100%" height="80%">
                 <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold'}} />
                    <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={25} />
                    <Line type="monotone" dataKey="avg" stroke="#cbd5e1" strokeWidth={3} dot={{r: 4, fill: '#cbd5e1'}} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[40px] border shadow-sm p-8">
               <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><span>✨</span> Academic Hall of Fame</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((b, i) => <MeritBadge key={i} {...b} />)}
               </div>
            </div>
          </div>

          <div className="space-y-6 no-print">
             <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden min-h-[400px]">
                <div className="relative z-10">
                  <h3 className="font-black text-xl mb-4 flex items-center gap-2"><span>🔮</span> Academic Insights</h3>
                  {!analysis && !isAnalyzing && (
                    <button onClick={fetchAIAnalysis} className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl hover:scale-105 transition-transform">Run Deep Analysis</button>
                  )}
                  {isAnalyzing && <div className="py-20 text-center animate-pulse font-black opacity-50">Consulting Academic Models...</div>}
                  {analysis && (
                    <div className="space-y-6 animate-fadeIn">
                      <p className="text-sm italic leading-relaxed opacity-90">"{analysis.summary}"</p>
                      <div className="space-y-2">
                        {analysis.suggestions.map((s, i) => <div key={i} className="text-[10px] bg-white/10 p-3 rounded-xl border border-white/10 font-bold">✦ {s}</div>)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
             </div>
             
             <div className="bg-white p-8 rounded-[40px] border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transcript Access</p>
                <button onClick={() => window.print()} className="w-full py-4 border-2 border-indigo-600 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                   <span>📄</span> Print Final Marksheet
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'path' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-slate-900 p-12 rounded-[50px] text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl font-black mb-6">AI Career Architect</h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Based on your performance in <span className="text-indigo-400 font-bold">{chartData.length} subjects</span>, 
                  our intelligence models have crafted a personalized roadmap for your professional future.
                </p>
                {career ? (
                  <div className="space-y-8">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-2">Overall Potential</p>
                        <p className="text-xl font-bold italic">"{career.overallPotential}"</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {career.trajectories.map((t, i) => (
                          <div key={i} className="bg-white p-6 rounded-3xl text-slate-900 flex flex-col gap-4 group hover:scale-105 transition-transform">
                             <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">0{i+1}</div>
                             <h4 className="font-black text-lg">{t.title}</h4>
                             <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                             <div className="mt-auto pt-4 border-t border-slate-100">
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-2">Key Focus</p>
                                <div className="flex flex-wrap gap-1">
                                   {t.recommendedSubjects.map((rs, idx) => <span key={idx} className="bg-slate-100 px-2 py-1 rounded-md text-[8px] font-black">{rs}</span>)}
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <button onClick={fetchCareerGuidance} className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl hover:bg-indigo-700 transition-all">Build My Roadmap Now</button>
                )}
             </div>
             <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white p-10 rounded-[40px] border shadow-sm">
           <h3 className="text-xl font-black text-slate-800 mb-8">Attendance Dashboard</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                 <table className="w-full">
                    <thead className="text-[10px] font-black uppercase text-slate-400 border-b">
                       <tr><th className="pb-4 text-left">Subject</th><th className="pb-4 text-center">Ratio</th><th className="pb-4 text-right">Health</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {studentAttendance.map(a => (
                         <tr key={a.subjectId}>
                            <td className="py-5 font-bold text-slate-800">{db.subjects.find(s => s.id === a.subjectId)?.name}</td>
                            <td className="py-5 text-center text-xs font-black text-slate-500">{a.presentDays} / {a.workingDays}</td>
                            <td className="py-5 text-right"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${a.percentage < 75 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{a.percentage}%</span></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                 <p className="text-5xl font-black text-indigo-600">{avgAttendance.toFixed(0)}%</p>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Classroom Presence</p>
                 <div className="w-full h-2 bg-slate-200 rounded-full mt-8 overflow-hidden"><div className="h-full bg-indigo-600" style={{width: `${avgAttendance}%`}}></div></div>
              </div>
           </div>
        </div>
      )}

      <PrintableMarkSheet student={student} marks={studentMarks} db={db} totalMax={totalMax} totalObtained={totalObtained} percentage={academicPercentage} />
    </div>
  );
};

const StatBadge: React.FC<{ label: string; value: string; color: 'indigo' | 'emerald' | 'amber' | 'rose' }> = ({ label, value, color }) => {
  const c = { 
    indigo: 'bg-indigo-50 text-indigo-700', 
    emerald: 'bg-emerald-50 text-emerald-700', 
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700'
  };
  return (
    <div className={`px-5 py-3 rounded-2xl ${c[color]} border border-white/50 text-center min-w-[100px] shadow-sm`}>
      <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
};

export default StudentPortal;
