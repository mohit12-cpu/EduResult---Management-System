
import { UserRole, Database } from './types';

export const INITIAL_DB: Database = {
  users: [
    { id: '1', name: 'Admin User', role: UserRole.ADMIN, email: 'admin@edu.com', username: 'admin' },
    { id: 't1', name: 'John Smith', role: UserRole.TEACHER, email: 'john@edu.com', username: 'teacher1' },
    { id: 's1', name: 'Alice Johnson', role: UserRole.STUDENT, email: 'alice@edu.com', username: '2024001' },
  ],
  students: [
    { id: 's1', name: 'Alice Johnson', role: UserRole.STUDENT, email: 'alice@edu.com', username: '2024001', classId: 'c1', rollNumber: '2024001' },
  ],
  teachers: [
    { id: 't1', name: 'John Smith', role: UserRole.TEACHER, email: 'john@edu.com', username: 'teacher1', subjectIds: ['sub1', 'sub2'] },
  ],
  subjects: [
    { id: 'sub1', name: 'Mathematics', code: 'MATH101', maxMarks: 100 },
    { id: 'sub2', name: 'Physics', code: 'PHYS101', maxMarks: 100 },
    { id: 'sub3', name: 'Computer Science', code: 'CS101', maxMarks: 100 },
  ],
  classes: [
    { id: 'c1', name: 'Grade 10-A' },
    { id: 'c2', name: 'Grade 10-B' },
  ],
  marks: [
    { studentId: 's1', subjectId: 'sub1', theory: 75, practical: 20, total: 95, grade: 'A+', status: 'PASS' },
    { studentId: 's1', subjectId: 'sub2', theory: 68, practical: 18, total: 86, grade: 'A', status: 'PASS' },
    { studentId: 's1', subjectId: 'sub3', theory: 80, practical: 15, total: 95, grade: 'A+', status: 'PASS' },
  ],
  attendance: [
    { studentId: 's1', classId: 'c1', subjectId: 'sub1', workingDays: 100, presentDays: 92, percentage: 92 },
    { studentId: 's1', classId: 'c1', subjectId: 'sub2', workingDays: 100, presentDays: 85, percentage: 85 }
  ],
  settings: {
    isResultsPublished: true,
    scheduledPublication: undefined
  }
};

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};
